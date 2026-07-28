"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import * as xlsx from "xlsx";
import { ProspectService } from "@/services/prospect.service";
import { Prospect } from "@/types/prospect";

function normalizeName(name: string) {
  if (!name) return '';
  return name.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
}

export function ImportProspectsButton({ onComplete }: { onComplete: () => void }) {
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const prospectsMap = new Map<string, Partial<Prospect>>();

      const mergeProspect = (key: string, newData: Partial<Prospect>) => {
        if (prospectsMap.has(key)) {
          const existing = prospectsMap.get(key)!;
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

      // Fetch and parse FILE 1
      const res1 = await fetch('/temp-import/Kuwait_Printing_Prospects.xlsx');
      if (res1.ok) {
        const ab1 = await res1.arrayBuffer();
        const wb1 = xlsx.read(ab1, { type: 'array' });
        const data1: any[][] = xlsx.utils.sheet_to_json(wb1.Sheets[wb1.SheetNames[0]], { header: 1 });
        data1.forEach(row => {
          if (!row[0]) return;
          const orgName = String(row[0]).trim();
          mergeProspect(normalizeName(orgName), {
            organizationName: orgName,
            industry: row[1] ? String(row[1]).trim() : '',
            description: row[2] ? String(row[2]).trim() : '',
            likelyPrintingRequirements: row[3] ? String(row[3]).trim() : '',
            website: row[4] ? String(row[4]).trim() : '',
            location: row[5] ? String(row[5]).trim() : '',
            priority: (row[12] ? String(row[12]).trim() : 'Medium') as any,
            rating: row[13] ? String(row[13]).trim() : '',
            status: 'New',
            source: 'Excel Import',
          });
        });
      }

      // Fetch and parse FILE 2
      const res2 = await fetch('/temp-import/Kuwait_Commercial_Printing_Prospects.xlsx');
      if (res2.ok) {
        const ab2 = await res2.arrayBuffer();
        const wb2 = xlsx.read(ab2, { type: 'array' });
        const data2: any[][] = xlsx.utils.sheet_to_json(wb2.Sheets[wb2.SheetNames[0]], { header: 1 });
        data2.forEach(row => {
          if (!row[0]) return;
          const orgName = String(row[0]).trim();
          mergeProspect(normalizeName(orgName), {
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
            source: 'Excel Import',
          });
        });
      }

      // Save to Firebase
      const allProspects = Array.from(prospectsMap.values());
      for (const p of allProspects) {
        // We do it sequentially to not hammer the client SDK too hard, or use Promise.all
        await ProspectService.createProspect({
          ...p,
          status: p.status || 'New',
        } as Omit<Prospect, 'id'|'createdAt'|'updatedAt'>);
      }

      alert(`Successfully imported ${allProspects.length} prospects!`);
      onComplete();
    } catch (err: any) {
      console.error(err);
      alert("Error importing: " + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Button onClick={handleImport} disabled={isImporting} className="gap-2">
      {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {isImporting ? "Importing..." : "Run Excel Import"}
    </Button>
  );
}
