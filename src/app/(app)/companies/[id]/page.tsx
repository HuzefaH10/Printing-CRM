"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Company } from "@/features/companies/models/company";
import { companyRepo } from "@/features/companies/services/company.repository";
import { IntelligenceScoreCard } from "@/features/companies/components/IntelligenceScoreCard";
import { PrintingProfileCard } from "@/features/companies/components/PrintingProfileCard";
import { ContactSummaryCard } from "@/features/companies/components/ContactSummaryCard";
import { UpcomingActivitiesWidget } from "@/features/activities/components/UpcomingActivitiesWidget";
import { ActiveOpportunitiesWidget } from "@/features/opportunities/components/ActiveOpportunitiesWidget";
import { Loader2 } from "lucide-react";

export default function CompanyOverviewPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    // We fetch again here because App Router Layouts don't pass data easily without Context.
    // Firebase Client SDK caches this instantly so it's a 0ms operation.
    const unsubscribe = companyRepo.subscribe(
      [{ field: "id", operator: "==", value: id }],
      { limit: 1 },
      (data) => {
        if (data.length > 0) setCompany(data[0]);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  if (isLoading || !company) return <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-12">
      {/* Left Column - Intelligence & Vitals */}
      <div className="xl:col-span-1 space-y-6">
        <IntelligenceScoreCard score={company.intelligence} />
        
        <div className="bg-card border shadow-sm rounded-xl p-6">
          <h3 className="font-semibold tracking-tight text-lg mb-4 border-b border-border pb-4">Relationship Tracker</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Health</span>
              <span className={`text-sm font-bold ${
                company.relationshipTracker.health === "EXCELLENT" ? "text-emerald-500" :
                company.relationshipTracker.health === "GOOD" ? "text-emerald-400" :
                company.relationshipTracker.health === "FAIR" ? "text-amber-500" : "text-destructive"
              }`}>{company.relationshipTracker.health}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Response Time</span>
              <span className="text-sm font-medium">{company.relationshipTracker.responseTimeDays} Days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Comm Frequency</span>
              <span className="text-sm font-medium">{company.relationshipTracker.communicationFrequency}</span>
            </div>
          </div>
        </div>

        <ContactSummaryCard companyId={id} />
      </div>

      {/* Right Column - Deep Data */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* NEW: Activities Widget */}
        <UpcomingActivitiesWidget companyId={company.id} limit={4} />

        {/* NEW: Opportunities Widget */}
        <ActiveOpportunitiesWidget companyId={company.id} limit={4} />

        {/* NEW: Quotations Widget */}
        <div className="bg-card border shadow-sm rounded-xl p-6 border-dashed bg-muted/10">
          <h3 className="font-semibold tracking-tight text-lg mb-2">Recent Quotations</h3>
          <p className="text-sm text-muted-foreground mb-4">Quotation Engine Integration Placeholder</p>
          <div className="h-16 flex items-center justify-center text-muted-foreground bg-muted/30 rounded-lg text-sm">
            Company Quotations will appear here.
          </div>
        </div>

        {/* NEW: Production Widget */}
        <div className="bg-card border shadow-sm rounded-xl p-6 border-dashed bg-muted/10">
          <h3 className="font-semibold tracking-tight text-lg mb-2">Production Jobs</h3>
          <p className="text-sm text-muted-foreground mb-4">Production Engine Integration Placeholder</p>
          <div className="h-16 flex items-center justify-center text-muted-foreground bg-muted/30 rounded-lg text-sm">
            Company Production Jobs will appear here.
          </div>
        </div>

        {/* Core Details Panel */}
        <div className="bg-card border shadow-sm rounded-xl p-6">
          <h3 className="font-semibold tracking-tight text-lg mb-4 border-b border-border pb-4">Company Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Legal Name</span>
              <span className="text-sm">{company.legalName || "-"}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Category</span>
              <span className="text-sm">{company.category || "-"}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Tax Number</span>
              <span className="text-sm">{company.taxNumber || "-"}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Employees</span>
              <span className="text-sm">{company.employeeCount ? `${company.employeeCount}+` : "-"}</span>
            </div>
          </div>
          
          <div className="mt-6">
            <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Description</span>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {company.description || "No description provided."}
            </p>
          </div>
        </div>

        <PrintingProfileCard profile={company.printingProfile} currency={company.currency} />
      </div>
    </div>
  );
}
