import React from "react";
import { Opportunity } from "../models/opportunity";
import { formatCurrency } from "@/utils/currency";
import { formatRelativeTime } from "@/utils/date";
import { Building2, Target, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onClick?: (id: string) => void;
}

export function OpportunityCard({ opportunity, onClick }: OpportunityCardProps) {
  // Determine if overdue or urgent
  const isUrgent = opportunity.urgency === "CRITICAL" || opportunity.urgency === "HIGH";
  
  return (
    <div 
      className="bg-card border shadow-sm rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
      onClick={() => onClick && onClick(opportunity.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-sm tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
          {opportunity.name}
        </h4>
      </div>
      
      <div className="flex items-center text-xs text-muted-foreground mb-3 gap-1">
        <Building2 className="w-3 h-3" />
        <span className="truncate max-w-[150px]">{opportunity.companyId.substring(0, 8)}...</span>
      </div>

      <div className="flex justify-between items-center mb-4">
        <span className="font-bold text-foreground">
          {formatCurrency(opportunity.estimatedRevenue, opportunity.currency)}
        </span>
        <Badge variant={opportunity.probability > 70 ? "default" : opportunity.probability > 30 ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0">
          {opportunity.probability}% Win
        </Badge>
      </div>

      <div className="flex items-center gap-2 mt-2 pt-3 border-t border-border">
        {opportunity.printingCategory && (
          <span className="text-[10px] uppercase font-medium tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
            {opportunity.printingCategory}
          </span>
        )}
        
        {isUrgent && (
          <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-sm">
            <AlertCircle className="w-3 h-3" />
            {opportunity.urgency}
          </span>
        )}
        
        {opportunity.nextActivityAt && (
          <span className="flex items-center gap-1 text-[10px] uppercase font-medium tracking-wider text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-sm ml-auto">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(opportunity.nextActivityAt)}
          </span>
        )}
      </div>
    </div>
  );
}
