"use client";

import React, { useEffect, useState } from "react";
import { Activity } from "@/features/activities/models/activity";
import { activityRepo } from "@/features/activities/services/activity.repository";
import { ActivityCard } from "@/features/activities/components/ActivityCard";
import { Button } from "@/components/ui/button";
import { Plus, List, LayoutGrid, Calendar as CalendarIcon, Filter } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"LIST" | "KANBAN">("LIST");
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    // In a real application, we'd apply complex filters to this subscription based on the `filter` state.
    const unsubscribe = activityRepo.subscribe(
      [],
      { orderBy: "dueDate", orderDirection: "desc", limit: 100 },
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
  }, []);

  const handleCreateNew = () => {
    // Simulate keyboard shortcut
    const event = new KeyboardEvent('keydown', { key: 'a' });
    window.dispatchEvent(event);
  };

  const renderKanban = () => {
    const columns = [
      { id: "PENDING", title: "To Do" },
      { id: "IN_PROGRESS", title: "In Progress" },
      { id: "COMPLETED", title: "Done" },
    ];

    return (
      <div className="flex gap-6 h-full overflow-x-auto pb-4 scrollbar-hide">
        {columns.map(col => (
          <div key={col.id} className="min-w-[320px] max-w-[320px] bg-muted/30 rounded-xl p-4 flex flex-col h-full border">
            <h3 className="font-semibold text-sm mb-4 tracking-tight flex justify-between items-center">
              {col.title}
              <span className="bg-background px-2 py-0.5 rounded-full text-xs border text-muted-foreground">
                {activities.filter(a => a.status === col.id).length}
              </span>
            </h3>
            <div className="space-y-3 overflow-y-auto scrollbar-hide flex-1 pb-4">
              {activities
                .filter(a => a.status === col.id)
                .map(activity => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderList = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map(activity => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your calls, meetings, tasks, and follow-ups.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted p-1 rounded-md border mr-2">
            <button 
              onClick={() => setViewMode("LIST")}
              className={`p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors ${viewMode === 'LIST' ? 'bg-background shadow-sm text-foreground' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode("KANBAN")}
              className={`p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors ${viewMode === 'KANBAN' ? 'bg-background shadow-sm text-foreground' : ''}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Log Activity
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {viewMode === "KANBAN" ? renderKanban() : renderList()}
          </div>
        )}
      </div>
    </div>
  );
}
