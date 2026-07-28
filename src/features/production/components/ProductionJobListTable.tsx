"use client";

import React from "react";
import { ProductionJob } from "../models/job";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Building2, MoreHorizontal, FileText, CheckCircle2, Play, Pause, Settings, AlertTriangle } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { formatRelativeTime } from "@/utils/date";

interface ProductionJobListTableProps {
  jobs: ProductionJob[];
  isLoading?: boolean;
}

export function ProductionJobListTable({ jobs, isLoading }: ProductionJobListTableProps) {
  const router = useRouter();

  const columns: ColumnDef<ProductionJob>[] = [
    {
      accessorKey: "jobNumber",
      header: "Job #",
      cell: (info) => {
        const job = info.row.original;
        return (
          <div className="flex flex-col">
            <span className="font-bold text-sm flex items-center gap-2">
              {job.jobNumber}
              {job.priority === "Rush" && (
                <Badge variant="destructive" className="text-[9px] px-1 py-0 shadow-none border-red-500">Rush</Badge>
              )}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[150px]">{job.jobName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "companyId", 
      header: "Client & Quote",
      cell: (info) => {
        return (
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 hover:text-primary cursor-pointer">
              <Building2 className="w-3 h-3" /> Company Link
            </div>
            <div className="flex items-center gap-1.5 hover:text-primary cursor-pointer">
              <FileText className="w-3 h-3" /> Quote Link
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => {
        const status = info.getValue() as string;
        let color = "bg-muted text-muted-foreground";
        
        switch (status) {
          case "Waiting": color = "bg-slate-500/10 text-slate-600 border-slate-500/20"; break;
          case "In Prepress": color = "bg-purple-500/10 text-purple-600 border-purple-500/20"; break;
          case "In Printing": color = "bg-blue-500/10 text-blue-600 border-blue-500/20"; break;
          case "In Finishing": color = "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"; break;
          case "In Quality Control": color = "bg-amber-500/10 text-amber-600 border-amber-500/20"; break;
          case "Ready for Dispatch": color = "bg-teal-500/10 text-teal-600 border-teal-500/20"; break;
          case "Delivered": color = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"; break;
          case "Delayed": color = "bg-red-500/10 text-red-600 border-red-500/20"; break;
        }

        return <Badge className={`${color} font-medium tracking-wide shadow-none border`} variant="outline">{status}</Badge>;
      }
    },
    {
      accessorKey: "dueDate",
      header: "Deadline",
      cell: (info) => {
        const val = info.getValue() as string;
        if (!val) return <span className="text-muted-foreground text-xs">Not set</span>;
        
        const isUrgent = new Date(val).getTime() < new Date().getTime() + (48 * 60 * 60 * 1000);
        
        return (
          <div className="flex items-center gap-2">
            {isUrgent && <AlertTriangle className="w-3 h-3 text-red-500" />}
            <span className={`text-sm ${isUrgent ? 'text-red-600 font-medium' : ''}`}>
              {new Date(val).toLocaleDateString()}
            </span>
          </div>
        );
      }
    },
    {
      id: "progress",
      header: "Progress",
      cell: (info) => {
        const job = info.row.original;
        const total = job.stages?.length || 0;
        const completed = job.stages?.filter(s => s.status === "Completed" || s.status === "Skipped").length || 0;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return (
          <div className="w-full min-w-[80px]">
            <div className="flex justify-between text-xs mb-1">
              <span>{percent}%</span>
              <span className="text-muted-foreground">{completed}/{total}</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${percent}%` }}></div>
            </div>
          </div>
        );
      }
    },
    {
      id: "actions",
      cell: (info) => {
        const job = info.row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/production/${job.id}`)}>
                <Settings className="w-4 h-4 mr-2 text-muted-foreground" /> Manage Job
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Play className="w-4 h-4 mr-2 text-blue-600" /> Advance Stage
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Pause className="w-4 h-4 mr-2 text-amber-600" /> Mark Delayed
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" /> Mark Delivered
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable 
      columns={columns} 
      data={jobs} 
      searchKey="jobNumber" 
      onRowClick={(job) => router.push(`/production/${job.id}`)}
    />
  );
}
