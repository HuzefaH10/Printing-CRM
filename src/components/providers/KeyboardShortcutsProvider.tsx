"use client";

import React, { useEffect, useState } from "react";
import { ActivityGlobalCreateModal } from "@/features/activities/components/ActivityGlobalCreateModal";
import { ActivityType } from "@/features/activities/models/activity";

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultType, setDefaultType] = useState<ActivityType>("TASK");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "SELECT" ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // Modifier keys check
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      let triggered = false;
      const key = e.key.toLowerCase();

      if (key === "a") {
        setDefaultType("TASK"); // Generic activity
        triggered = true;
      } else if (key === "m") {
        setDefaultType("MEETING");
        triggered = true;
      } else if (key === "c") {
        setDefaultType("CALL");
        triggered = true;
      } else if (key === "f") {
        setDefaultType("FOLLOW_UP");
        triggered = true;
      } else if (key === "t") {
        setDefaultType("TASK");
        triggered = true;
      }

      if (triggered) {
        e.preventDefault();
        setIsModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {children}
      <ActivityGlobalCreateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        defaultType={defaultType}
      />
    </>
  );
}
