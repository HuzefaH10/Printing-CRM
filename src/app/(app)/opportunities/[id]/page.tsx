"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Opportunity } from "@/features/opportunities/models/opportunity";
import { opportunityRepo } from "@/features/opportunities/services/opportunity.repository";
import { OpportunityService } from "@/features/opportunities/services/opportunity.service";
import { formatCurrency } from "@/utils/currency";
import { DollarSign, Percent, Calendar, Factory } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function OpportunityOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuth();
  
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = opportunityRepo.subscribeToDocument(id, (data) => setOpportunity(data), console.error);
    return () => unsubscribe();
  }, [id]);

  if (!opportunity) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  const handleStatusChange = async (newStatus: Opportunity["status"]) => {
    if (newStatus === "Won") {
      if (!window.confirm("Mark as Won? (Job creation happens in Tier 3, not yet built)")) return;
    }
    await OpportunityService.updateStatus(id, newStatus, user?.uid || 'unknown');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Main Details */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-1">{opportunity.title}</h1>
              <p className="text-muted-foreground">{opportunity.organizationId}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={opportunity.status === "Lead" ? "default" : "outline"}
                onClick={() => handleStatusChange("Lead")}
                size="sm"
              >Lead</Button>
              <Button 
                variant={opportunity.status === "Scoping" ? "default" : "outline"}
                onClick={() => handleStatusChange("Scoping")}
                size="sm"
              >Scoping</Button>
              <Button 
                variant={opportunity.status === "Quoted" ? "default" : "outline"}
                onClick={() => handleStatusChange("Quoted")}
                size="sm"
              >Quoted</Button>
              <Button 
                variant={opportunity.status === "Negotiation" ? "default" : "outline"}
                onClick={() => handleStatusChange("Negotiation")}
                size="sm"
              >Negotiation</Button>
              <Button 
                variant={opportunity.status === "Won" ? "default" : "outline"}
                onClick={() => handleStatusChange("Won")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                size="sm"
              >Won</Button>
              <Button 
                variant={opportunity.status === "Lost" ? "default" : "outline"}
                onClick={() => handleStatusChange("Lost")}
                className="bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >Lost</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-muted/30 border rounded-xl p-4">
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><DollarSign className="w-3 h-3"/> Quoted Value</p>
              <p className="text-lg font-bold">{formatCurrency(opportunity.quotedValue || 0)}</p>
            </div>
            <div className="bg-muted/30 border rounded-xl p-4">
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Factory className="w-3 h-3"/> Est. Cost</p>
              <p className="text-lg font-bold">{formatCurrency(opportunity.estimatedCost || 0)}</p>
            </div>
            <div className="bg-muted/30 border rounded-xl p-4">
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Percent className="w-3 h-3"/> Margin</p>
              <p className="text-lg font-bold">
                {opportunity.quotedValue && opportunity.estimatedCost && opportunity.quotedValue > 0
                  ? Math.round(((opportunity.quotedValue - opportunity.estimatedCost) / opportunity.quotedValue) * 100) + '%'
                  : '--'}
              </p>
            </div>
            <div className="bg-muted/30 border rounded-xl p-4">
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Calendar className="w-3 h-3"/> Close Date</p>
              <p className="text-sm font-bold truncate">
                {opportunity.expectedCloseDate ? new Date(opportunity.expectedCloseDate as string).toLocaleDateString() : 'Not Set'}
              </p>
            </div>
          </div>
        </div>

        {/* Specs Table */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 tracking-tight">Printing Specifications</h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div>
              <span className="text-muted-foreground block text-xs">Quantity</span>
              <span className="font-medium">{opportunity.specs?.quantity || '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">Size</span>
              <span className="font-medium">{opportunity.specs?.size || '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">Colors</span>
              <span className="font-medium">{opportunity.specs?.colors || '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">GSM</span>
              <span className="font-medium">{opportunity.specs?.gsm || '-'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground block text-xs">Finishing</span>
              <span className="font-medium">{opportunity.specs?.finishing || '-'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Side Column */}
      <div className="space-y-6">
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 tracking-tight">Cost Breakdown</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between pb-2 border-b">
              <span className="text-muted-foreground">Estimated Cost</span>
              <span className="font-medium">{formatCurrency(opportunity.estimatedCost || 0)}</span>
            </div>
            <div className="flex justify-between pb-2 border-b">
              <span className="text-muted-foreground">Quoted Value</span>
              <span className="font-medium">{formatCurrency(opportunity.quotedValue || 0)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 text-primary">
              <span>Expected Profit</span>
              <span>{formatCurrency((opportunity.quotedValue || 0) - (opportunity.estimatedCost || 0))}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
