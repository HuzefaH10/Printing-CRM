"use client";

import React, { useState } from "react";
import { Opportunity } from "../models/opportunity";
import { DEFAULT_PIPELINE_STAGES } from "../config/pipeline-stages";
import { OpportunityCard } from "./OpportunityCard";
import { formatCurrency } from "@/utils/currency";
import { useRouter } from "next/navigation";

interface OpportunityKanbanBoardProps {
  opportunities: Opportunity[];
}

export function OpportunityKanbanBoard({ opportunities }: OpportunityKanbanBoardProps) {
  const router = useRouter();
  
  // Exclude terminal stages from the main board if we want, or put them at the end.
  const visibleStages = DEFAULT_PIPELINE_STAGES.filter(s => s.id !== "stage_dormant");

  const handleCardClick = (id: string) => {
    router.push(`/opportunities/${id}`);
  };

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4 pt-2 scrollbar-hide">
      {visibleStages.map(stage => {
        const stageOpps = opportunities.filter(o => o.stageId === stage.id);
        const stageValue = stageOpps.reduce((sum, opp) => sum + (opp.estimatedRevenue || 0), 0);

        return (
          <div key={stage.id} className="min-w-[320px] max-w-[320px] bg-muted/40 rounded-xl flex flex-col h-full border border-border/50">
            {/* Column Header */}
            <div className="p-3 border-b border-border/50">
              <div className="flex justify-between items-center mb-2">
                <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stage.color}`}>
                  {stage.name}
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-background border px-1.5 py-0.5 rounded-full">
                  {stageOpps.length}
                </span>
              </div>
              <div className="text-sm font-bold tracking-tight">
                {formatCurrency(stageValue, "USD")}
              </div>
            </div>

            {/* Column Body */}
            <div className="flex-1 overflow-y-auto p-2 space-y-3 scrollbar-hide">
              {stageOpps.map(opp => (
                <OpportunityCard 
                  key={opp.id} 
                  opportunity={opp} 
                  onClick={handleCardClick}
                />
              ))}
              
              {stageOpps.length === 0 && (
                <div className="h-24 border-2 border-dashed border-border/50 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
