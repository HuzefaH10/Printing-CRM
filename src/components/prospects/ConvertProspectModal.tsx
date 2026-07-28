"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Prospect } from "@/types/prospect";
import { ProspectService } from "@/services/prospect.service";
import { Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface ConvertProspectModalProps {
  prospect: Prospect;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ConvertProspectModal({ prospect, isOpen, onClose, onSuccess }: ConvertProspectModalProps) {
  const [companyName, setCompanyName] = useState(prospect.organizationName || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleConvert = async () => {
    setIsSubmitting(true);
    try {
      if (!prospect.id) throw new Error("Missing Prospect ID");
      
      const newCompanyId = await ProspectService.convertToCompany(prospect.id, {
        name: companyName,
        industry: prospect.industry,
        website: prospect.website,
        billingAddress: prospect.location,
        type: 'Prospect Converted',
      });
      
      onSuccess();
      // Optionally redirect to the new company page
      // router.push(`/companies/${newCompanyId}`);
    } catch (e: any) {
      console.error(e);
      alert("Error converting: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-background">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            Convert to Company
          </DialogTitle>
          <DialogDescription>
            This will permanently link the Prospect and create a new Customer Company.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">New Company Name</label>
            <Input 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Corp"
            />
          </div>
          
          <div className="bg-muted/30 p-3 rounded-md border border-border/50 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Data Transferred:</p>
            <p className="text-sm flex items-center gap-2"><ArrowRight className="w-3 h-3 text-primary"/> Industry: {prospect.industry || 'None'}</p>
            <p className="text-sm flex items-center gap-2"><ArrowRight className="w-3 h-3 text-primary"/> Website: {prospect.website || 'None'}</p>
            <p className="text-sm flex items-center gap-2"><ArrowRight className="w-3 h-3 text-primary"/> Location: {prospect.location || 'None'}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleConvert} disabled={isSubmitting || !companyName.trim()}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Conversion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
