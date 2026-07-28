"use client";

import { ThemeProvider } from "./ThemeProvider";
import { ReactQueryProvider } from "./ReactQueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toast";
// Note: Command Palette and Dialog providers could be added here later if they need global state

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <ReactQueryProvider>
        <AuthProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </AuthProvider>
      </ReactQueryProvider>
      <Toaster />
    </ThemeProvider>
  );
}
