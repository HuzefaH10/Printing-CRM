import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { collection, getDocs, setDoc, doc, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import * as xlsx from 'xlsx';
import fs from 'fs';
import { Prospect } from '@/types/prospect';

const FILE_1 = 'C:/Users/HP/Downloads/Kuwait_Printing_Prospects.xlsx';
const FILE_2 = 'C:/Users/HP/Downloads/Kuwait_Commercial_Printing_Prospects.xlsx';

function normalizeName(name: string) {
  if (!name) return '';
  return name.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
}

export async function GET() {
  let fireDb = db;
  if (!fireDb) {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() || "AIzaSyBmRo8zWY1BA8P84OKmGNjP5bRtSuKpyI8",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() || "printco-c34e4.firebaseapp.com",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || "printco-c34e4",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || "printco-c34e4.firebasestorage.app",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() || "556935303171",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() || "1:556935303171:web:2ef2bb709f0989858bbe36",
    };
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    fireDb = getFirestore(app);
  }

  try {
    const prospectsMap = new Map<string, Partial<Prospect>>();

    // Helper to merge prospects
    const mergeProspect = (key: string, newData: Partial<Prospect>) => {
      if (prospectsMap.has(key)) {
        const existing = prospectsMap.get(key)!;
        
        // Merge strategy: Keep existing if truthy, otherwise use new.
        // Exception: For description and requirements, append them if different.
        const mergeText = (oldT?: string, newT?: string) => {
          if (!oldT) return newT;
          if (!newT) return oldT;
          if (oldT.includes(newT) || newT.includes(oldT)) return oldT.length > newT.length ? oldT : newT;
          return `${oldT}\n---\n${newT}`;
        };

        prospectsMap.set(key, {
          ...existing,
          ...newData,
          organizationName: existing.organizationName || newData.organizationName,
          industry: existing.industry || newData.industry,
          description: mergeText(existing.description, newData.description),
          likelyPrintingRequirements: mergeText(existing.likelyPrintingRequirements, newData.likelyPrintingRequirements),
          website: existing.website || newData.website,
          location: existing.location || newData.location,
          priority: existing.priority || newData.priority,
          rating: existing.rating || newData.rating,
          tenderParticipant: existing.tenderParticipant || newData.tenderParticipant,
        });
      } else {
        prospectsMap.set(key, newData);
      }
    };

    // --- FILE 1 ---
    if (fs.existsSync(FILE_1)) {
      const fileBuffer1 = fs.readFileSync(FILE_1);
      const wb1 = xlsx.read(fileBuffer1, { type: 'buffer' });
      const sheet1 = wb1.Sheets[wb1.SheetNames[0]];
      const data1: any[][] = xlsx.utils.sheet_to_json(sheet1, { header: 1 });
      
      data1.forEach(row => {
        if (!row[0]) return;
        const orgName = String(row[0]).trim();
        const key = normalizeName(orgName);
        
        mergeProspect(key, {
          organizationName: orgName,
          industry: row[1] ? String(row[1]).trim() : '',
          description: row[2] ? String(row[2]).trim() : '',
          likelyPrintingRequirements: row[3] ? String(row[3]).trim() : '',
          website: row[4] ? String(row[4]).trim() : '',
          location: row[5] ? String(row[5]).trim() : '',
          priority: (row[12] ? String(row[12]).trim() : 'Medium') as any,
          rating: row[13] ? String(row[13]).trim() : '',
          status: 'New',
          source: 'Initial Import',
        });
      });
    }

    // --- FILE 2 ---
    if (fs.existsSync(FILE_2)) {
      const fileBuffer2 = fs.readFileSync(FILE_2);
      const wb2 = xlsx.read(fileBuffer2, { type: 'buffer' });
      const sheet2 = wb2.Sheets[wb2.SheetNames[0]];
      const data2: any[][] = xlsx.utils.sheet_to_json(sheet2, { header: 1 });
      
      data2.forEach(row => {
        if (!row[0]) return;
        const orgName = String(row[0]).trim();
        const key = normalizeName(orgName);
        
        mergeProspect(key, {
          organizationName: orgName,
          industry: row[1] ? String(row[1]).trim() : '',
          description: row[2] ? String(row[2]).trim() : '',
          likelyPrintingRequirements: row[3] ? String(row[3]).trim() : '',
          location: row[4] ? String(row[4]).trim() : '',
          website: row[5] ? String(row[5]).trim() : '',
          tenderParticipant: row[11] ? String(row[11]).trim().toLowerCase() === 'yes' : false,
          priority: (row[12] ? String(row[12]).trim() : 'Medium') as any,
          rating: row[13] ? String(row[13]).trim() : '',
          status: 'New',
          source: 'Initial Import',
        });
      });
    }

    // Now insert them into Firestore with deduplication logic
    let count = 0;
    const now = new Date().toISOString();
    
    const prospectsRef = collection(fireDb, 'prospects');
    const companiesRef = collection(fireDb, 'companies');
    const auditRef = collection(fireDb, 'auditLogs');
    
    const allProspectsSnap = await getDocs(prospectsRef);
    const allCompaniesSnap = await getDocs(companiesRef);

    const existingProspects = allProspectsSnap.docs.map(d => ({ id: d.id, ref: d.ref, data: d.data(), type: 'prospect' as const }));
    const existingCompanies = allCompaniesSnap.docs.map(d => ({ id: d.id, ref: d.ref, data: d.data(), type: 'company' as const }));
    
    const allExisting = [...existingProspects, ...existingCompanies];

    const promises = Array.from(prospectsMap.entries()).map(async ([key, prospect]) => {
      const newNorm = normalizeName(prospect.organizationName || '');
      
      let conflict = false;
      for (const existing of allExisting) {
        const existName = existing.data.organizationName || existing.data.name || '';
        const existNorm = normalizeName(existName);
        
        if (existNorm && newNorm && (existNorm.includes(newNorm) || newNorm.includes(existNorm))) {
          if (existing.type === 'company' || existing.data.convertedCompanyId || existing.data.status === 'Converted') {
            console.log(`CONFLICT: ${prospect.organizationName} already exists as a Company or Converted Prospect (${existName}). Skipping.`);
            conflict = true;
            break;
          }
          
          if ((existing.data.notes && existing.data.notes.trim() !== '') || existing.data.opportunityId) {
            console.log(`CONFLICT: ${prospect.organizationName} already exists as a Prospect with notes/activity (${existName}). Skipping.`);
            conflict = true;
            break;
          }

          console.log(`DEDUPLICATION: Found matching old prospect ${existName} for ${prospect.organizationName}. Deleting old.`);
          const { deleteDoc, addDoc } = require('firebase/firestore');
          await deleteDoc(existing.ref);
          
          await addDoc(auditRef, {
            action: 'DELETE_FOR_DEDUPLICATION',
            entityType: 'prospect',
            entityId: existing.id,
            details: {
              deletedName: existName,
              replacedByName: prospect.organizationName
            },
            userId: 'system-import',
            timestamp: now,
            createdAt: now
          });
        }
      }

      if (!conflict) {
        const finalProspect = {
          ...prospect,
          status: prospect.status || 'New',
          createdAt: now,
          updatedAt: now,
        };
        
        const newDocRef = doc(collection(fireDb, 'prospects'));
        await setDoc(newDocRef, finalProspect);
        count++;
      }
    });

    await Promise.all(promises);

    return NextResponse.json({ success: true, imported: count, message: `Successfully imported and merged prospects with deduplication.` });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
