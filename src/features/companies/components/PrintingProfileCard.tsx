import React from "react";
import { PrintingProfile } from "../models/company";
import { formatCurrency } from "@/utils/currency";

interface PrintingProfileCardProps {
  profile?: PrintingProfile;
  currency: string;
}

export function PrintingProfileCard({ profile, currency }: PrintingProfileCardProps) {
  if (!profile) {
    return (
      <div className="bg-card border shadow-sm rounded-xl p-6 flex items-center justify-center h-full text-muted-foreground text-sm">
        No printing profile available.
      </div>
    );
  }

  return (
    <div className="bg-card border shadow-sm rounded-xl p-6">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
        <h3 className="font-semibold tracking-tight text-lg">Printing Profile</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-6">
        <div>
          <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Products</span>
          <span className="text-sm font-medium">{profile.products?.join(", ") || "-"}</span>
        </div>
        <div>
          <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Typical Quantities</span>
          <span className="text-sm font-medium">{profile.typicalQuantities || "-"}</span>
        </div>
        <div>
          <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Yearly Spend</span>
          <span className="text-sm font-medium text-emerald-500">{formatCurrency(profile.estimatedYearlySpend, currency)}</span>
        </div>
        <div>
          <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Current Competitor</span>
          <span className="text-sm font-medium">{profile.currentPrintingCompany || "Unknown"}</span>
        </div>
        <div>
          <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Paper Pref</span>
          <span className="text-sm font-medium">{profile.preferredPaper?.join(", ") || "-"}</span>
        </div>
        <div>
          <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Binding Pref</span>
          <span className="text-sm font-medium">{profile.preferredBinding?.join(", ") || "-"}</span>
        </div>
      </div>
    </div>
  );
}
