"use client";

import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { GlobalCommandPalette } from "./GlobalCommandPalette";
import { KeyboardShortcutsProvider } from "@/components/providers/KeyboardShortcutsProvider";

export function AppLayout({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts();
  
  return (
    <KeyboardShortcutsProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopNav />
          <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            {children}
          </main>
        </div>
        <GlobalCommandPalette />
      </div>
    </KeyboardShortcutsProvider>
  );
}
