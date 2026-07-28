"use client";

import React, { useEffect, useState } from "react";
import { Job } from "@/features/jobs/models/job";
import { jobRepo } from "@/features/jobs/services/job.repository";
import { PageHeader } from "@/components/shared/PageHeader";
import { Loader2, AlertCircle } from "lucide-react";
import { JobDetailDrawer } from "@/features/jobs/components/JobDetailDrawer";
import { formatRelativeTime } from "@/utils/date";

export default function ProductionPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = jobRepo.subscribe(
      [{ field: "status", operator: "in", value: ["Prepress", "Proofing", "Production", "Finishing", "Delivery", "Invoiced", "Completed"] }],
      { orderBy: "deliveryDeadline", orderDirection: "asc" },
      (data) => {
        setJobs(data);
        setIsLoading(false);
      },
      (error) => {
        console.error(error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Compute RAG and Artwork Missing Flag
  const getRowStyles = (job: Job) => {
    const now = new Date();
    const deadline = new Date(job.deliveryDeadline as string);
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Missing Artwork Trigger
    if (job.status === "Prepress" && job.artworkStatus === "Pending" && diffDays <= 5) {
      return { 
        bg: "bg-red-500/10 hover:bg-red-500/20", 
        border: "border-red-500/30",
        flagColor: "bg-red-500",
        alert: "Missing Artwork!" 
      };
    }

    if (job.status === "Completed") {
      return { bg: "bg-muted/30 opacity-70", border: "", flagColor: "bg-slate-300", alert: null };
    }

    if (diffDays <= 2) {
      return { bg: "hover:bg-muted/50", border: "", flagColor: "bg-red-500", alert: null };
    } else if (diffDays <= 5) {
      return { bg: "hover:bg-muted/50", border: "", flagColor: "bg-amber-500", alert: null };
    } else {
      return { bg: "hover:bg-muted/50", border: "", flagColor: "bg-emerald-500", alert: null };
    }
  };

  return (
    <div className="flex flex-col h-full max-w-[1600px] mx-auto space-y-6">
      <PageHeader
        title="Production"
        description="Track active jobs and monitor delivery deadlines."
      />

      <div className="flex-1 bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold w-2"></th>
                  <th className="px-6 py-4 font-semibold">Job Number</th>
                  <th className="px-6 py-4 font-semibold">Client</th>
                  <th className="px-6 py-4 font-semibold w-[300px]">Description</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Artwork</th>
                  <th className="px-6 py-4 font-semibold">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobs.map((job) => {
                  const style = getRowStyles(job);
                  return (
                    <tr 
                      key={job.id} 
                      onClick={() => setSelectedJobId(job.id)}
                      className={`${style.bg} cursor-pointer transition-colors`}
                    >
                      <td className="px-6 py-4">
                        <div className={`w-3 h-3 rounded-full ${style.flagColor}`} />
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        {job.jobNumber}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground truncate max-w-[200px]">
                        {job.organizationId}
                      </td>
                      <td className="px-6 py-4 truncate max-w-[300px]">
                        {job.specifications?.quantity ? `${job.specifications.quantity}x ` : ''} 
                        {job.specifications?.size || 'Misc Job'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-background border shadow-sm px-2.5 py-1 rounded-md text-xs font-medium">
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {style.alert ? (
                          <span className="flex items-center text-red-600 font-semibold gap-1 text-xs bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-md">
                            <AlertCircle className="w-3 h-3" />
                            {style.alert}
                          </span>
                        ) : (
                          <span className={`text-xs ${job.artworkStatus === 'Pending' ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {job.artworkStatus}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatRelativeTime(job.deliveryDeadline as string)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {jobs.length === 0 && (
              <div className="p-12 text-center text-muted-foreground border-t border-dashed">
                No active production jobs found.
              </div>
            )}
          </div>
        )}
      </div>

      <JobDetailDrawer
        jobId={selectedJobId}
        open={!!selectedJobId}
        onOpenChange={(o) => !o && setSelectedJobId(null)}
      />
    </div>
  );
}
