"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CATEGORY_PRESETS, CategoryPreset } from "@/lib/inventory/presets";
import { Sparkles, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PresetPickerModalProps {
  currentPresetId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPreset: (preset: CategoryPreset) => void;
}

export function PresetPickerModal({
  currentPresetId,
  open,
  onOpenChange,
  onSelectPreset
}: PresetPickerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="pb-4 border-b border-border/50">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" /> Apply Category Preset
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Quickly apply standard column structures for Paper, Ink, Plates, Chemicals, or RISO Masters.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.values(CATEGORY_PRESETS).map((preset) => {
            const isActive = currentPresetId === preset.id;
            return (
              <div
                key={preset.id}
                className={`p-4 rounded-lg border transition-all flex flex-col justify-between space-y-3 ${
                  isActive
                    ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm"
                    : "border-border/60 hover:border-border bg-card"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{preset.label}</span>
                    {isActive && (
                      <Badge variant="default" className="text-[10px] h-4 gap-1">
                        <Check className="w-3 h-3" /> Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{preset.description}</p>
                  <div className="pt-2 flex flex-wrap gap-1">
                    {preset.columns.map(col => (
                      <Badge key={col.id} variant="secondary" className="text-[10px]">
                        {col.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={isActive ? "secondary" : "default"}
                  onClick={() => {
                    onSelectPreset(preset);
                    onOpenChange(false);
                  }}
                  className="w-full text-xs"
                >
                  Apply {preset.label} Preset
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
