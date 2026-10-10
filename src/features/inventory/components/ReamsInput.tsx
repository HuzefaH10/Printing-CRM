"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toTotalSheets, splitSheets, formatReams } from "@/lib/reams";
import { Info } from "lucide-react";

interface ReamsInputProps {
  value?: number;
  onChange: (totalSheets: number) => void;
  sheetsPerReam?: number;
  disabled?: boolean;
  className?: string;
}

export function ReamsInput({
  value = 0,
  onChange,
  sheetsPerReam = 500,
  disabled = false,
  className = ""
}: ReamsInputProps) {
  const { reams, loose } = splitSheets(value, sheetsPerReam);
  const [pasteValue, setPasteValue] = useState("");

  const handleReamsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const num = Math.max(0, parseInt(rawVal, 10) || 0);
    const newTotal = toTotalSheets(num, loose, sheetsPerReam);
    onChange(newTotal);
  };

  const handleLooseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const num = Math.max(0, parseInt(rawVal, 10) || 0);
    const newTotal = toTotalSheets(reams, num, sheetsPerReam);
    onChange(newTotal);
  };

  const handleTotalSheetsPaste = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setPasteValue(raw);
    const parsedInt = parseInt(raw.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(parsedInt)) {
      onChange(Math.max(0, parsedInt));
    }
  };

  const formattedDisplay = formatReams(value, sheetsPerReam);
  const totalFormatted = (value || 0).toLocaleString();

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Reams</Label>
          <Input
            type="number"
            min={0}
            step={1}
            disabled={disabled}
            value={reams === 0 && value === 0 ? "" : reams}
            placeholder="0"
            onChange={handleReamsChange}
            className="font-mono text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Loose sheets <span className="text-[10px] text-muted-foreground/70">(max {sheetsPerReam - 1})</span>
          </Label>
          <Input
            type="number"
            min={0}
            step={1}
            disabled={disabled}
            value={loose === 0 && value === 0 ? "" : loose}
            placeholder="0"
            onChange={handleLooseChange}
            className="font-mono text-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-1 px-1 border-t border-border/40">
        <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
          <span>Display:</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold cursor-help">
                {formattedDisplay}
                <Info className="w-3 h-3 opacity-70" />
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="font-mono text-xs">= {totalFormatted} sheets</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <span>Or total sheets:</span>
          <Input
            type="text"
            disabled={disabled}
            placeholder="e.g. 1150"
            value={pasteValue}
            onChange={handleTotalSheetsPaste}
            className="h-6 w-24 text-[11px] px-2 py-0 font-mono"
          />
        </div>
      </div>
    </div>
  );
}
