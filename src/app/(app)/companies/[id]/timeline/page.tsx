"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AuditService } from "@/services/audit.service";
import { UniversalTimeline, TimelineItem } from "@/features/core/timeline/UniversalTimeline";

export default function CompanyTimelinePage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    // In a real scenario, this would aggregate Audit Logs, Notes, Comments, and Emails.
    // We'll fetch just Audit Logs for the foundation.
    async function fetchTimeline() {
      try {
        const { data } = await AuditService.getEntityHistory(id, 50);
        
        const mappedItems: TimelineItem[] = data.map(log => ({
          id: log.id,
          type: "AUDIT",
          title: `Action: ${log.action}`,
          description: log.reason || undefined,
          timestamp: (log.createdAt as any)?.toDate ? (log.createdAt as any).toDate() : new Date(log.createdAt as any),
          user: log.userId ? { id: log.userId, name: "System User" } : undefined
        }));
        
        setItems(mappedItems);
      } catch (error) {
        console.error("Failed to load timeline", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTimeline();
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold tracking-tight mb-2">Activity Timeline</h2>
        <p className="text-sm text-muted-foreground">A chronological history of every interaction and change made to this company.</p>
      </div>
      
      <UniversalTimeline items={items} isLoading={isLoading} />
    </div>
  );
}
