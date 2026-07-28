"use client";

import React, { useEffect, useState } from "react";
import { Opportunity } from "@/features/opportunities/models/opportunity";
import { opportunityRepo } from "@/features/opportunities/services/opportunity.repository";
import { OpportunityKanbanBoard } from "@/features/opportunities/components/OpportunityKanbanBoard";
import { OpportunityListTable } from "@/features/opportunities/components/OpportunityListTable";
import { Button } from "@/components/ui/button";
import { Plus, List, LayoutGrid, Filter, DollarSign, Target, Activity } from "lucide-react";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/utils/currency";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"KANBAN" | "LIST">("KANBAN");

  useEffect(() => {
    const unsubscribe = opportunityRepo.subscribe(
      [{ field: "status", operator: "in", value: ["OPEN", "WON", "LOST"] }],
      { orderBy: "updatedAt", orderDirection: "desc", limit: 200 },
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
  }, []);

  const totalValue = opportunities.filter(o => o.status === "OPEN").reduce((sum, opp) => sum + (opp.estimatedRevenue || 0), 0);
  const wonThisMonth = opportunities.filter(o => o.status === "WON").length; // In real app, filter by date
  
  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Opportunities</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your commercial printing pipeline and expected revenue.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted p-1 rounded-md border mr-2">
            <button 
              onClick={() => setViewMode("KANBAN")}
              className={`p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors ${viewMode === 'KANBAN' ? 'bg-background shadow-sm text-foreground' : ''}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode("LIST")}
              className={`p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors ${viewMode === 'LIST' ? 'bg-background shadow-sm text-foreground' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Opportunity
          </Button>
        </div>
      </div>

      {/* Dashboard KPI Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500"><DollarSign className="w-5 h-5" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Pipeline Value</p>
            <h3 className="text-xl font-bold">{formatCurrency(totalValue, "USD")}</h3>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500"><Target className="w-5 h-5" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Active Deals</p>
            <h3 className="text-xl font-bold">{opportunities.filter(o => o.status === "OPEN").length}</h3>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500"><Activity className="w-5 h-5" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Won This Month</p>
            <h3 className="text-xl font-bold">{wonThisMonth}</h3>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col -mx-6 px-6">
        {isLoading ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {viewMode === "KANBAN" ? (
              <OpportunityKanbanBoard opportunities={opportunities.filter(o => o.status === "OPEN")} />
            ) : (
              <OpportunityListTable opportunities={opportunities} isLoading={false} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
