"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type TimelineItemType = "AUDIT" | "NOTE" | "COMMENT" | "ATTACHMENT";

export interface TimelineItem {
  id: string;
  type: TimelineItemType;
  title: string;
  description?: string;
  timestamp: Date;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  metadata?: any;
}

interface UniversalTimelineProps {
  items: TimelineItem[];
  isLoading?: boolean;
}

export function UniversalTimeline({ items, isLoading }: UniversalTimelineProps) {
  if (isLoading) {
    return <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-4">
          <div className="w-8 h-8 bg-muted rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-3 bg-muted rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>;
  }

  if (!items || items.length === 0) {
    return <div className="text-sm text-muted-foreground text-center py-8">No activity yet.</div>;
  }

  return (
    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent">
      {items.map((item) => (
        <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-8 h-8 rounded-full border border-background bg-muted shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
            {item.user ? (
              <Avatar className="h-8 w-8">
                <AvatarImage src={item.user.avatarUrl} />
                <AvatarFallback className="text-[10px]">{item.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}
          </div>
          
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border shadow-sm p-4 rounded-xl relative">
            {/* Arrow */}
            <div className="absolute top-4 -translate-y-1/2 w-3 h-3 bg-card border-l border-t rotate-45 -left-1.5 md:group-even:-left-1.5 md:group-odd:left-auto md:group-odd:-right-1.5 md:group-odd:border-l-0 md:group-odd:border-t-0 md:group-odd:border-r md:group-odd:border-b" />
            
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium text-sm text-foreground">
                {item.user ? item.user.name : "System"}
              </span>
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                {formatDistanceToNow(item.timestamp, { addSuffix: true })}
              </span>
            </div>
            
            <div className="text-sm text-foreground/90 font-medium mb-1">
              {item.title}
            </div>
            
            {item.description && (
              <div className="text-sm text-muted-foreground">
                {item.description}
              </div>
            )}
            
            {/* Context-specific rendering based on item.type can be added here */}
          </div>
        </div>
      ))}
    </div>
  );
}
