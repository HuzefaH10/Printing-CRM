"use client";

import React, { useState } from "react";
import { Contact } from "../models/contact";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Building2, Phone, Mail, MapPin, MoreHorizontal, Edit, Trash2, Archive, Star } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ContactListTableProps {
  contacts: Contact[];
  isLoading?: boolean;
}

export function ContactListTable({ contacts, isLoading }: ContactListTableProps) {
  const router = useRouter();

  const columns: ColumnDef<Contact>[] = [
    {
      accessorKey: "firstName",
      header: "Name",
      cell: (info) => {
        const contact = info.row.original;
        const name = `${contact.firstName} ${contact.lastName}`;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
              {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="font-medium flex items-center gap-1">
                {name} 
                {contact.priority === "VIP" && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
              </span>
              <span className="text-xs text-muted-foreground">{contact.jobTitle || "No Title"}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "companyId", // We will eventually join this with Company name, for now just show a placeholder
      header: "Company",
      cell: (info) => {
        return (
          <div className="flex items-center gap-1.5 text-sm">
            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Company Name (Linked)</span>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Contact Details",
      cell: (info) => {
        const contact = info.row.original;
        return (
          <div className="flex flex-col gap-1 text-xs">
            {contact.email && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Mail className="w-3 h-3" />
                <a href={`mailto:${contact.email}`} className="hover:underline">{contact.email}</a>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Phone className="w-3 h-3" />
                <a href={`tel:${contact.phone}`} className="hover:underline">{contact.phone}</a>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "relationshipProfile.decisionAuthority",
      header: "Role / Influence",
      cell: (info) => {
        const contact = info.row.original;
        const auth = contact.relationshipProfile?.decisionAuthority || "Unknown";
        return (
          <Badge variant="outline" className="text-[10px] font-semibold bg-muted/20">
            {auth}
          </Badge>
        );
      }
    },
    {
      accessorKey: "healthScore.overallHealth",
      header: "Health Score",
      cell: (info) => {
        const score = info.row.original.healthScore?.overallHealth || 0;
        let color = "bg-muted text-muted-foreground";
        if (score > 75) color = "bg-emerald-500/10 text-emerald-600";
        else if (score > 40) color = "bg-blue-500/10 text-blue-600";
        else if (score > 0) color = "bg-amber-500/10 text-amber-600";
        
        return (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={`font-mono ${color}`}>
              {score > 0 ? score : "--"}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: (info) => {
        const contact = info.row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/contacts/${contact.id}`)}>
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2 text-muted-foreground" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Archive className="w-4 h-4 mr-2 text-muted-foreground" /> Archive
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 focus:text-red-600">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
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
      data={contacts} 
      searchKey="firstName" 
      onRowClick={(contact) => router.push(`/contacts/${contact.id}`)}
    />
  );
}
