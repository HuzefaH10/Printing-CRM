"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { profile } = useAuth();

  useEffect(() => {
    // If keyboard shortcuts are disabled in preferences, don't bind them.
    if (profile && !profile.preferences.keyboardShortcutsEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // Ctrl + K or Cmd + K -> Command Palette (Handled in Command Palette component usually, but we ensure no defaults)
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent("open-command-palette"));
      }

      // Ctrl + / -> Search
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent("open-search"));
      }

      // Navigation Shortcuts (Ctrl + Shift + Key)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case "d": // Dashboard
            e.preventDefault();
            router.push("/dashboard");
            break;
          case "c": // Companies
            e.preventDefault();
            router.push("/companies");
            break;
          case "t": // Tasks
            e.preventDefault();
            router.push("/tasks");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, profile]);
}
