"use client";

import React, { useEffect, useState } from "react";
import { Opportunity } from "@/features/opportunities/models/opportunity";
import { opportunityRepo } from "@/features/opportunities/services/opportunity.repository";
import { OpportunityKanbanBoard } from "@/features/opportunities/components/OpportunityKanbanBoard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { CreateOpportunityDrawer } from "@/features/opportunities/components/CreateOpportunityDrawer";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = opportunityRepo.subscribe(
      [],
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

  return (
    <div className="flex flex-col h-full max-w-[1600px] mx-auto space-y-6">
      <PageHeader
        title="Opportunities"
        description="Manage your commercial printing pipeline."
        actions={
          <Button size="sm" onClick={() => setIsCreateOpen(true)} className="shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Opportunity
          </Button>
        }
      />

      <div className="flex-1 min-h-0 bg-background rounded-xl border shadow-sm flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
          </div>
        ) : (
          <OpportunityKanbanBoard opportunities={opportunities} />
        )}
      </div>

      <CreateOpportunityDrawer 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
    </div>
  );
}
