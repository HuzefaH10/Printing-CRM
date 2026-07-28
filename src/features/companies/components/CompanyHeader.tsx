import React from "react";
import { Company } from "../models/company";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Globe, MapPin, MoreHorizontal, ExternalLink, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CompanyHeaderProps {
  company: Company;
}

export function CompanyHeader({ company }: CompanyHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
          <StatusBadge status={company.status} />
          {company.priority === "URGENT" || company.priority === "HIGH" ? (
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
              {company.priority}
            </span>
          ) : null}
        </div>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
          {company.industry && (
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />
              {company.industry}
            </span>
          )}
          {company.location?.city && company.location?.country && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {company.location.city}, {company.location.country}
            </span>
          )}
          {company.website && (
            <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
              <Globe className="w-3.5 h-3.5" />
              {company.website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 w-full md:w-auto">
        <Button variant="outline" size="sm" className="hidden sm:flex">
          <Phone className="w-4 h-4 mr-2" />
          Call
        </Button>
        <Button variant="outline" size="sm" className="hidden sm:flex">
          <Mail className="w-4 h-4 mr-2" />
          Email
        </Button>
        <Button size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9 shrink-0">
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Add Note</DropdownMenuItem>
            <DropdownMenuItem>Log Meeting</DropdownMenuItem>
            <DropdownMenuItem>Upload Document</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Share Profile <ExternalLink className="w-4 h-4 ml-auto" /></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Archive Company</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
