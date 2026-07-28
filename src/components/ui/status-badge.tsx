import React from "react";
import { cn } from "@/lib/utils";

export type StatusType = 
  | "ACTIVE" 
  | "INACTIVE" 
  | "ARCHIVED" 
  | "PENDING" 
  | "COMPLETED" 
  | "LOST" 
  | "WON" 
  | "DRAFT"
  | "DANGER"
  | "SUCCESS"
  | "WARNING"
  | "DEFAULT";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType | string;
  label?: string;
  dot?: boolean;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  ACTIVE: { bg: "bg-emerald-500/15", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  SUCCESS: { bg: "bg-emerald-500/15", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  WON: { bg: "bg-emerald-500/15", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  COMPLETED: { bg: "bg-emerald-500/15", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  
  PENDING: { bg: "bg-amber-500/15", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  WARNING: { bg: "bg-amber-500/15", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  DRAFT: { bg: "bg-slate-500/15", text: "text-slate-700 dark:text-slate-400", dot: "bg-slate-500" },
  
  LOST: { bg: "bg-destructive/15", text: "text-destructive", dot: "bg-destructive" },
  DANGER: { bg: "bg-destructive/15", text: "text-destructive", dot: "bg-destructive" },
  INACTIVE: { bg: "bg-destructive/15", text: "text-destructive", dot: "bg-destructive" },
  
  ARCHIVED: { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" },
  DEFAULT: { bg: "bg-secondary", text: "text-secondary-foreground", dot: "bg-foreground" },
};

export function StatusBadge({ status, label, dot = true, className, ...props }: StatusBadgeProps) {
  const normalizedStatus = status.toString().toUpperCase();
  const config = statusConfig[normalizedStatus] || statusConfig.DEFAULT;
  const displayLabel = label || status.toString().charAt(0).toUpperCase() + status.toString().slice(1).toLowerCase();

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-tight",
        config.bg,
        config.text,
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", config.dot)} />
      )}
      {displayLabel}
    </span>
  );
}
