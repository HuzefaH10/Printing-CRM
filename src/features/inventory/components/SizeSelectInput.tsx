"use client";

import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomSizeValue } from "../models/stock";

interface SizeSelectInputProps {
  value?: string | CustomSizeValue;
  onChange: (val: string | CustomSizeValue) => void;
  options?: string[];
  allowCustomOption?: boolean;
  disabled?: boolean;
}

const DEFAULT_PRESETS = ["A5", "A4", "A3", "SRA3", "70x100", "64x90", "61x86"];

export function SizeSelectInput({
  value,
  onChange,
  options = DEFAULT_PRESETS,
  allowCustomOption = true,
  disabled = false
}: SizeSelectInputProps) {
  const isCustomObj = typeof value === "object" && value !== null && "w" in value && "h" in value;
  const isCustomSelected = isCustomObj || (typeof value === "string" && !options.includes(value) && value !== "");

  const [mode, setMode] = useState<"preset" | "custom">(isCustomSelected ? "custom" : "preset");
  const [width, setWidth] = useState<number>(isCustomObj ? (value as CustomSizeValue).w : 0);
  const [height, setHeight] = useState<number>(isCustomObj ? (value as CustomSizeValue).h : 0);

  const selectedPresetValue = typeof value === "string" && options.includes(value) ? value : "";

  const handleSelectPreset = (val: string | null) => {
    if (!val) return;
    if (val === "CUSTOM_ENTRY") {
      setMode("custom");
    } else {
      setMode("preset");
      onChange(val);
    }
  };

  const handleWidthChange = (w: number) => {
    setWidth(w);
    if (w > 0 && height > 0) {
      onChange({ w, h: height });
    }
  };

  const handleHeightChange = (h: number) => {
    setHeight(h);
    if (width > 0 && h > 0) {
      onChange({ w: width, h });
    }
  };

  return (
    <div className="space-y-3">
      <Select
        disabled={disabled}
        value={mode === "custom" ? "CUSTOM_ENTRY" : selectedPresetValue}
        onValueChange={handleSelectPreset}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select paper size..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
          {allowCustomOption && (
            <SelectItem value="CUSTOM_ENTRY" className="font-semibold text-primary">
              + Custom dimensions (mm)
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {mode === "custom" && allowCustomOption && (
        <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-md border border-border/50">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Width (W mm)</Label>
            <Input
              type="number"
              min={1}
              placeholder="e.g. 210"
              disabled={disabled}
              value={width || ""}
              onChange={(e) => handleWidthChange(Math.max(0, parseFloat(e.target.value) || 0))}
              className="h-8 font-mono text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Height (H mm)</Label>
            <Input
              type="number"
              min={1}
              placeholder="e.g. 297"
              disabled={disabled}
              value={height || ""}
              onChange={(e) => handleHeightChange(Math.max(0, parseFloat(e.target.value) || 0))}
              className="h-8 font-mono text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}
