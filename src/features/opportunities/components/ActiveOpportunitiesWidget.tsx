"use client";

import React, { useEffect, useState } from "react";
import { Opportunity } from "../models/opportunity";
import { opportunityRepo } from "../services/opportunity.repository";
import { Loader2, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/currency";

interface ActiveOpportunitiesWidgetProps {
  organizationId: string;
}

export function ActiveOpportunitiesWidget({ organizationId }: ActiveOpportunitiesWidgetProps) {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const filters: any[] = [
      { field: "organizationId", operator: "==", value: organizationId },
      { field: "status", operator: "in", value: ["Lead", "Scoping", "Quoted", "Negotiation"] }
    ];

    const unsubscribe = opportunityRepo.subscribe(
      filters,
      { orderBy: "updatedAt", orderDirection: "desc", limit: 5 },
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
  }, [organizationId]);

  if (isLoading) {
    return <div className="p-6 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  }

  if (opportunities.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
        No active opportunities.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {opportunities.map(opp => (
        <div 
          key={opp.id} 
          onClick={() => router.push(`/opportunities/${opp.id}`)}
          className="p-3 bg-card border rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
        >
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-semibold text-sm line-clamp-1">{opp.title}</h4>
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
              {opp.status}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <TrendingUp className="w-3 h-3 text-primary" />
              {formatCurrency(opp.quotedValue || opp.estimatedCost || 0)}
            </span>
            {opp.expectedCloseDate && (
              <span>Close: {new Date(opp.expectedCloseDate as string).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
