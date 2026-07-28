"use client";

import { AuthGuard } from "@/components/layouts/AuthGuard";
import { AppLayout } from "@/components/layouts/AppLayout";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AppLayout>{children}</AppLayout>
    </AuthGuard>
  );
}
