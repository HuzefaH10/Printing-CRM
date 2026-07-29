"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, DatabaseZap, AlertTriangle } from "lucide-react";
import * as xlsx from "xlsx";
import { ProspectService } from "@/services/prospect.service";
import { AuditService } from "@/services/audit.service";
import { Prospect } from "@/types/prospect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

function normalizeName(name: string) {
  if (!name) return '';
  return name.toLowerCase().trim().replace(/company|co\.|holding|llc|& distribution|ltd/g, '').replace(/[^a-z0-9]/g, '');
}

type Conflict = {
  existingProspect: Prospect;
  newData: Partial<Prospect>;
  reason: string;
};

export function ImportProspectsButton({ onComplete }: { onComplete: () => void }) {
  const [isImporting, setIsImporting] = useState(false);
  
  // Conflict Resolution State
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [currentConflictIndex, setCurrentConflictIndex] = useState(0);
  const [resolvedToKeep, setResolvedToKeep] = useState<Partial<Prospect>[]>([]);

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const existing = await ProspectService.getAllProspects();
      const existingMap = new Map<string, Prospect>();
      existing.forEach(p => {
        if (p.organizationName) existingMap.set(normalizeName(p.organizationName), p);
      });

      const toInsert: Partial<Prospect>[] = [];
      const toDelete: string[] = [];
      const foundConflicts: Conflict[] = [];

      // 1. Process Master DB (if we wanted to run it again, but usually we just want to run Market Intel now)
      // Since the user wants to ingest Market Intel, we will fetch and parse Market Intel.
      const res = await fetch('/temp-import/Kuwait_Market_Intelligence.xlsx');
      if (!res.ok) throw new Error("Could not fetch Market Intelligence file.");
      
      const ab = await res.arrayBuffer();
      const wb = xlsx.read(ab, { type: 'array' });
      const sheet = wb.Sheets['Market Intelligence'] || wb.Sheets[wb.SheetNames[0]];
      const data: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      
      // Note: Market Intel doesn't have a header row in the provided format, row 0 is Aafaq.
      data.forEach(row => {
        if (!row[0] || typeof row[0] !== 'string') return;
        const orgName = row[0].trim();
        const normName = normalizeName(orgName);

        const newData: Partial<Prospect> = {
          organizationName: orgName,
          industry: row[1] ? String(row[1]).trim() : '',
          producesPhysicalPrint: row[2] ? String(row[2]).trim() : '',
          outsourcesPrintng: row[3] ? String(row[3]).trim() : '',
          outsourcingStatus: row[4] ? String(row[4]).trim() : '',
          evidenceSource: row[5] ? String(row[5]).trim() : '',
          printingTypesNeeded: row[6] ? String(row[6]).trim() : '',
          printFrequency: row[7] ? String(row[7]).trim() : '',
          tenderProcurementEvidence: row[8] ? String(row[8]).trim() : '',
          contactVerificationStatus: row[9] ? String(row[9]).trim() : '',
          location: row[10] ? String(row[10]).trim() : '',
          website: row[11] ? String(row[11]).trim() : '',
          estimatedOpportunity: row[12] ? String(row[12]).trim() : '',
          priority: normName.includes('aafaq') ? 'Critical' : 'High',
          rating: normName.includes('aafaq') ? '*****' : '***',
          status: 'New',
          source: 'Market Intelligence',
        };

        const existingRecord = existingMap.get(normName);

        if (existingRecord) {
          // Check if "dirty"
          const isDirty = existingRecord.status === 'Converted' || (existingRecord as any).activityCount > 0;
          if (isDirty) {
            foundConflicts.push({
              existingProspect: existingRecord,
              newData,
              reason: `This record is marked as ${existingRecord.status} and may have logged activities.`,
            });
          } else {
            // Clean match -> Delete old, Insert new
            toDelete.push(existingRecord.id!);
            toInsert.push(newData);
            
            // Log Deduplication in background (we don't await this inside the loop to avoid blocking)
            AuditService.logEvent({
              entityId: existingRecord.id!,
              entityType: 'Prospect',
              action: 'DEDUPLICATED_REPLACED',
              userId: 'SYSTEM_IMPORT',
              oldValue: existingRecord,
              newValue: newData,
              reason: `Fuzzy match found on import for ${orgName}`,
            }).catch(console.error);
          }
        } else {
          // No match, just insert
          toInsert.push(newData);
        }
      });

      // Execute clean replacements immediately
      for (const id of toDelete) {
        await ProspectService.deleteProspect(id);
      }
      for (const p of toInsert) {
        await ProspectService.createProspect({ ...p, status: p.status || 'New' } as any);
      }

      if (foundConflicts.length > 0) {
        setConflicts(foundConflicts);
        setCurrentConflictIndex(0);
        setResolvedToKeep([]);
      } else {
        alert(`Successfully imported ${toInsert.length} records. (${toDelete.length} deduplicated)`);
        onComplete();
        setIsImporting(false);
      }
      
    } catch (err: any) {
      console.error(err);
      alert("Error importing: " + err.message);
      setIsImporting(false);
    }
  };

  const handleResolveConflict = async (action: 'replace' | 'skip' | 'keep_both') => {
    const conflict = conflicts[currentConflictIndex];
    
    if (action === 'replace') {
      await ProspectService.deleteProspect(conflict.existingProspect.id!);
      await ProspectService.createProspect({ ...conflict.newData, status: conflict.newData.status || 'New' } as any);
      
      AuditService.logEvent({
        entityId: conflict.existingProspect.id!,
        entityType: 'Prospect',
        action: 'DEDUPLICATED_REPLACED_MANUAL',
        userId: 'USER', // We don't have actual user context here
        oldValue: conflict.existingProspect,
        newValue: conflict.newData,
        reason: 'User explicitly chose to replace dirty record during import conflict',
      }).catch(console.error);
    } else if (action === 'keep_both') {
      await ProspectService.createProspect({ ...conflict.newData, status: conflict.newData.status || 'New' } as any);
    } // If 'skip', we do nothing
    
    const nextIndex = currentConflictIndex + 1;
    if (nextIndex < conflicts.length) {
      setCurrentConflictIndex(nextIndex);
    } else {
      // All resolved
      alert("All conflicts resolved and import finished.");
      setConflicts([]);
      setIsImporting(false);
      onComplete();
    }
  };

  return (
    <>
      <Button onClick={handleImport} disabled={isImporting || conflicts.length > 0} className="gap-2" variant="default">
        {isImporting && conflicts.length === 0 ? <Loader2 className="w-4 h-4 animate-spin" /> : <DatabaseZap className="w-4 h-4" />}
        {isImporting && conflicts.length === 0 ? "Importing..." : "Import Market Intel"}
      </Button>

      <Dialog open={conflicts.length > 0} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" /> Import Conflict ({currentConflictIndex + 1} of {conflicts.length})
            </DialogTitle>
            <DialogDescription>
              We found a match for a record being imported, but the existing record has active work or status changes.
            </DialogDescription>
          </DialogHeader>
          
          {conflicts[currentConflictIndex] && (
            <div className="space-y-4 py-4">
              <div className="bg-muted p-3 rounded-md">
                <p className="font-semibold text-foreground">{conflicts[currentConflictIndex].existingProspect.organizationName}</p>
                <p className="text-sm text-amber-600 mt-1">{conflicts[currentConflictIndex].reason}</p>
              </div>
              <p className="text-sm text-muted-foreground">How would you like to handle this?</p>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => handleResolveConflict('skip')} className="w-full sm:w-auto">
              Skip Import
            </Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="secondary" onClick={() => handleResolveConflict('keep_both')} className="w-full sm:w-auto">
                Keep Both
              </Button>
              <Button variant="destructive" onClick={() => handleResolveConflict('replace')} className="w-full sm:w-auto">
                Replace (Lose Work)
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
