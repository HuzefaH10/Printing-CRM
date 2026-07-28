"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { OpportunityService } from "../services/opportunity.service";
import { calculateBaseCost, EstimatorInputs } from "@/lib/estimator";
import { formatCurrency } from "@/utils/currency";

interface CreateOpportunityDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateOpportunityDrawer({ open, onOpenChange }: CreateOpportunityDrawerProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  
  const [inputs, setInputs] = useState<EstimatorInputs>({
    numPlates: 4,
    costPerPlate: 15,
    totalSheets: 1000,
    overageAllowance: 100,
    pricePerSheet: 0.05,
    totalImpressions: 1000,
    pressSpeedPerHour: 5000,
    hourlyPressRate: 150,
    finishingSetupCost: 50,
    finishingPerUnitCost: 0.10,
    quantity: 1000
  });

  const costBreakdown = calculateBaseCost(inputs);

  const handleCreate = async () => {
    if (!title || !organizationId) return;
    setLoading(true);
    try {
      await OpportunityService.createOpportunity({
        title,
        organizationId,
        status: "Lead",
        estimatedCost: costBreakdown.baseCost,
        quotedValue: costBreakdown.baseCost * 1.3, // Example 30% margin
        specs: {
          quantity: inputs.quantity,
        }
      }, user?.uid || "unknown");
      onOpenChange(false);
      setTitle("");
      setOrganizationId("");
    } catch (e) {
      console.error(e);
      alert("Failed to create opportunity");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EstimatorInputs, value: string) => {
    setInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Opportunity</DialogTitle>
          <DialogDescription>Create a new opportunity and estimate costs.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">Basic Info</h3>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. 2026 Annual Report - 500 copies" />
            </div>
            <div className="space-y-2">
              <Label>Organization ID (Manual for now)</Label>
              <Input value={organizationId} onChange={e => setOrganizationId(e.target.value)} placeholder="org_123" />
            </div>
            
            <h3 className="text-sm font-semibold border-b pb-2 mt-6">Estimator Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Quantity</Label>
                <Input type="number" value={inputs.quantity} onChange={e => handleInputChange('quantity', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Num Plates</Label>
                <Input type="number" value={inputs.numPlates} onChange={e => handleInputChange('numPlates', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Total Sheets</Label>
                <Input type="number" value={inputs.totalSheets} onChange={e => handleInputChange('totalSheets', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Total Impressions</Label>
                <Input type="number" value={inputs.totalImpressions} onChange={e => handleInputChange('totalImpressions', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-xl border space-y-4 flex flex-col">
            <h3 className="text-sm font-semibold border-b pb-2">Cost Breakdown</h3>
            <div className="space-y-2 text-sm flex-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Plates Cost:</span>
                <span>{formatCurrency(costBreakdown.platesCost)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Paper Cost:</span>
                <span>{formatCurrency(costBreakdown.paperCost)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Machine Cost:</span>
                <span>{formatCurrency(costBreakdown.machineCost)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Finishing Cost:</span>
                <span>{formatCurrency(costBreakdown.finishingCost)}</span>
              </div>
            </div>
            
            <div className="pt-4 border-t flex justify-between items-center bg-primary/5 p-3 rounded-lg border border-primary/20">
              <span className="font-semibold text-primary">Base Cost</span>
              <span className="text-xl font-bold text-primary">{formatCurrency(costBreakdown.baseCost)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading || !title || !organizationId}>
            {loading ? "Creating..." : "Create Opportunity"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
