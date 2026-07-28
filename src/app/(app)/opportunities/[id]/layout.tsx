"use client";

import React, { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Opportunity } from "@/features/opportunities/models/opportunity";
import { opportunityRepo } from "@/features/opportunities/services/opportunity.repository";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash, Share, ChevronRight, AlertTriangle } from "lucide-react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { DEFAULT_PIPELINE_STAGES } from "@/features/opportunities/config/pipeline-stages";

export default function OpportunityDetailLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const id = params?.id as string;

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const unsubscribe = opportunityRepo.subscribeToDocument(
      id,
      (data) => {
        setOpportunity(data);
        setIsLoading(false);
      },
      (error) => {
        console.error(error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  if (isLoading) {
    return <div className="h-full flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!opportunity) {
    return <div className="h-full flex justify-center items-center text-muted-foreground">Opportunity not found.</div>;
  }

  const TABS = [
    { name: "Overview", href: `/opportunities/${id}` },
    { name: "Playbook", href: `/opportunities/${id}/playbook` },
    { name: "Details", href: `/opportunities/${id}/details` },
    { name: "Timeline", href: `/opportunities/${id}/timeline` },
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <button onClick={() => router.push("/opportunities")} className="hover:text-foreground flex items-center transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Opportunities
          </button>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight">{opportunity.name}</h1>
              <StatusBadge status={opportunity.status} />
              {opportunity.urgency === "CRITICAL" && (
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-red-500 bg-red-500/10 px-2 py-1 rounded-sm">
                  <AlertTriangle className="w-3 h-3" /> CRITICAL URGENCY
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <span className="font-medium text-foreground">{opportunity.companyId}</span>
              <span>•</span>
              <span>{opportunity.printingCategory}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Share className="w-4 h-4 mr-2" /> Share</Button>
            <Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-2" /> Edit</Button>
            <Button variant="destructive" size="sm"><Trash className="w-4 h-4 mr-2" /> Delete</Button>
          </div>
        </div>
      </div>

      {/* Chevron Pipeline Stepper */}
      <div className="flex items-center border bg-card rounded-md overflow-x-auto scrollbar-hide mb-2 shadow-sm">
        {DEFAULT_PIPELINE_STAGES.filter(s => s.id !== "stage_dormant").map((stage, idx, arr) => {
          const isCurrent = opportunity.stageId === stage.id;
          const isPassed = arr.findIndex(s => s.id === stage.id) < arr.findIndex(s => s.id === opportunity.stageId);
          
          return (
            <div 
              key={stage.id} 
              className={`flex items-center py-2 px-4 whitespace-nowrap text-sm font-medium transition-colors
                ${isCurrent ? 'bg-primary/10 text-primary border-b-2 border-primary' : ''}
                ${isPassed ? 'text-muted-foreground bg-muted/30 hover:bg-muted/60 cursor-pointer' : 'text-muted-foreground/50 hover:bg-muted/10 cursor-pointer'}
              `}
              onClick={() => {/* Trigger stage change via service */}}
            >
              {stage.name}
              {idx < arr.length - 1 && <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground/30" />}
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-6">
          {TABS.map(tab => {
            const isActive = pathname === tab.href;
            return (
              <a
                key={tab.name}
                href={tab.href}
                className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                {tab.name}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pt-2 pb-6">
        {children}
      </div>
    </div>
  );
}
