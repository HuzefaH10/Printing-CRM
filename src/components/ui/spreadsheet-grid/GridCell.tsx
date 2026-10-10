"use client";

import React, { useRef, useEffect, useState } from "react";
import { StockColumn, StockItem } from "@/features/inventory/models/stock";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatUnits } from "@/lib/units";
import { UnitsInput } from "@/features/inventory/components/UnitsInput";
import { ReamsInput } from "@/features/inventory/components/ReamsInput";
import { SizeSelectInput } from "@/features/inventory/components/SizeSelectInput";
import { AlertCircle } from "lucide-react";

interface GridCellProps {
  item: StockItem;
  column: StockColumn;
  width: number;
  isSelected: boolean;
  isEditing: boolean;
  sheetsPerReam?: number;
  onSelect: () => void;
  onStartEdit: () => void;
  onCommitEdit: (value: any) => void;
  onCancelEdit: () => void;
  onNavigateKey: (key: "Enter" | "Tab" | "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight", shiftKey: boolean) => void;
}

export const GridCell = React.memo(function GridCell({
  item,
  column,
  width,
  isSelected,
  isEditing,
  sheetsPerReam = 500,
  onSelect,
  onStartEdit,
  onCommitEdit,
  onCancelEdit,
  onNavigateKey
}: GridCellProps) {
  const itemVals = item.values || item.data || {};
  const rawValue = itemVals[column.id];
  const [editValue, setEditValue] = useState<any>(rawValue ?? "");
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    setEditValue(rawValue ?? "");
  }, [rawValue]);

  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isEditing]);

  // Validation logic
  let validationError: string | null = null;
  if (column.required) {
    if (rawValue === undefined || rawValue === null || rawValue === "") {
      validationError = `${column.label} is required`;
    } else if (typeof rawValue === "object" && rawValue !== null && ("w" in rawValue && (rawValue.w <= 0 || rawValue.h <= 0))) {
      validationError = `Valid ${column.label} dimensions required`;
    }
  }

  if (column.type === "number" && typeof rawValue === "number") {
    if (column.min !== undefined && rawValue < column.min) {
      validationError = `Minimum value is ${column.min}`;
    }
    if (column.max !== undefined && rawValue > column.max) {
      validationError = `Maximum value is ${column.max}`;
    }
  }

  const handleKeyDownInEdit = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancelEdit();
      e.preventDefault();
      return;
    }

    if (e.key === "Enter") {
      onCommitEdit(parseFinalValue(editValue));
      onNavigateKey("Enter", e.shiftKey);
      e.preventDefault();
      return;
    }

    if (e.key === "Tab") {
      onCommitEdit(parseFinalValue(editValue));
      onNavigateKey("Tab", e.shiftKey);
      e.preventDefault();
      return;
    }
  };

  const parseFinalValue = (val: any) => {
    if (column.type === "number") {
      const num = parseFloat(val);
      if (isNaN(num)) return 0;
      let bounded = num;
      if (column.min !== undefined) bounded = Math.max(column.min, bounded);
      if (column.max !== undefined) bounded = Math.min(column.max, bounded);
      return bounded;
    }

    if (column.type === "quantity_units" || column.type === "quantity_reams") {
      return Math.max(0, parseFloat(val) || 0);
    }

    return val;
  };

  const renderFormattedDisplay = () => {
    if (column.type === "quantity_units") {
      const totalBase = typeof rawValue === "number" ? rawValue : parseFloat(rawValue || "0") || 0;
      const packSize = column.packSize ?? (column.id === "reams" ? sheetsPerReam : 1);
      const unitLabel = column.unitLabel || (column.id === "reams" ? "ream" : "pack");
      const packUnit = column.packUnit || (column.id === "reams" ? "sheets" : "pcs");

      const formatted = formatUnits(totalBase, packSize, unitLabel, packUnit);
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="font-mono cursor-help inline-flex items-center gap-1 font-semibold text-primary truncate">
              {formatted}
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="font-mono text-xs">= {totalBase.toLocaleString()} {packUnit}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (column.type === "quantity_reams") {
      const totalSheets = typeof rawValue === "number" ? rawValue : parseInt(rawValue || "0", 10) || 0;
      const formatted = formatUnits(totalSheets, sheetsPerReam, "ream", "sheets");
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="font-mono cursor-help inline-flex items-center gap-1 font-semibold text-primary truncate">
              {formatted}
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="font-mono text-xs">= {totalSheets.toLocaleString()} sheets</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (typeof rawValue === "object" && rawValue !== null && "w" in rawValue && "h" in rawValue) {
      return <span className="font-mono truncate">{rawValue.w} × {rawValue.h} mm</span>;
    }

    if (column.type === "number" && rawValue !== undefined && rawValue !== null && rawValue !== "") {
      return (
        <span className="font-mono truncate">
          {rawValue} {column.unit ? <span className="text-muted-foreground text-[10px]">{column.unit}</span> : ""}
        </span>
      );
    }

    return <span className="truncate">{rawValue || ""}</span>;
  };

  return (
    <td
      role="gridcell"
      style={{ width, minWidth: width, maxWidth: width }}
      onClick={() => {
        onSelect();
      }}
      onDoubleClick={() => onStartEdit()}
      className={`relative px-2.5 py-1.5 h-8 text-xs border-r border-border/40 select-none transition-colors ${
        isSelected ? "outline-2 outline-primary outline-offset-[-2px] bg-primary/5 dark:bg-primary/10" : ""
      } ${validationError ? "bg-red-500/10 border-red-500/50" : ""} ${
        column.type === "number" || column.type === "quantity_reams" || column.type === "quantity_units" ? "text-right" : ""
      }`}
    >
      {isEditing ? (
        colEditor(column, editValue, setEditValue, inputRef, handleKeyDownInEdit, onCommitEdit, parseFinalValue, sheetsPerReam)
      ) : (
        <div className="flex items-center justify-between w-full h-full min-h-[20px] gap-1 overflow-hidden">
          <div className={`w-full overflow-hidden ${column.type === "number" || column.type === "quantity_reams" || column.type === "quantity_units" ? "text-right" : ""}`}>
            {renderFormattedDisplay()}
          </div>
          {validationError && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="text-destructive shrink-0">
                  <AlertCircle className="w-3.5 h-3.5" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs text-destructive">{validationError}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
    </td>
  );
});

function colEditor(
  column: StockColumn,
  editValue: any,
  setEditValue: React.Dispatch<React.SetStateAction<any>>,
  inputRef: React.RefObject<HTMLInputElement | HTMLSelectElement | null>,
  onKeyDown: (e: React.KeyboardEvent) => void,
  onCommitEdit: (val: any) => void,
  parseFinalValue: (val: any) => any,
  sheetsPerReam: number
) {
  if (column.type === "select" && column.id === "size") {
    return (
      <div className="absolute inset-0 z-20 bg-background p-1 border-2 border-primary shadow-md">
        <SizeSelectInput
          value={editValue}
          onChange={(val) => {
            setEditValue(val);
            onCommitEdit(val);
          }}
          options={column.options}
          allowCustomOption={column.allowCustomOption ?? true}
        />
      </div>
    );
  }

  if (column.type === "select") {
    return (
      <select
        ref={inputRef as any}
        value={typeof editValue === "string" ? editValue : ""}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={() => onCommitEdit(parseFinalValue(editValue))}
        onKeyDown={onKeyDown}
        className="w-full absolute inset-0 px-2 py-1 bg-background border-2 border-primary focus:outline-none z-20 text-xs"
      >
        <option value="">Select...</option>
        {column.options?.map(opt => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (column.type === "quantity_units") {
    return (
      <div className="absolute top-0 right-0 z-30 bg-background p-2 border-2 border-primary shadow-lg rounded-md w-64">
        <UnitsInput
          value={typeof editValue === "number" ? editValue : parseFloat(editValue) || 0}
          onChange={(val) => setEditValue(val)}
          unitLabel={column.unitLabel || (column.id === "reams" ? "ream" : "pack")}
          packSize={column.packSize ?? (column.id === "reams" ? sheetsPerReam : 1)}
          packUnit={column.packUnit || (column.id === "reams" ? "sheets" : "pcs")}
        />
        <div className="flex justify-end gap-1 mt-2">
          <button
            type="button"
            className="px-2 py-0.5 text-[11px] bg-primary text-primary-foreground rounded font-semibold"
            onClick={() => onCommitEdit(parseFinalValue(editValue))}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  if (column.type === "quantity_reams") {
    return (
      <div className="absolute top-0 right-0 z-30 bg-background p-2 border-2 border-primary shadow-lg rounded-md w-64">
        <ReamsInput
          value={typeof editValue === "number" ? editValue : parseInt(editValue, 10) || 0}
          onChange={(val) => setEditValue(val)}
          sheetsPerReam={sheetsPerReam}
        />
        <div className="flex justify-end gap-1 mt-2">
          <button
            type="button"
            className="px-2 py-0.5 text-[11px] bg-primary text-primary-foreground rounded font-semibold"
            onClick={() => onCommitEdit(parseFinalValue(editValue))}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <input
      ref={inputRef as any}
      type={column.type === "number" ? "number" : "text"}
      value={typeof editValue === "string" || typeof editValue === "number" ? editValue : ""}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={() => onCommitEdit(parseFinalValue(editValue))}
      onKeyDown={onKeyDown}
      className="w-full absolute inset-0 px-2 py-1 bg-background border-2 border-primary focus:outline-none z-20 text-xs font-mono"
    />
  );
}
