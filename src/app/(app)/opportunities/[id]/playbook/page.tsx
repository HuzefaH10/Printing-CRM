"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { OpportunityPlaybook, PlaybookStep } from "@/features/opportunities/models/playbook";
import { PlaybookService } from "@/features/opportunities/services/playbook.service";
import { opportunityRepo } from "@/features/opportunities/services/opportunity.repository";
import { PlaybookMetricsDashboard } from "@/features/opportunities/components/playbook/PlaybookMetricsDashboard";
import { PlaybookSummarySection } from "@/features/opportunities/components/playbook/PlaybookSummarySection";
import { PlaybookIntelligenceSection } from "@/features/opportunities/components/playbook/PlaybookIntelligenceSection";
import { PlaybookStrategyChecklist } from "@/features/opportunities/components/playbook/PlaybookStrategyChecklist";
import { PlaybookObjectionsManager } from "@/features/opportunities/components/playbook/PlaybookObjectionsManager";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, BrainCircuit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function OpportunityPlaybookPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  
  const [playbook, setPlaybook] = useState<OpportunityPlaybook | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadPlaybook();
  }, [id]);

  const loadPlaybook = async () => {
    setIsLoading(true);
    try {
      const existing = await PlaybookService.getPlaybookByOpportunityId(id);
      setPlaybook(existing);
    } catch (err) {
      console.error("Failed to load playbook", err);
    } finally {
      setIsLoading(false);
    }
  };

  const initializePlaybook = async () => {
    if (!id || !user) return;
    setIsLoading(true);
    try {
      const opp = await opportunityRepo.get(id);
      if (!opp) throw new Error("Opportunity not found");
      const newPb = await PlaybookService.initializePlaybook(id, opp.companyId, undefined, user.uid);
      setPlaybook(newPb);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepChange = async (stepId: string, updates: Partial<PlaybookStep>) => {
    if (!playbook || !user) return;
    const newSteps = playbook.winStrategySteps.map(s => s.id === stepId ? { ...s, ...updates } : s);
    const tempPb = { ...playbook, winStrategySteps: newSteps };
    const newMetrics = PlaybookService.calculateMetrics(tempPb);
    
    // Optimistic update
    setPlaybook({ ...tempPb, successMetrics: newMetrics });

    // Background sync
    await PlaybookService.updatePlaybook(playbook.id, { winStrategySteps: newSteps, successMetrics: newMetrics }, user.uid, "Updated strategy step");
  };

  if (isLoading) {
    return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!playbook) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
          <BrainCircuit className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold">No Playbook Found</h2>
        <p className="text-muted-foreground text-sm">
          A strategic playbook helps you map out the decision makers, analyze competitors, and track the exact steps needed to win this deal.
        </p>
        <div className="flex gap-4 mt-6">
          <Button onClick={initializePlaybook}>
            <Plus className="w-4 h-4 mr-2" /> Start Blank Playbook
          </Button>
          <Button variant="outline" disabled>
            Use Template
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Metrics Row */}
      <PlaybookMetricsDashboard metrics={playbook.successMetrics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          <PlaybookSummarySection playbook={playbook} />
          <PlaybookIntelligenceSection playbook={playbook} />
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          <PlaybookStrategyChecklist playbook={playbook} onStepChange={handleStepChange} />
          <PlaybookObjectionsManager playbook={playbook} />
        </div>
      </div>
    </div>
  );
}
