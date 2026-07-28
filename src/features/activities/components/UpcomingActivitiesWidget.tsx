"use client";

import React, { useEffect, useState } from "react";
import { Activity } from "../models/activity";
import { activityRepo } from "../services/activity.repository";
import { ActivityCard } from "./ActivityCard";
import { Loader2 } from "lucide-react";

interface UpcomingActivitiesWidgetProps {
  companyId?: string; // If provided, filter by company
  limit?: number;
}

export function UpcomingActivitiesWidget({ companyId, limit = 5 }: UpcomingActivitiesWidgetProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const filters: any[] = [
      { field: "status", operator: "in", value: ["PENDING", "IN_PROGRESS", "OVERDUE"] }
    ];

    if (companyId) {
      filters.push({ field: "relatedCompanyId", operator: "==", value: companyId });
    }

    const unsubscribe = activityRepo.subscribe(
      filters,
      { orderBy: "dueDate", orderDirection: "asc", limit },
      (data) => {
        setActivities(data);
        setIsLoading(false);
      },
      (error) => {
        console.error(error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [companyId, limit]);

  if (isLoading) {
    return (
      <div className="bg-card border shadow-sm rounded-xl p-6 flex justify-center items-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="bg-card border shadow-sm rounded-xl p-6">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
        <h3 className="font-semibold tracking-tight text-lg">Upcoming Activities</h3>
        <button className="text-sm font-medium text-primary hover:underline">View All</button>
      </div>

      {activities.length === 0 ? (
        <div className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded-lg">
          No upcoming activities found.
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map(activity => (
            <ActivityCard key={activity.id} activity={activity} isCompact />
          ))}
        </div>
      )}
    </div>
  );
}
