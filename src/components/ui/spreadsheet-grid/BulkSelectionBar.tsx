"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Copy, X } from "lucide-react";

interface BulkSelectionBarProps {
  selectedCount: number;
  onDuplicate: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export function BulkSelectionBar({
  selectedCount,
  onDuplicate,
  onDelete,
  onClear
}: BulkSelectionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background dark:bg-card dark:text-foreground px-4 py-2.5 rounded-full shadow-xl border border-border flex items-center gap-4 text-xs animate-in fade-in slide-in-from-bottom-4">
      <span className="font-semibold font-mono">
        {selectedCount} {selectedCount === 1 ? "row" : "rows"} selected
      </span>

      <div className="h-4 w-px bg-muted-foreground/30" />

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={onDuplicate}
          className="h-7 text-xs gap-1.5"
        >
          <Copy className="w-3.5 h-3.5" /> Duplicate ({selectedCount})
        </Button>

        <Button
          size="sm"
          variant="destructive"
          onClick={onDelete}
          className="h-7 text-xs gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete (Soft)
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={onClear}
          className="h-7 w-7 rounded-full ml-1"
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
