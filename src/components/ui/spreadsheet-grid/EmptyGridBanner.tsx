"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface EmptyGridBannerProps {
  onApplyPreset: () => void;
}

export function EmptyGridBanner({ onApplyPreset }: EmptyGridBannerProps) {
  return (
    <div className="w-full bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-300/40 dark:border-amber-700/50 p-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-medium">
        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>Start typing, or add the standard Paper columns.</span>
      </div>

      <Button
        size="sm"
        onClick={onApplyPreset}
        className="bg-amber-600 hover:bg-amber-700 text-white h-7 text-xs px-3 shrink-0 self-start sm:self-center"
      >
        Add Paper columns
      </Button>
    </div>
  );
}
