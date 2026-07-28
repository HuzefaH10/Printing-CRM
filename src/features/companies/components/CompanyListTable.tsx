"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Company } from "../models/company";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/utils/currency";
import { formatRelativeTime } from "@/utils/date";

export const companyColumns: ColumnDef<Company>[] = [
  {
    accessorKey: "name",
    header: "Company Name",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold text-foreground">{row.original.name}</span>
        {row.original.industry && (
          <span className="text-xs text-muted-foreground">{row.original.industry}</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {row.original.priority}
      </span>
    ),
  },
  {
    accessorKey: "intelligence.overallScore",
    header: "Intel Score",
    cell: ({ row }) => {
      const score = row.original.intelligence?.overallScore || 0;
      let colorClass = "text-muted-foreground";
      if (score > 70) colorClass = "text-emerald-500 font-bold";
      else if (score > 40) colorClass = "text-amber-500 font-medium";
      else if (score > 0) colorClass = "text-destructive font-medium";
      
      return <div className={`text-center w-full ${colorClass}`}>{score}</div>;
    },
  },
  {
    accessorKey: "location.city",
    header: "Location",
    cell: ({ row }) => {
      const { city, country } = row.original.location || {};
      if (!city && !country) return <span className="text-muted-foreground">-</span>;
      return <span className="text-sm">{[city, country].filter(Boolean).join(", ")}</span>;
    },
  },
  {
    accessorKey: "revenue",
    header: "Est. Revenue",
    cell: ({ row }) => {
      const rev = row.original.revenue;
      return rev ? <span className="text-sm">{formatCurrency(rev, row.original.currency)}</span> : <span className="text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: "relationshipTracker.lastContactAt",
    header: "Last Contact",
    cell: ({ row }) => {
      const lastContact = row.original.relationshipTracker?.lastContactAt;
      return <span className="text-sm">{lastContact ? formatRelativeTime(lastContact) : "Never"}</span>;
    },
  }
];
