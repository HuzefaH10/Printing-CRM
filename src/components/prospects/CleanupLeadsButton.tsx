"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, AlertTriangle, ShieldCheck } from "lucide-react";
import { ProspectService } from "@/services/prospect.service";
import { AuditService } from "@/services/audit.service";
import { Prospect } from "@/types/prospect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CleanupLeadsButton({ onComplete }: { onComplete: () => void }) {
  const [isScanning, setIsScanning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [sleepingLeads, setSleepingLeads] = useState<Prospect[]>([]);
  const [protectedCount, setProtectedCount] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const allProspects = await ProspectService.getAllProspects();
      
      const sleeping: Prospect[] = [];
      let protectedLeads = 0;

      for (const p of allProspects) {
        // Condition 1: Missing all 3 contact fields
        const isSleeping = !p.website && !p.decisionMakerEmail && !p.decisionMakerPhone;
        
        if (isSleeping) {
          // Condition 2: Is it protected?
          const isMarketIntel = p.source === 'Market Intelligence' || 
                                p.outsourcingStatus === 'Confirmed' || 
                                p.outsourcingStatus === 'Likely';
          
          const isWorkedOn = p.status !== 'New' || 
                             !!p.notes || 
                             !!p.lastContact || 
                             !!p.convertedCompanyId || 
                             !!p.assignedSalesperson;

          if (isMarketIntel || isWorkedOn) {
            protectedLeads++;
          } else {
            sleeping.push(p);
          }
        }
      }

      setSleepingLeads(sleeping);
      setProtectedCount(protectedLeads);
      setIsDialogOpen(true);
    } catch (err: any) {
      console.error(err);
      alert("Error scanning leads: " + err.message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      let count = 0;
      for (const p of sleepingLeads) {
        if (p.id) {
          await ProspectService.deleteProspect(p.id);
          count++;
          
          // Log deletion
          AuditService.logEvent({
            entityId: p.id,
            entityType: 'Prospect',
            action: 'SLEEPING_LEAD_DELETED',
            userId: 'USER_CLEANUP', // Placeholders, real auth context can be used if available
            oldValue: p,
            reason: 'Removed as unreachable: no email/phone/website on file',
          }).catch(console.error);
        }
      }

      alert(`Successfully deleted ${count} sleeping leads.`);
      setIsDialogOpen(false);
      onComplete();
    } catch (err: any) {
      console.error(err);
      alert("Error deleting leads: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button onClick={handleScan} disabled={isScanning || isDeleting} className="gap-2" variant="outline">
        {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-muted-foreground" />}
        {isScanning ? "Scanning..." : "Clean Sleeping Leads"}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Trash2 className="w-5 h-5 text-destructive" /> Sleeping Leads Cleanup
            </DialogTitle>
            <DialogDescription>
              We found <strong>{sleepingLeads.length}</strong> reachable prospects with no email, phone, or website.
              {protectedCount > 0 && (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 mt-2">
                  <ShieldCheck className="w-4 h-4" /> <strong>{protectedCount}</strong> other leads matched the criteria but were protected from deletion because they have logged activities or are verified top leads.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {sleepingLeads.length > 0 ? (
            <div className="flex-1 min-h-[200px] border rounded-md overflow-hidden my-2">
              <ScrollArea className="h-[300px]">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="px-4 py-2 font-medium">Organization</th>
                      <th className="px-4 py-2 font-medium">Priority</th>
                      <th className="px-4 py-2 font-medium">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sleepingLeads.map(p => (
                      <tr key={p.id} className="hover:bg-muted/50">
                        <td className="px-4 py-2 font-medium">{p.organizationName}</td>
                        <td className="px-4 py-2">{p.priority}</td>
                        <td className="px-4 py-2 text-amber-500">{p.rating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <ShieldCheck className="w-12 h-12 text-emerald-500 mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground">Database is clean</h3>
              <p className="text-muted-foreground mt-1">No sleeping leads found to delete.</p>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:justify-between border-t pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            {sleepingLeads.length > 0 && (
              <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting} className="gap-2">
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                {isDeleting ? "Deleting..." : "Confirm & Delete"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
