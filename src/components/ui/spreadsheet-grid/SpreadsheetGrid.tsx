"use client";

import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { StockColumn, StockItem, CustomSizeValue } from "@/features/inventory/models/stock";
import { ChevronRight, ChevronDown, Plus, Trash2, Copy as CopyIcon, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatReams, splitSheets } from "@/lib/reams";

interface SpreadsheetGridProps {
  columns: StockColumn[];
  data: StockItem[];
  sheetsPerReam?: number;
  onDataChange: (id: string, field: string, value: any) => void;
  onAddRow: (groupedValue?: string) => void;
  onDeleteRow: (id: string) => void;
  onDuplicateRow: (id: string) => void;
  onEditItemInModal?: (item: StockItem) => void;
  groupByColumn?: string;
  sortByColumn?: string;
}

export function SpreadsheetGrid({
  columns,
  data,
  sheetsPerReam = 500,
  onDataChange,
  onAddRow,
  onDeleteRow,
  onDuplicateRow,
  onEditItemInModal,
  groupByColumn
}: SpreadsheetGridProps) {
  const [editingCell, setEditingCell] = useState<{ rowId: string; colId: string } | null>(null);
  const [editValue, setEditValue] = useState<any>("");
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  // Filter columns that have showInTable !== false
  const tableColumns = columns.filter(col => col.showInTable !== false);

  // Filter out soft deleted items
  const activeItems = data.filter(item => !item.deletedAt);

  // Grouping logic
  const groupedData = React.useMemo(() => {
    if (!groupByColumn) return { "All": activeItems };
    const groups: Record<string, StockItem[]> = {};
    activeItems.forEach(item => {
      const itemValues = item.values || item.data || {};
      const val = String(itemValues[groupByColumn] || "Uncategorized");
      if (!groups[val]) groups[val] = [];
      groups[val].push(item);
    });
    return groups;
  }, [activeItems, groupByColumn]);

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    Object.keys(groupedData).forEach(k => (initial[k] = true));
    setExpandedGroups(initial);
  }, [Object.keys(groupedData).length]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  // Keyboard navigation
  const handleKeyDown = (
    e: KeyboardEvent,
    rowId: string,
    colId: string,
    rowIndex: number,
    colIndex: number
  ) => {
    if (e.key === "Enter" || e.key === "Escape") {
      commitEdit();
      e.preventDefault();
      return;
    }

    if (e.key === "Tab") {
      commitEdit();
      e.preventDefault();
      const nextColIndex = e.shiftKey ? colIndex - 1 : colIndex + 1;
      if (nextColIndex >= 0 && nextColIndex < tableColumns.length) {
        const nextCol = tableColumns[nextColIndex];
        const item = activeItems.find(d => d.id === rowId);
        const itemVals = item?.values || item?.data || {};
        startEditing(rowId, nextCol.id, itemVals[nextCol.id], nextCol.type);
      }
    }
  };

  const startEditing = (rowId: string, colId: string, currentValue: any, type: string) => {
    setEditingCell({ rowId, colId });
    if (type === "quantity_reams") {
      setEditValue(currentValue ?? 0);
    } else if (typeof currentValue === "object" && currentValue !== null && "w" in currentValue) {
      setEditValue(`${currentValue.w}x${currentValue.h}`);
    } else {
      setEditValue(typeof currentValue === "string" ? currentValue : currentValue?.toString() || "");
    }
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const commitEdit = () => {
    if (!editingCell) return;
    const col = columns.find(c => c.id === editingCell.colId);
    let finalValue: any = editValue;

    if (col?.type === "number") {
      finalValue = parseFloat(editValue) || 0;
      if (col.min !== undefined) finalValue = Math.max(col.min, finalValue);
      if (col.max !== undefined) finalValue = Math.min(col.max, finalValue);
    } else if (col?.type === "quantity_reams") {
      finalValue = Math.max(0, parseInt(editValue, 10) || 0);
    }

    onDataChange(editingCell.rowId, editingCell.colId, finalValue);
    setEditingCell(null);
  };

  const renderCellContent = (item: StockItem, col: StockColumn) => {
    const itemVals = item.values || item.data || {};
    const val = itemVals[col.id];

    if (col.type === "quantity_reams") {
      const totalSheets = typeof val === "number" ? val : parseInt(val || "0", 10) || 0;
      const formatted = formatReams(totalSheets, sheetsPerReam);
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="font-mono cursor-help inline-flex items-center gap-1 font-semibold text-primary">
              {formatted}
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="font-mono text-xs">= {totalSheets.toLocaleString()} sheets</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (typeof val === "object" && val !== null && "w" in val && "h" in val) {
      return <span className="font-mono">{val.w} × {val.h} mm</span>;
    }

    if (col.type === "number" && val !== undefined && val !== null && val !== "") {
      return (
        <span className="font-mono">
          {val} {col.unit ? <span className="text-muted-foreground text-xs">{col.unit}</span> : ""}
        </span>
      );
    }

    return val || "";
  };

  return (
    <div className="w-full overflow-x-auto rounded-md border border-border bg-card">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-muted/50 border-b border-border text-xs uppercase font-medium">
          <tr>
            <th className="w-10 px-3 py-2.5 text-center text-muted-foreground">#</th>
            {tableColumns.map(col => (
              <th
                key={col.id}
                className={`px-4 py-2.5 font-semibold text-foreground/80 ${
                  col.type === "number" || col.type === "quantity_reams" ? "text-right" : ""
                }`}
              >
                {col.label}
                {col.unit && <span className="ml-1 text-[10px] text-muted-foreground font-normal">({col.unit})</span>}
              </th>
            ))}
            <th className="w-12 px-2 py-2.5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {Object.entries(groupedData).map(([groupName, items]) => (
            <React.Fragment key={groupName}>
              {groupByColumn && (
                <tr
                  className="bg-muted/30 border-b border-border/50 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleGroup(groupName)}
                >
                  <td className="px-3 py-2 text-center">
                    {expandedGroups[groupName] ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground inline" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground inline" />
                    )}
                  </td>
                  <td colSpan={tableColumns.length + 1} className="px-4 py-2 font-semibold">
                    <div className="flex items-center justify-between">
                      <span>
                        {groupName === "Uncategorized" ? "All Items" : groupName}
                        <span className="text-muted-foreground text-xs font-normal ml-2">
                          ({items.length})
                        </span>
                      </span>
                      <button
                        className="p-1 hover:bg-muted rounded text-xs flex items-center gap-1 text-primary mr-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddRow(groupName);
                        }}
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Row
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {expandedGroups[groupName] !== false &&
                items.map((item, rowIndex) => {
                  const itemVals = item.values || item.data || {};
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-border/40 hover:bg-muted/20 transition-colors group"
                    >
                      <td className="px-3 py-2 text-center text-muted-foreground border-r border-border/30 bg-muted/10 font-mono text-xs">
                        {rowIndex + 1}
                      </td>

                      {tableColumns.map((col, colIndex) => {
                        const isEditing = editingCell?.rowId === item.id && editingCell?.colId === col.id;
                        const cellVal = itemVals[col.id];

                        return (
                          <td
                            key={col.id}
                            className={`px-4 py-2 border-r border-border/30 relative ${
                              col.type === "number" || col.type === "quantity_reams" ? "text-right" : ""
                            }`}
                            onClick={() => !isEditing && startEditing(item.id!, col.id, cellVal, col.type)}
                          >
                            {isEditing ? (
                              col.type === "select" ? (
                                <select
                                  ref={inputRef as any}
                                  value={typeof editValue === "string" ? editValue : ""}
                                  onChange={e => setEditValue(e.target.value)}
                                  onBlur={commitEdit}
                                  onKeyDown={(e) => handleKeyDown(e, item.id!, col.id, rowIndex, colIndex)}
                                  className="w-full absolute inset-0 px-3 py-1.5 bg-background border-2 border-primary focus:outline-none z-10 text-xs"
                                >
                                  <option value="">Select...</option>
                                  {col.options?.map(opt => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  ref={inputRef as any}
                                  type={col.type === "number" || col.type === "quantity_reams" ? "number" : "text"}
                                  value={typeof editValue === "string" || typeof editValue === "number" ? editValue : ""}
                                  onChange={e => setEditValue(e.target.value)}
                                  onBlur={commitEdit}
                                  onKeyDown={(e) => handleKeyDown(e, item.id!, col.id, rowIndex, colIndex)}
                                  className="w-full absolute inset-0 px-3 py-1.5 bg-background border-2 border-primary focus:outline-none z-10 text-xs font-mono"
                                  autoFocus
                                />
                              )
                            ) : (
                              <div className="min-h-[22px] flex items-center">
                                {col.type === "number" || col.type === "quantity_reams" ? (
                                  <div className="w-full text-right">{renderCellContent(item, col)}</div>
                                ) : (
                                  renderCellContent(item, col)
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}

                      <td className="px-2 py-1 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-opacity">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onEditItemInModal && (
                              <DropdownMenuItem onClick={() => onEditItemInModal(item)}>
                                Edit in Modal (All Fields)
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onDuplicateRow(item.id!)}>
                              <CopyIcon className="w-4 h-4 mr-2" /> Duplicate Row
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDeleteRow(item.id!)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete Row (Soft Delete)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
            </React.Fragment>
          ))}

          <tr>
            <td colSpan={tableColumns.length + 2} className="p-0">
              <button
                onClick={() => onAddRow()}
                className="w-full text-left px-4 py-3 text-xs font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground flex items-center transition-colors"
              >
                <Plus className="w-4 h-4 mr-2 text-primary" /> Add new item row
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
