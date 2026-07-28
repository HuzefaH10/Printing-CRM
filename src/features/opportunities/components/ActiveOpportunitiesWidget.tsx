"use client";

import React, { useEffect, useState } from "react";
import { Opportunity } from "../models/opportunity";
import { opportunityRepo } from "../services/opportunity.repository";
import { OpportunityCard } from "./OpportunityCard";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ActiveOpportunitiesWidgetProps {
  companyId?: string;
  limit?: number;
}

export function ActiveOpportunitiesWidget({ companyId, limit = 5 }: ActiveOpportunitiesWidgetProps) {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const filters: any[] = [
      { field: "status", operator: "==", value: "OPEN" }
    ];

    if (companyId) {
      filters.push({ field: "companyId", operator: "==", value: companyId });
    }

    const unsubscribe = opportunityRepo.subscribe(
      filters,
      { orderBy: "updatedAt", orderDirection: "desc", limit },
      (data) => {
        setOpportunities(data);
        setIsLoading(false);
      },
      (error) => {
        console.error(error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [companyId, limit]);

  if (isLoading) {
    return (
      <div className="bg-card border shadow-sm rounded-xl p-6 flex justify-center items-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="bg-card border shadow-sm rounded-xl p-6">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
        <h3 className="font-semibold tracking-tight text-lg">Active Opportunities</h3>
        <button className="text-sm font-medium text-primary hover:underline">View Pipeline</button>
      </div>

      {opportunities.length === 0 ? (
        <div className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded-lg">
          No active opportunities found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map(opp => (
            <OpportunityCard 
              key={opp.id} 
              opportunity={opp} 
              onClick={(id) => router.push(`/opportunities/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
