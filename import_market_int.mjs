import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc, deleteDoc, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() || "AIzaSyBmRo8zWY1BA8P84OKmGNjP5bRtSuKpyI8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() || "printco-c34e4.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || "printco-c34e4",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || "printco-c34e4.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() || "556935303171",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() || "1:556935303171:web:2ef2bb709f0989858bbe36",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

function normalizeName(name) {
  if (!name) return '';
  return name.toLowerCase().trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\b(co|company|holding|distribution|inc|llc|ltd|publishing)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function logAudit(action, entityType, entityId, details) {
  const auditRef = collection(db, 'auditLogs');
  await addDoc(auditRef, {
    action,
    entityType,
    entityId,
    details,
    userId: 'system-import',
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString()
  });
}

const newProspects = [
  {
    organizationName: "Aafaq Publishing & Distribution",
    industry: "Publisher - Academic & K-12",
    producesPhysicalPrint: "Yes",
    outsourcesPrintng: "Yes",
    outsourcingStatus: "Confirmed",
    evidenceSource: "Aafaq Holding's own site states it \"has published and printed more than a hundred academic books,\" most taught at Kuwait University and PAAET, plus titles adopted at Qatar University, Dammam University, and Imam University (KSA). Separately runs Aafaq Distribution — official K-12 textbook supplier/bookstore operator for GUST, AUK, and other Kuwait universities.",
    printingTypesNeeded: "Academic/textbook printing (perfect/case bound), possibly exam booklets, catalogues, promotional materials for book fairs",
    printFrequency: "Ongoing/recurring — active publisher with a continuously growing catalogue, not a one-off",
    tenderProcurementEvidence: "None found — private commercial publisher, not a public tenderer. Outreach is direct B2B, not tender-based.",
    contactVerificationStatus: "Verified — WhatsApp/phone +965 6600 4290 (Aafaq Education storefronts), websites aafaqbookstore.com and aafaqdistribution.com, LinkedIn company page (Aafaq Publishing & Distribution Company, HQ Al Rai, Capital Governorate, founded 2008, 11-50 employees)",
    location: "Al Rai, Kuwait",
    website: "https://www.aafaqbookstore.com",
    estimatedOpportunity: "High — a working publisher that already prints books regularly is one of the strongest possible fits for a commercial press; worth a direct outreach call, not just email",
    priority: "Critical", // Maximum value is "Critical" or "High" in ProspectPriority? Wait, the scale says 5-star is Priority "High" or is it? The type says: `export type ProspectPriority = 'Low' | 'Medium' | 'High' | 'Critical';`. The user asked for "the maximum value in the existing priority scale". So "Critical".
    rating: "*****",
    status: "New",
    sourceList: "Market Intelligence",
    source: "Market Intelligence Import"
  },
  {
    organizationName: "Growmore Learning Solutions",
    industry: "Education Curriculum Consulting & Publishing",
    producesPhysicalPrint: "Likely",
    outsourcesPrintng: "Likely",
    outsourcingStatus: "Likely (not fully confirmed)",
    evidenceSource: "Company describes itself as offering \"Educational Curriculum Consulting & Publishing\" with services for \"both traditional print materials and digital e-learning solutions\" across 500+ publisher partners; operates Kuwait's ACK e-bookstore and partnered with University of Bahrain to open a physical book center in 2023. Primarily positioned as a distributor/reseller of already-published books rather than a confirmed commissioner of original print runs — this distinction needs a discovery call to clarify.",
    printingTypesNeeded: "If they do commission custom materials: bespoke curriculum booklets, workbooks, institutional branded print",
    printFrequency: "Unknown — needs discovery call to establish whether they publish custom content requiring a print partner, or only resell existing published books",
    tenderProcurementEvidence: "None found",
    contactVerificationStatus: "Verified — Kuwait office phone +965 9800 3089, LinkedIn (2,500+ followers, active), operates ACK e-bookstore",
    location: "Kuwait (regional HQ; also Bahrain/Qatar/UAE offices)",
    website: "https://kw.linkedin.com/company/growmorelearning",
    estimatedOpportunity: "Medium — real, reachable, education-sector company; opportunity size depends entirely on whether they commission custom print (needs a qualifying call before investing more effort)",
    priority: "High", 
    rating: "***",
    status: "New",
    sourceList: "Market Intelligence",
    source: "Market Intelligence Import"
  }
];

async function importProspects() {
  const prospectsRef = collection(db, 'prospects');
  const companiesRef = collection(db, 'companies');
  
  const allProspectsSnap = await getDocs(prospectsRef);
  const allCompaniesSnap = await getDocs(companiesRef);

  const existingProspects = allProspectsSnap.docs.map(d => ({ id: d.id, ref: d.ref, data: d.data(), type: 'prospect' }));
  const existingCompanies = allCompaniesSnap.docs.map(d => ({ id: d.id, ref: d.ref, data: d.data(), type: 'company' }));
  
  const allExisting = [...existingProspects, ...existingCompanies];

  for (const newP of newProspects) {
    const newNorm = normalizeName(newP.organizationName);
    
    let conflict = false;
    for (const existing of allExisting) {
      const existName = existing.data.organizationName || existing.data.name || '';
      const existNorm = normalizeName(existName);
      
      if (existNorm && newNorm && (existNorm.includes(newNorm) || newNorm.includes(existNorm))) {
        if (existing.type === 'company' || existing.data.convertedCompanyId || existing.data.status === 'Converted') {
          console.log(`CONFLICT: ${newP.organizationName} already exists as a Company or Converted Prospect (${existName}). Flag to user.`);
          conflict = true;
          break;
        }
        
        if ((existing.data.notes && existing.data.notes.trim() !== '') || existing.data.opportunityId) {
          console.log(`CONFLICT: ${newP.organizationName} already exists as a Prospect with notes/activity (${existName}). Flag to user.`);
          conflict = true;
          break;
        }

        console.log(`DEDUPLICATION: Found matching old prospect ${existName} for ${newP.organizationName}. Deleting old.`);
        await deleteDoc(existing.ref);
        
        await logAudit('DELETE_FOR_DEDUPLICATION', 'prospect', existing.id, {
          deletedName: existName,
          replacedByName: newP.organizationName
        });
      }
    }
    
    if (!conflict) {
      const now = new Date().toISOString();
      const finalP = { ...newP, createdAt: now, updatedAt: now };
      
      const newRef = doc(prospectsRef);
      await setDoc(newRef, finalP);
      console.log(`IMPORTED: ${newP.organizationName}`);
      
      await logAudit('IMPORT_PROSPECT', 'prospect', newRef.id, {
        name: newP.organizationName
      });
    }
  }
}

importProspects().then(() => {
  console.log('Import done');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
