"use client";

import React, { useEffect, useState } from "react";
import { Job } from "../models/job";
import { jobRepo } from "../services/job.repository";
import { Loader2 } from "lucide-react";
import { formatRelativeTime } from "@/utils/date";

export function CompanyJobsWidget({ organizationId, limit = 5 }: { organizationId: string; limit?: number }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) return;
    const unsubscribe = jobRepo.subscribe(
      [{ field: "organizationId", operator: "==", value: organizationId }],
      { orderBy: "createdAt", orderDirection: "desc", limit },
      (data) => {
        setJobs(data);
        setIsLoading(false);
      },
      console.error
    );
    return () => unsubscribe();
  }, [organizationId, limit]);

  return (
    <div className="bg-card border shadow-sm rounded-xl p-6">
      <div className="flex justify-between items-center mb-4 border-b border-border pb-4">
        <h3 className="font-semibold tracking-tight text-lg">Production Jobs</h3>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : jobs.length === 0 ? (
        <div className="h-16 flex items-center justify-center text-muted-foreground bg-muted/30 rounded-lg text-sm border border-dashed">
          No jobs found for this company.
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="flex justify-between items-center p-3 bg-muted/20 hover:bg-muted/40 rounded-lg border transition-colors cursor-pointer" onClick={() => window.location.href = `/production`}>
              <div>
                <p className="text-sm font-medium">{job.jobNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {job.specifications?.quantity ? `${job.specifications.quantity}x ` : ''} 
                  {job.specifications?.size || 'Misc Job'}
                </p>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <span className="bg-background shadow-sm border px-2 py-0.5 rounded text-[10px] uppercase font-bold text-muted-foreground">
                  {job.status}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatRelativeTime(job.deliveryDeadline as string)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
