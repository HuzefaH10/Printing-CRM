"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Opportunity } from "@/features/opportunities/models/opportunity";
import { opportunityRepo } from "@/features/opportunities/services/opportunity.repository";
import { formatCurrency } from "@/utils/currency";
import { formatRelativeTime } from "@/utils/date";
import { DollarSign, Percent, TrendingUp, AlertTriangle, Calendar, Users, Briefcase } from "lucide-react";

export default function OpportunityOverviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = opportunityRepo.subscribeToDocument(id, (data) => setOpportunity(data), console.error);
    return () => unsubscribe();
  }, [id]);

  if (!opportunity) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Vitals Column */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><DollarSign className="w-3 h-3"/> Revenue</p>
            <p className="text-lg font-bold">{formatCurrency(opportunity.estimatedRevenue, opportunity.currency)}</p>
          </div>
          <div className="bg-card border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Percent className="w-3 h-3"/> Probability</p>
            <p className="text-lg font-bold">{opportunity.probability}%</p>
          </div>
          <div className="bg-card border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><TrendingUp className="w-3 h-3"/> Exp. Margin</p>
            <p className="text-lg font-bold">{opportunity.expectedMargin ? `${opportunity.expectedMargin}%` : '--'}</p>
          </div>
          <div className="bg-card border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Calendar className="w-3 h-3"/> Close Date</p>
            <p className="text-sm font-bold truncate">{opportunity.expectedCloseDate ? formatRelativeTime(opportunity.expectedCloseDate) : 'Not Set'}</p>
          </div>
        </div>

        {/* Intelligence Score */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 tracking-tight flex items-center gap-2">
            Intelligence Score
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col justify-center items-center p-6 bg-muted/30 rounded-full aspect-square max-w-[200px] mx-auto border-8 border-primary/20">
              <span className="text-5xl font-black text-primary">{opportunity.intelligenceScore?.overallWinProbability || 0}%</span>
              <span className="text-xs text-muted-foreground mt-2 font-medium uppercase tracking-widest">Win Prob</span>
            </div>
            <div className="space-y-4 justify-center flex flex-col">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium"><span>Relationship</span><span>{opportunity.intelligenceScore?.relationshipScore || 0}%</span></div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${opportunity.intelligenceScore?.relationshipScore || 0}%` }}></div></div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium"><span>Budget Fit</span><span>{opportunity.intelligenceScore?.budgetScore || 0}%</span></div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${opportunity.intelligenceScore?.budgetScore || 0}%` }}></div></div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium"><span>Urgency</span><span>{opportunity.intelligenceScore?.urgencyScore || 0}%</span></div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-amber-500" style={{ width: `${opportunity.intelligenceScore?.urgencyScore || 0}%` }}></div></div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium"><span>Competition Advantage</span><span>{opportunity.intelligenceScore?.competitionScore || 0}%</span></div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-purple-500" style={{ width: `${opportunity.intelligenceScore?.competitionScore || 0}%` }}></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Column */}
      <div className="space-y-6">
        {/* Quotations */}
        <div className="bg-card border rounded-xl p-6 shadow-sm border-dashed bg-muted/10">
          <h3 className="font-semibold mb-4 tracking-tight">Quotations</h3>
          <p className="text-sm text-muted-foreground mb-4">Quotation Engine Integration Placeholder</p>
          <div className="h-12 flex items-center justify-center text-muted-foreground bg-muted/30 rounded-lg text-sm">
            Opportunity Quotations will appear here.
          </div>
        </div>

        {/* Contacts */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 tracking-tight flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" /> Key Contacts
          </h3>
          {opportunity.contactIds && opportunity.contactIds.length > 0 ? (
            <div className="space-y-3">
              {opportunity.contactIds.map(id => (
                <div key={id} className="text-sm p-2 bg-muted/50 rounded-md border text-muted-foreground">Contact ID: {id}</div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">No contacts linked.</p>
          )}
        </div>

        {/* Risk Assessment */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Risk Assessment
          </h3>
          {opportunity.riskAssessment ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Overall Risk</span>
                <span className={`font-bold ${opportunity.riskAssessment.overallRiskLevel === 'HIGH' ? 'text-red-500' : 'text-emerald-500'}`}>
                  {opportunity.riskAssessment.overallRiskLevel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price Risk</span>
                <span>{opportunity.riskAssessment.priceCompetitionScore}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Risk</span>
                <span>{opportunity.riskAssessment.deliveryRiskScore}/10</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">No risk assessment completed.</p>
          )}
        </div>
      </div>
    </div>
  );
}
