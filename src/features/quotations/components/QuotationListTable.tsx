"use client";

import React from "react";
import { Quotation } from "../models/quotation";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Building2, MoreHorizontal, Edit, Trash2, FileText, CheckCircle2, Archive, Target } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { formatRelativeTime } from "@/utils/date";

interface QuotationListTableProps {
  quotations: Quotation[];
  isLoading?: boolean;
}

export function QuotationListTable({ quotations, isLoading }: QuotationListTableProps) {
  const router = useRouter();

  const columns: ColumnDef<Quotation>[] = [
    {
      accessorKey: "quotationNumber",
      header: "Quote #",
      cell: (info) => {
        const quote = info.row.original;
        return (
          <div className="flex flex-col">
            <span className="font-bold text-sm flex items-center gap-2">
              {quote.quotationNumber}
              {quote.revisionNumber > 0 && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 bg-muted">v{quote.revisionNumber}</Badge>
              )}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[150px]">{quote.title}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "companyId", // We'll later fetch company names, but for now we just show a generic label
      header: "Client & Opportunity",
      cell: (info) => {
        return (
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 hover:text-primary cursor-pointer">
              <Building2 className="w-3 h-3" /> Company Link
            </div>
            <div className="flex items-center gap-1.5 hover:text-primary cursor-pointer">
              <Target className="w-3 h-3" /> Opportunity Link
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
          case "Draft": color = "bg-slate-500/10 text-slate-600"; break;
          case "Internal Review": color = "bg-purple-500/10 text-purple-600"; break;
          case "Approved": color = "bg-blue-500/10 text-blue-600"; break;
          case "Sent": color = "bg-indigo-500/10 text-indigo-600"; break;
          case "Accepted": color = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"; break;
          case "Rejected": color = "bg-red-500/10 text-red-600"; break;
          case "Expired": color = "bg-amber-500/10 text-amber-600"; break;
        }

        return <Badge className={`${color} font-medium tracking-wide shadow-none border`} variant="outline">{status}</Badge>;
      }
    },
    {
      accessorKey: "grandTotal",
      header: "Total Value",
      cell: (info) => {
        const val = info.getValue() as number;
        const currency = info.row.original.currency || "USD";
        return (
          <div className="font-mono text-sm font-semibold">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val || 0)}
          </div>
        );
      }
    },
    {
      accessorKey: "issueDate",
      header: "Issue Date",
      cell: (info) => {
        const val = info.getValue() as string;
        if (!val) return <span className="text-muted-foreground text-xs">Not issued</span>;
        return <span className="text-sm">{formatRelativeTime(val)}</span>;
      }
    },
    {
      id: "actions",
      cell: (info) => {
        const quote = info.row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/quotations/${quote.id}`)}>
                <FileText className="w-4 h-4 mr-2 text-muted-foreground" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2 text-muted-foreground" /> Edit Draft
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" /> Mark Accepted
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Archive className="w-4 h-4 mr-2 text-muted-foreground" /> Archive
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
      data={quotations} 
      searchKey="quotationNumber" 
      onRowClick={(quote) => router.push(`/quotations/${quote.id}`)}
    />
  );
}
