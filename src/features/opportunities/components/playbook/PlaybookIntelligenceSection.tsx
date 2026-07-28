import React from "react";
import { OpportunityPlaybook } from "../../models/playbook";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Crosshair, BrainCircuit, Wallet, Sparkles } from "lucide-react";

interface Props {
  playbook: OpportunityPlaybook;
}

export function PlaybookIntelligenceSection({ playbook }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Decision Process */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Decision Making Process
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 bg-muted/20 p-3 rounded-lg border">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Decision Makers</span>
              <p className="text-sm font-medium">{playbook.decisionProcess?.decisionMakers?.join(", ") || "Unknown"}</p>
            </div>
            <div className="space-y-1 bg-muted/20 p-3 rounded-lg border">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Champions</span>
              <p className="text-sm font-medium text-emerald-600">{playbook.decisionProcess?.knownChampions?.join(", ") || "None Identified"}</p>
            </div>
            <div className="space-y-1 bg-muted/20 p-3 rounded-lg border">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Finance Approvers</span>
              <p className="text-sm font-medium">{playbook.decisionProcess?.financeApprovers?.join(", ") || "Unknown"}</p>
            </div>
            <div className="space-y-1 bg-muted/20 p-3 rounded-lg border">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Blockers</span>
              <p className="text-sm font-medium text-red-600">{playbook.decisionProcess?.knownBlockers?.join(", ") || "None Identified"}</p>
            </div>
          </div>
          
          <div className="mt-4 p-4 border border-primary/20 bg-primary/5 rounded-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-primary mb-1">AI Suggestion</p>
                <p className="text-xs text-muted-foreground">
                  You haven't identified any Finance Approvers. Consider asking your champion about the budget approval process in your next meeting.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competitive Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-primary" />
            Competitive Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 bg-muted/20 p-3 rounded-lg border">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Current Printer</span>
              <p className="text-sm font-medium">{playbook.competitiveAnalysis?.currentPrinter || "Unknown"}</p>
            </div>
            <div className="space-y-1 bg-muted/20 p-3 rounded-lg border">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Known Competitors</span>
              <p className="text-sm font-medium">{playbook.competitiveAnalysis?.competitors?.join(", ") || "None Identified"}</p>
            </div>
          </div>

          <div className="space-y-1 bg-muted/20 p-3 rounded-lg border">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Our Competitive Advantages</span>
            <p className="text-sm">{playbook.competitiveAnalysis?.ourCompetitiveAdvantages || "Not defined yet."}</p>
          </div>

          <div className="space-y-1 bg-muted/20 p-3 rounded-lg border">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Potential Risks</span>
            <p className="text-sm">{playbook.competitiveAnalysis?.potentialRisks || "Not defined yet."}</p>
          </div>
        </CardContent>
      </Card>

      {/* Customer Intelligence */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-primary" />
            Customer Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Annual Spend</span>
              <p className="text-sm font-medium">{playbook.customerIntelligence?.estimatedAnnualSpend ? `$${playbook.customerIntelligence.estimatedAnnualSpend.toLocaleString()}` : "Unknown"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Budget Cycle</span>
              <p className="text-sm font-medium">{playbook.customerIntelligence?.budgetCycle || "Unknown"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Vendor Status</span>
              <p className="text-sm font-medium">{playbook.customerIntelligence?.vendorRegistrationStatus || "Unknown"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Preferred Format</span>
              <p className="text-sm font-medium">{playbook.customerIntelligence?.preferredProposalFormat || "Unknown"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
