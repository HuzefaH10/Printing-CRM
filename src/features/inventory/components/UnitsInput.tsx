"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toTotalBase, splitBase, formatUnits, pluralizeUnitLabel, PackUnit } from "@/lib/units";
import { Info } from "lucide-react";

interface UnitsInputProps {
  value?: number;
  onChange: (totalBase: number) => void;
  unitLabel?: string;
  packSize?: number;
  packUnit?: PackUnit;
  disabled?: boolean;
  className?: string;
}

export function UnitsInput({
  value = 0,
  onChange,
  unitLabel = "pack",
  packSize = 1,
  packUnit = "pcs",
  disabled = false,
  className = ""
}: UnitsInputProps) {
  const { fullPacks, looseAmount } = splitBase(value, packSize);
  const [pasteValue, setPasteValue] = useState("");

  const handleFullPacksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const num = Math.max(0, parseInt(rawVal, 10) || 0);
    const newTotal = toTotalBase(num, looseAmount, packSize);
    onChange(newTotal);
  };

  const handleLooseAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const num = Math.max(0, parseFloat(rawVal) || 0);
    const newTotal = toTotalBase(fullPacks, num, packSize);
    onChange(newTotal);
  };

  const handleTotalBasePaste = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setPasteValue(raw);
    const parsedNum = parseFloat(raw.replace(/[^0-9.]/g, ""));
    if (!isNaN(parsedNum)) {
      onChange(Math.max(0, parsedNum));
    }
  };

  const formattedDisplay = formatUnits(value, packSize, unitLabel, packUnit);
  const pluralLabel = pluralizeUnitLabel(unitLabel, 2);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground capitalize">Full {pluralLabel}</Label>
          <Input
            type="number"
            min={0}
            step={1}
            disabled={disabled}
            value={fullPacks === 0 && value === 0 ? "" : fullPacks}
            placeholder="0"
            onChange={handleFullPacksChange}
            className="font-mono text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Loose {packUnit} <span className="text-[10px] text-muted-foreground/70">(pack = {packSize} {packUnit})</span>
          </Label>
          <Input
            type="number"
            min={0}
            step="any"
            disabled={disabled}
            value={looseAmount === 0 && value === 0 ? "" : looseAmount}
            placeholder="0"
            onChange={handleLooseAmountChange}
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
                <p className="font-mono text-xs">= {value} {packUnit}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <span>Or total {packUnit}:</span>
          <Input
            type="text"
            disabled={disabled}
            placeholder="e.g. 3.5"
            value={pasteValue}
            onChange={handleTotalBasePaste}
            className="h-6 w-24 text-[11px] px-2 py-0 font-mono"
          />
        </div>
      </div>
    </div>
  );
}
