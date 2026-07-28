"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && !pathname.startsWith("/login") && !pathname.startsWith("/forgot-password")) {
      router.push("/login");
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Initializing OS environment...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and trying to access a protected route, render nothing while redirecting
  if (!user && !pathname.startsWith("/login") && !pathname.startsWith("/forgot-password")) {
    return null;
  }

  return <>{children}</>;
}
