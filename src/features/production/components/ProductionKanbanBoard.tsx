"use client";

import React from "react";
import { ProductionJob } from "../models/job";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Printer, Package, CheckCircle2, Factory, Search, FileText } from "lucide-react";
import { formatRelativeTime } from "@/utils/date";

interface KanbanBoardProps {
  jobs: ProductionJob[];
}

export function ProductionKanbanBoard({ jobs }: KanbanBoardProps) {
  const router = useRouter();

  const columns = [
    {
      id: "Waiting",
      title: "Waiting & Prepress",
      icon: <Clock className="w-4 h-4 text-slate-500" />,
      jobs: jobs.filter(j => j.status === "Waiting" || j.status === "In Prepress")
    },
    {
      id: "In Printing",
      title: "Printing",
      icon: <Printer className="w-4 h-4 text-blue-500" />,
      jobs: jobs.filter(j => j.status === "In Printing")
    },
    {
      id: "In Finishing",
      title: "Finishing & QC",
      icon: <Factory className="w-4 h-4 text-indigo-500" />,
      jobs: jobs.filter(j => j.status === "In Finishing" || j.status === "In Quality Control")
    },
    {
      id: "Ready for Dispatch",
      title: "Dispatch",
      icon: <Package className="w-4 h-4 text-teal-500" />,
      jobs: jobs.filter(j => j.status === "Ready for Dispatch")
    }
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
      {columns.map(col => (
        <div key={col.id} className="w-[320px] shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              {col.icon} {col.title}
            </h3>
            <Badge variant="secondary" className="bg-muted/50 text-muted-foreground hover:bg-muted/50">
              {col.jobs.length}
            </Badge>
          </div>

          <div className="bg-muted/30 border border-dashed rounded-lg p-3 flex-1 min-h-[300px] flex flex-col gap-3">
            {col.jobs.map(job => {
              const totalStages = job.stages?.length || 0;
              const completedStages = job.stages?.filter(s => s.status === "Completed" || s.status === "Skipped").length || 0;
              const percent = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
              const isRush = job.priority === "Rush";

              return (
                <Card 
                  key={job.id} 
                  className={`cursor-pointer hover:border-primary/50 transition-colors shadow-sm ${isRush ? 'border-red-500/30' : ''}`}
                  onClick={() => router.push(`/production/${job.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-mono text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <FileText className="w-3 h-3" /> {job.jobNumber}
                      </div>
                      {isRush && (
                        <Badge variant="destructive" className="text-[9px] px-1 py-0 shadow-none">RUSH</Badge>
                      )}
                    </div>
                    
                    <h4 className="font-semibold text-sm leading-tight mb-3 line-clamp-2">{job.jobName}</h4>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{percent}% Complete</span>
                        <span className="font-medium">{completedStages}/{totalStages}</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span>Due: {job.dueDate ? new Date(job.dueDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {col.jobs.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                No jobs
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
