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
    accessorKey: "contactStatus",
    header: "Outreach",
    cell: ({ row }) => {
      const status = row.original.contactStatus || 'Not Contacted';
      let color = 'text-slate-600 bg-slate-100 dark:bg-slate-800';
      if (status === 'Reached Out') color = 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      if (status === 'Awaiting Response') color = 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
      if (status === 'Response Received') color = 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
      if (status === 'Offer Accepted') color = 'text-emerald-700 bg-emerald-200 dark:bg-emerald-900/50';
      if (status === 'Declined') color = 'text-red-600 bg-red-100 dark:bg-red-900/30';
      if (status === 'Follow-up Later') color = 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      
      const handleChange = async (newVal: string) => {
        // dynamic import or just standard import
        const { companyRepo } = await import('@/features/companies/services/company.repository');
        const updates: any = { contactStatus: newVal };
        if (newVal === 'Reached Out') {
          updates['relationshipTracker.lastContactAt'] = new Date().toISOString();
        }
        await companyRepo.update(row.original.id!, updates, "unknown-user");
      };

      return (
        <div onClick={e => e.stopPropagation()}>
          <select 
            value={status} 
            onChange={(e) => handleChange(e.target.value)}
            className={`px-2 py-0.5 rounded text-xs font-medium border-0 focus:ring-0 ${color}`}
          >
            <option value="Not Contacted">Not Contacted</option>
            <option value="Reached Out">Reached Out</option>
            <option value="Awaiting Response">Awaiting Response</option>
            <option value="Response Received">Response Received</option>
            <option value="Offer Accepted">Offer Accepted</option>
            <option value="Declined">Declined</option>
            <option value="Follow-up Later">Follow-up Later</option>
          </select>
        </div>
      );
    },
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
