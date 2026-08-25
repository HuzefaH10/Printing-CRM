"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AuditService } from "@/services/audit.service";
import { UniversalTimeline, TimelineItem } from "@/features/core/timeline/UniversalTimeline";
import { activityRepo } from "@/features/activities/services/activity.repository";

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
        const [auditRes, activitiesRes] = await Promise.all([
          AuditService.getEntityHistory(id, 50),
          activityRepo.list([{ field: "relatedCompanyId", operator: "==", value: id }])
        ]);
        
        const mappedAuditItems: TimelineItem[] = auditRes.data.map(log => ({
          id: log.id,
          type: log.action === "outreach_email_sent" ? "OUTREACH" : "AUDIT",
          title: log.action === "outreach_email_sent" ? "Partnership Outreach Sent" : `Action: ${log.action}`,
          description: log.reason || (log.newValue as any)?.recipientEmail ? `Recipient: ${(log.newValue as any).recipientEmail}` : undefined,
          timestamp: (log.createdAt as any)?.toDate ? (log.createdAt as any).toDate() : new Date(log.createdAt as any || Date.now()),
          user: log.userId ? { id: log.userId, name: "Sales Team" } : undefined,
          metadata: log.newValue
        }));

        const mappedActivities: TimelineItem[] = activitiesRes.data.map(activity => ({
          id: activity.id,
          type: activity.type === "EMAIL" ? "OUTREACH" : "COMMENT",
          title: activity.title,
          description: activity.shortDescription || activity.detailedNotes,
          timestamp: (activity.createdAt as any)?.toDate ? (activity.createdAt as any).toDate() : new Date(activity.createdAt as any || Date.now()),
          user: activity.createdBy ? { id: activity.createdBy, name: "Sales Team" } : undefined,
          metadata: activity.payload
        }));
        
        const merged = [...mappedAuditItems, ...mappedActivities].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setItems(merged);
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
