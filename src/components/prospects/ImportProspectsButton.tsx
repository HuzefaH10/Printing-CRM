"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, DatabaseZap } from "lucide-react";
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
    if (!confirm("WARNING: This will wipe all existing prospects and replace them with the Master Database. Proceed?")) return;

    setIsImporting(true);
    try {
      // 1. Wipe existing prospects
      console.log("Wiping existing prospects...");
      const existing = await ProspectService.getAllProspects();
      for (const p of existing) {
        if (p.id) {
          await ProspectService.deleteProspect(p.id);
        }
      }
      console.log(`Wiped ${existing.length} old prospects.`);

      // 2. Read new Master Database
      const prospectsMap = new Map<string, Partial<Prospect>>();

      const mergeProspect = (key: string, newData: Partial<Prospect>) => {
        if (prospectsMap.has(key)) {
          console.warn("Duplicate found in master file for:", newData.organizationName);
          // If a duplicate exists in the master file itself, we just overwrite for now or ignore.
          // The user mentioned it's already 94 deduplicated organizations, but we handle it just in case.
        } else {
          prospectsMap.set(key, newData);
        }
      };

      const res = await fetch('/temp-import/Kuwait_Master_Prospect_Database.xlsx');
      if (res.ok) {
        const ab = await res.arrayBuffer();
        const wb = xlsx.read(ab, { type: 'array' });
        const sheet = wb.Sheets['Master Prospects'] || wb.Sheets[wb.SheetNames[0]];
        const data: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        
        // Skip header row
        data.slice(1).forEach(row => {
          if (!row[0]) return;
          const orgName = String(row[0]).trim();
          
          mergeProspect(normalizeName(orgName), {
            organizationName: orgName,
            industry: row[1] ? String(row[1]).trim() : '',
            description: row[2] ? String(row[2]).trim() : '',
            likelyPrintingRequirements: row[3] ? String(row[3]).trim() : '',
            location: row[4] ? String(row[4]).trim() : '',
            website: row[5] ? String(row[5]).trim() : '',
            decisionMakerEmail: row[6] ? String(row[6]).trim() : '',
            decisionMakerPhone: row[7] ? String(row[7]).trim() : '',
            // Procurement Contact (8), Publishing Contact (9), Marketing Contact (10)
            // LinkedIn (11)
            tenderParticipant: row[12] ? String(row[12]).trim().toLowerCase() === 'yes' : false,
            // Confidence (13)
            priority: (row[14] ? String(row[14]).trim() : 'Medium') as any,
            contactVerificationStatus: row[15] ? String(row[15]).trim() : '',
            sourceList: row[16] ? String(row[16]).trim() : '',
            status: 'New',
            source: 'Master Excel Import',
            rating: '****', // Default rating based on old logic, could map to Confidence if needed.
          });
        });
      } else {
        throw new Error("Could not fetch Master Excel file from /temp-import/Kuwait_Master_Prospect_Database.xlsx");
      }

      // 3. Save to Firebase
      const allProspects = Array.from(prospectsMap.values());
      console.log(`Inserting ${allProspects.length} new prospects...`);
      for (const p of allProspects) {
        await ProspectService.createProspect({
          ...p,
          status: p.status || 'New',
        } as Omit<Prospect, 'id'|'createdAt'|'updatedAt'>);
      }

      alert(`Successfully wiped old data and imported ${allProspects.length} master prospects!`);
      onComplete();
    } catch (err: any) {
      console.error(err);
      alert("Error importing: " + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Button onClick={handleImport} disabled={isImporting} className="gap-2" variant="destructive">
      {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <DatabaseZap className="w-4 h-4" />}
      {isImporting ? "Importing Master DB..." : "Replace with Master DB"}
    </Button>
  );
}
