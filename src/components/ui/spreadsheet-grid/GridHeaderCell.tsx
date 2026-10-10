"use client";

import React, { useState } from "react";
import { StockColumn, ColumnDef } from "@/features/inventory/models/stock";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Type, Hash, ListFilter, Boxes, Layers, Trash2, ArrowLeft, ArrowRight, Settings2, Plus, GripVertical } from "lucide-react";

interface GridHeaderCellProps {
  column: StockColumn;
  index: number;
  totalColumns: number;
  width: number;
  onUpdateColumn: (colId: string, updates: Partial<ColumnDef>) => void;
  onDeleteColumn: (colId: string) => void;
  onMoveColumn: (index: number, direction: "left" | "right") => void;
  onResizeColumn: (colId: string, width: number) => void;
}

export function GridHeaderCell({
  column,
  index,
  totalColumns,
  width,
  onUpdateColumn,
  onDeleteColumn,
  onMoveColumn,
  onResizeColumn
}: GridHeaderCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newOptionInput, setNewOptionInput] = useState("");
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientX - startX;
      const newWidth = Math.max(80, startWidth + diff);
      onResizeColumn(column.id, newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "number": return <Hash className="w-3 h-3 text-blue-500 shrink-0" />;
      case "select": return <ListFilter className="w-3 h-3 text-purple-500 shrink-0" />;
      case "quantity_units":
      case "quantity_reams": return <Boxes className="w-3 h-3 text-amber-500 shrink-0" />;
      default: return <Type className="w-3 h-3 text-emerald-500 shrink-0" />;
    }
  };

  const handleAddOption = () => {
    const val = newOptionInput.trim();
    if (!val) return;
    const current = column.options || [];
    if (!current.includes(val)) {
      onUpdateColumn(column.id, { options: [...current, val] });
    }
    setNewOptionInput("");
  };

  const handleRemoveOption = (opt: string) => {
    const updated = (column.options || []).filter(o => o !== opt);
    onUpdateColumn(column.id, { options: updated });
  };

  return (
    <th
      style={{ width, minWidth: width, maxWidth: width }}
      className="relative px-3 py-2 text-xs font-semibold text-foreground/90 border-r border-border/60 bg-muted/60 select-none group/hdr"
    >
      <div className="flex items-center justify-between gap-1 w-full overflow-hidden">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger className="flex items-center gap-1.5 truncate text-left hover:text-primary transition-colors cursor-pointer w-full">
            {getTypeIcon(column.type)}
            <span className="truncate font-semibold">{column.label}</span>
            {column.unit && (
              <span className="text-[10px] text-muted-foreground font-normal font-mono shrink-0">
                ({column.unit})
              </span>
            )}
            {column.required && <span className="text-destructive font-bold text-xs">*</span>}
          </PopoverTrigger>

          <PopoverContent className="w-80 p-4 space-y-4" align="start">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Settings2 className="w-3.5 h-3.5" /> Edit Column
              </span>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  disabled={index === 0}
                  onClick={() => onMoveColumn(index, "left")}
                  title="Move left"
                >
                  <ArrowLeft className="w-3 h-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  disabled={index === totalColumns - 1}
                  onClick={() => onMoveColumn(index, "right")}
                  title="Move right"
                >
                  <ArrowRight className="w-3 h-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    onDeleteColumn(column.id);
                    setIsOpen(false);
                  }}
                  title="Delete column"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Column Label</Label>
                <Input
                  value={column.label}
                  onChange={(e) => onUpdateColumn(column.id, { label: e.target.value })}
                  className="h-8 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={column.type}
                    onValueChange={(val: any) => onUpdateColumn(column.id, { type: val })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">text</SelectItem>
                      <SelectItem value="number">number</SelectItem>
                      <SelectItem value="select">select</SelectItem>
                      <SelectItem value="quantity_units">quantity_units</SelectItem>
                      <SelectItem value="quantity_reams">quantity_reams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Unit</Label>
                  <Input
                    value={column.unit || ""}
                    onChange={(e) => onUpdateColumn(column.id, { unit: e.target.value })}
                    placeholder="gsm, mm, kg"
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <Label className="text-xs cursor-pointer">Required Column</Label>
                <Switch
                  checked={column.required || false}
                  onCheckedChange={(checked) => onUpdateColumn(column.id, { required: checked })}
                />
              </div>

              {column.type === "select" && (
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <Label className="text-xs font-semibold">Dropdown Options</Label>
                  <div className="flex gap-1.5">
                    <Input
                      value={newOptionInput}
                      onChange={(e) => setNewOptionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddOption();
                        }
                      }}
                      placeholder="Add option..."
                      className="h-7 text-xs"
                    />
                    <Button size="sm" variant="secondary" onClick={handleAddOption} className="h-7 text-xs px-2">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pt-1">
                    {(column.options || []).map(opt => (
                      <span key={opt} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-[11px]">
                        {opt}
                        <button onClick={() => handleRemoveOption(opt)} className="text-destructive hover:opacity-80">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Resizable edge handle */}
      <div
        onMouseDown={handleMouseDownResize}
        className={`absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/50 transition-colors z-30 ${
          isResizing ? "bg-primary" : ""
        }`}
      />
    </th>
  );
}
