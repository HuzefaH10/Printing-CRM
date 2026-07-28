"use client";

import React from "react";
import { Opportunity } from "../models/opportunity";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/utils/currency";
import { formatRelativeTime } from "@/utils/date";
import { StatusBadge } from "@/components/ui/status-badge";
import { DEFAULT_PIPELINE_STAGES } from "../config/pipeline-stages";
import { useRouter } from "next/navigation";

interface OpportunityListTableProps {
  opportunities: Opportunity[];
  isLoading: boolean;
}

export function OpportunityListTable({ opportunities, isLoading }: OpportunityListTableProps) {
  const router = useRouter();

  const columns: ColumnDef<Opportunity>[] = [
    {
      header: "Opportunity Name",
      accessorKey: "name",
      cell: (info) => (
        <div className="font-medium text-foreground cursor-pointer hover:text-primary transition-colors">
          {info.row.original.name}
        </div>
      ),
    },
    {
      header: "Company",
      accessorKey: "companyId", // In a real app we'd map this to company name
      cell: (info) => <div className="text-muted-foreground">{info.row.original.companyId.substring(0,8)}...</div>
    },
    {
      header: "Stage",
      accessorKey: "stageId",
      cell: (info) => {
        const stage = DEFAULT_PIPELINE_STAGES.find(s => s.id === info.row.original.stageId);
        if (!stage) return <span>Unknown</span>;
        return (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${stage.color}`}>
            {stage.name}
          </span>
        );
      }
    },
    {
      header: "Revenue",
      accessorKey: "estimatedRevenue",
      cell: (info) => <div className="font-semibold">{formatCurrency(info.row.original.estimatedRevenue, info.row.original.currency)}</div>
    },
    {
      header: "Prob.",
      accessorKey: "probability",
      cell: (info) => <div>{info.row.original.probability}%</div>
    },
    {
      header: "Close Date",
      accessorKey: "expectedCloseDate",
      cell: (info) => <div>{info.row.original.expectedCloseDate ? formatRelativeTime(info.row.original.expectedCloseDate) : "-"}</div>
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (info) => <StatusBadge status={info.row.original.status} />
    }
  ];

  const handleRowClick = (row: Opportunity) => {
    router.push(`/opportunities/${row.id}`);
  };

  return (
    <DataTable 
      data={opportunities} 
      columns={columns} 
      isLoading={isLoading} 
      onRowClick={handleRowClick}
      searchKey="name"
      searchPlaceholder="Search opportunities..."
      emptyState={{
        title: "No opportunities found",
        description: "You have no active opportunities matching your criteria."
      }}
    />
  );
}
