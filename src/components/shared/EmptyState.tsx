import React from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, primaryAction, secondaryAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-card/20 border-dashed animate-in fade-in duration-500 min-h-[400px]">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-6 ring-8 ring-background">
        <Icon className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-semibold tracking-tight text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-[400px] mb-8 leading-relaxed">
        {description}
      </p>
      
      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-3">
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button onClick={primaryAction.onClick}>
              {primaryAction.icon && <primaryAction.icon className="w-4 h-4 mr-2" />}
              {primaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
