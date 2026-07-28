import React from "react";
import { Badge } from "@/components/ui/badge";

export interface PageHeaderProps {
  title: string;
  description?: string;
  statusBadge?: {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  };
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, statusBadge, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-border/50">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
          {statusBadge && (
            <Badge 
              variant={statusBadge.variant as any} 
              className={statusBadge.variant === "success" ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20" : statusBadge.variant === "warning" ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20" : ""}
            >
              {statusBadge.label}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-muted-foreground mt-2 text-sm">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
