"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { StockColumn, StockItem, ColumnDef } from "@/features/inventory/models/stock";
import { GridHeaderCell } from "./GridHeaderCell";
import { GridCell } from "./GridCell";
import { BulkSelectionBar } from "./BulkSelectionBar";
import { EmptyGridBanner } from "./EmptyGridBanner";
import {
  Search,
  Plus,
  Settings,
  Sparkles,
  MoreHorizontal,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  Download,
  Upload,
  Copy,
  Trash2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

interface SpreadsheetGridProps {
  columns: StockColumn[];
  data: StockItem[];
  sheetsPerReam?: number;
  reorderLevel?: number;
  groupByColumn?: string;
  sortByColumn?: string;
  onDataChange: (id: string, field: string, value: any) => Promise<void> | void;
  onAddRow: (groupedValue?: string, targetIndex?: number) => Promise<void> | void;
  onDeleteRow: (id: string) => Promise<void> | void;
  onDuplicateRow: (id: string) => Promise<void> | void;
  onUpdateColumn?: (colId: string, updates: Partial<ColumnDef>) => Promise<void> | void;
  onAddColumn?: () => Promise<void> | void;
  onDeleteColumn?: (colId: string) => Promise<void> | void;
  onReorderColumns?: (columns: StockColumn[]) => Promise<void> | void;
  onApplyPreset?: () => void;
  onOpenSettings?: () => void;
  onOpenPresetPicker?: () => void;
  onEditItemInModal?: (item: StockItem) => void;
}

export function SpreadsheetGrid({
  columns,
  data,
  sheetsPerReam = 500,
  reorderLevel = 0,
  groupByColumn,
  onDataChange,
  onAddRow,
  onDeleteRow,
  onDuplicateRow,
  onUpdateColumn,
  onAddColumn,
  onDeleteColumn,
  onReorderColumns,
  onApplyPreset,
  onOpenSettings,
  onOpenPresetPicker,
  onEditItemInModal
}: SpreadsheetGridProps) {
  // Column visibility & width state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [hiddenColumnIds, setHiddenColumnIds] = useState<Set<string>>(new Set());

  // Navigation & Selection State
  const [selectedCell, setSelectedCell] = useState<{ rowId: string; colId: string } | null>(null);
  const [editingCell, setEditingCell] = useState<{ rowId: string; colId: string } | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");

  // Container & Scroll Refs for Virtualization
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  // Default Fallback Column if empty
  const defaultColumns: StockColumn[] = useMemo(() => [
    { id: "itemName", label: "Item Name", type: "text", required: true, showInTable: true, order: 1 }
  ], []);

  const activeColumns = useMemo(() => {
    const cols = columns.length > 0 ? columns : defaultColumns;
    return cols.filter(c => !hiddenColumnIds.has(c.id) && c.showInTable !== false);
  }, [columns, defaultColumns, hiddenColumnIds]);

  // Active items (excluding soft-deleted)
  const activeItems = useMemo(() => {
    return data.filter(item => !item.isDeleted && !item.deletedAt);
  }, [data]);

  // Filtered items by search
  const filteredItems = useMemo(() => {
    if (!search.trim()) return activeItems;
    const term = search.toLowerCase();
    return activeItems.filter(item => {
      const itemVals = item.values || item.data || {};
      return Object.values(itemVals).some(val => {
        if (typeof val === "object" && val !== null && "w" in val) {
          return `${val.w}x${val.h}`.toLowerCase().includes(term);
        }
        return String(val || "").toLowerCase().includes(term);
      });
    });
  }, [activeItems, search]);

  // Handle column width resize
  const handleResizeColumn = useCallback((colId: string, width: number) => {
    setColumnWidths(prev => ({ ...prev, [colId]: width }));
  }, []);

  // Handle move column left/right
  const handleMoveColumn = useCallback((index: number, direction: "left" | "right") => {
    if (direction === "left" && index === 0) return;
    if (direction === "right" && index === activeColumns.length - 1) return;

    const targetIndex = direction === "left" ? index - 1 : index + 1;
    const newCols = [...activeColumns];
    const temp = newCols[index];
    newCols[index] = newCols[targetIndex];
    newCols[targetIndex] = temp;

    const reordered = newCols.map((col, idx) => ({ ...col, order: idx + 1 }));
    onReorderColumns?.(reordered);
  }, [activeColumns, onReorderColumns]);

  // Key navigation handler
  const handleNavigateKey = useCallback(
    (key: "Enter" | "Tab" | "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight", shiftKey: boolean) => {
      if (!selectedCell && !editingCell) return;
      const currentCell = editingCell || selectedCell;
      if (!currentCell) return;

      const rowIndex = filteredItems.findIndex(i => i.id === currentCell.rowId);
      const colIndex = activeColumns.findIndex(c => c.id === currentCell.colId);
      if (rowIndex === -1 || colIndex === -1) return;

      setEditingCell(null);

      let nextRowIndex = rowIndex;
      let nextColIndex = colIndex;

      if (key === "ArrowUp") nextRowIndex = Math.max(0, rowIndex - 1);
      if (key === "ArrowDown") nextRowIndex = Math.min(filteredItems.length - 1, rowIndex + 1);
      if (key === "ArrowLeft") nextColIndex = Math.max(0, colIndex - 1);
      if (key === "ArrowRight") nextColIndex = Math.min(activeColumns.length - 1, colIndex + 1);

      if (key === "Enter") {
        if (shiftKey) {
          nextRowIndex = Math.max(0, rowIndex - 1);
        } else {
          nextRowIndex = rowIndex + 1;
          if (nextRowIndex >= filteredItems.length) {
            onAddRow();
            return;
          }
        }
      }

      if (key === "Tab") {
        if (shiftKey) {
          nextColIndex = colIndex - 1;
          if (nextColIndex < 0) {
            nextColIndex = activeColumns.length - 1;
            nextRowIndex = Math.max(0, rowIndex - 1);
          }
        } else {
          nextColIndex = colIndex + 1;
          if (nextColIndex >= activeColumns.length) {
            nextColIndex = 0;
            nextRowIndex = rowIndex + 1;
            if (nextRowIndex >= filteredItems.length) {
              onAddRow();
              return;
            }
          }
        }
      }

      const nextRow = filteredItems[nextRowIndex];
      const nextCol = activeColumns[nextColIndex];
      if (nextRow && nextCol) {
        setSelectedCell({ rowId: nextRow.id!, colId: nextCol.id });
      }
    },
    [selectedCell, editingCell, filteredItems, activeColumns, onAddRow]
  );

  // Global Keyboard Listener for Grid
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(activeElement.tagName) && !editingCell) {
        return;
      }

      if (editingCell) return;

      if (!selectedCell) return;

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        handleNavigateKey(e.key as any, e.shiftKey);
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        setEditingCell(selectedCell);
        return;
      }

      if (e.key === "Escape") {
        setSelectedCell(null);
        return;
      }

      // Copy TSV
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        const item = filteredItems.find(i => i.id === selectedCell.rowId);
        const itemVals = item?.values || item?.data || {};
        const val = itemVals[selectedCell.colId] ?? "";
        const formatted = typeof val === "object" ? `${val.w}x${val.h}` : String(val);
        navigator.clipboard.writeText(formatted);
        return;
      }

      // Type directly to start edit
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setEditingCell(selectedCell);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown as any);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown as any);
  }, [selectedCell, editingCell, filteredItems, handleNavigateKey]);

  // Commit Cell Edit with Autosave Indicator
  const handleCommitCellEdit = async (rowId: string, colId: string, value: any) => {
    setEditingCell(null);
    try {
      setSaveStatus("saving");
      await onDataChange(rowId, colId, value);
      setSaveStatus("saved");
    } catch (err) {
      console.error("Autosave error:", err);
      setSaveStatus("error");
    }
  };

  // Clipboard Paste TSV into Grid
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || !selectedCell) return;

      const rows = text.split(/\r?\n/).filter(Boolean);
      const startRowIdx = filteredItems.findIndex(i => i.id === selectedCell.rowId);
      const startColIdx = activeColumns.findIndex(c => c.id === selectedCell.colId);
      if (startRowIdx === -1 || startColIdx === -1) return;

      setSaveStatus("saving");

      for (let r = 0; r < rows.length; r++) {
        const rowData = rows[r].split("\t");
        const targetRow = filteredItems[startRowIdx + r];
        if (!targetRow) continue;

        for (let c = 0; c < rowData.length; c++) {
          const targetCol = activeColumns[startColIdx + c];
          if (!targetCol) continue;

          let val: any = rowData[c].trim();
          if (targetCol.type === "number" || targetCol.type === "quantity_units" || targetCol.type === "quantity_reams") {
            val = parseFloat(val) || 0;
          }

          await onDataChange(targetRow.id!, targetCol.id, val);
        }
      }

      setSaveStatus("saved");
    } catch (err) {
      console.error("Paste error:", err);
      setSaveStatus("error");
    }
  };

  // Multi-select helpers
  const handleToggleSelectRow = (rowId: string) => {
    setSelectedRowIds(prev => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedRowIds.size === filteredItems.length) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(filteredItems.map(i => i.id!)));
    }
  };

  const handleBulkDelete = async () => {
    for (const id of Array.from(selectedRowIds)) {
      await onDeleteRow(id);
    }
    setSelectedRowIds(new Set());
  };

  const handleBulkDuplicate = async () => {
    for (const id of Array.from(selectedRowIds)) {
      await onDuplicateRow(id);
    }
    setSelectedRowIds(new Set());
  };

  // Virtualization calculations for > 100 items
  const ROW_HEIGHT = 32;
  const isVirtual = filteredItems.length > 100;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight || 600);
    }
  }, []);

  const visibleRange = useMemo(() => {
    if (!isVirtual) return { start: 0, end: filteredItems.length };
    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 5);
    const end = Math.min(filteredItems.length, Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + 5);
    return { start, end };
  }, [isVirtual, scrollTop, containerHeight, filteredItems.length]);

  const visibleItems = filteredItems.slice(visibleRange.start, visibleRange.end);

  return (
    <div className="space-y-3 w-full">
      {/* Grid Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-muted/20 border border-border/60 rounded-lg text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search spreadsheet grid..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-background"
            />
          </div>

          {/* Autosave Status Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-background border border-border/50 text-[11px] font-mono shrink-0">
            {saveStatus === "saving" && (
              <>
                <RefreshCw className="w-3 h-3 text-primary animate-spin" />
                <span className="text-muted-foreground">Saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Saved</span>
              </>
            )}
            {saveStatus === "error" && (
              <>
                <AlertCircle className="w-3 h-3 text-destructive" />
                <span className="text-destructive font-semibold">Error saving</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Column Visibility Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1 text-xs font-medium shadow-xs hover:bg-accent hover:text-accent-foreground h-8 gap-1.5 cursor-pointer">
              <Eye className="w-3.5 h-3.5" /> Columns ({activeColumns.length})
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {columns.map(col => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={!hiddenColumnIds.has(col.id)}
                  onCheckedChange={checked => {
                    setHiddenColumnIds(prev => {
                      const next = new Set(prev);
                      if (checked) next.delete(col.id);
                      else next.add(col.id);
                      return next;
                    });
                  }}
                  className="text-xs"
                >
                  {col.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Presets Button */}
          {onOpenPresetPicker && (
            <Button size="sm" variant="outline" onClick={onOpenPresetPicker} className="h-8 text-xs gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Presets
            </Button>
          )}

          {/* Column Settings Modal Trigger */}
          {onOpenSettings && (
            <Button size="sm" variant="outline" onClick={onOpenSettings} className="h-8 text-xs gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Column Settings
            </Button>
          )}

          {/* Copy / Paste Actions */}
          <Button size="sm" variant="ghost" onClick={handlePasteClipboard} className="h-8 text-xs gap-1" title="Paste TSV from clipboard">
            <Upload className="w-3.5 h-3.5" /> Paste TSV
          </Button>
        </div>
      </div>

      {/* Empty State Banner when category has no custom columns */}
      {columns.length === 0 && onApplyPreset && (
        <EmptyGridBanner onApplyPreset={onApplyPreset} />
      )}

      {/* Main Spreadsheet Grid Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full overflow-x-auto overflow-y-auto max-h-[70vh] rounded-md border border-border bg-card shadow-sm relative focus:outline-none"
        tabIndex={0}
      >
        <table role="grid" className="w-full text-xs text-left border-collapse table-fixed">
          {/* Header Row */}
          <thead className="sticky top-0 z-20 bg-muted/90 backdrop-blur-sm border-b border-border shadow-xs">
            <tr role="row">
              {/* Row Number Header (#) - Sticky Left */}
              <th
                role="columnheader"
                className="w-12 min-w-12 max-w-12 sticky left-0 z-30 px-2 py-2 text-center bg-muted/95 border-r border-border font-mono text-muted-foreground select-none"
              >
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={filteredItems.length > 0 && selectedRowIds.size === filteredItems.length}
                    onCheckedChange={handleToggleSelectAll}
                    className="h-3.5 w-3.5"
                  />
                </div>
              </th>

              {/* Data Column Headers */}
              {activeColumns.map((col, index) => {
                const w = columnWidths[col.id] || col.width || 140;
                return (
                  <GridHeaderCell
                    key={col.id}
                    column={col}
                    index={index}
                    totalColumns={activeColumns.length}
                    width={w}
                    onUpdateColumn={(id, updates) => onUpdateColumn?.(id, updates)}
                    onDeleteColumn={id => onDeleteColumn?.(id)}
                    onMoveColumn={handleMoveColumn}
                    onResizeColumn={handleResizeColumn}
                  />
                );
              })}

              {/* Add Column Inline (+) Header Button */}
              {onAddColumn && (
                <th role="columnheader" className="w-10 min-w-10 max-w-10 px-1 py-1.5 text-center bg-muted/50 border-r border-border">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onAddColumn()}
                    className="h-6 w-6 text-primary hover:bg-primary/10 rounded"
                    title="Add new column inline"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </th>
              )}
            </tr>
          </thead>

          {/* Grid Body */}
          <tbody role="rowgroup" className="divide-y divide-border/30">
            {/* Top Spacer for Virtualization */}
            {isVirtual && visibleRange.start > 0 && (
              <tr style={{ height: visibleRange.start * ROW_HEIGHT }} />
            )}

            {visibleItems.map((item, index) => {
              const rowIndex = visibleRange.start + index;
              const isRowSelected = selectedRowIds.has(item.id!);

              return (
                <tr
                  key={item.id}
                  role="row"
                  className={`group transition-colors h-8 ${
                    isRowSelected ? "bg-primary/10 dark:bg-primary/15" : "hover:bg-muted/30"
                  }`}
                >
                  {/* Row Number Cell (#) - Sticky Left */}
                  <td
                    role="gridcell"
                    className="w-12 min-w-12 max-w-12 sticky left-0 z-10 px-2 py-1 text-center font-mono text-[11px] text-muted-foreground border-r border-border bg-card group-hover:bg-muted/50 select-none flex items-center justify-between"
                  >
                    <div className="flex items-center justify-center w-full gap-1">
                      <Checkbox
                        checked={isRowSelected}
                        onCheckedChange={() => handleToggleSelectRow(item.id!)}
                        className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100 transition-opacity"
                      />
                      <span className="group-hover:hidden">{rowIndex + 1}</span>
                    </div>
                  </td>

                  {/* Data Cells */}
                  {activeColumns.map(col => {
                    const colWidth = columnWidths[col.id] || col.width || 140;
                    const isCellSel = selectedCell?.rowId === item.id && selectedCell?.colId === col.id;
                    const isCellEd = editingCell?.rowId === item.id && editingCell?.colId === col.id;

                    return (
                      <GridCell
                        key={col.id}
                        item={item}
                        column={col}
                        width={colWidth}
                        isSelected={isCellSel}
                        isEditing={isCellEd}
                        sheetsPerReam={sheetsPerReam}
                        onSelect={() => setSelectedCell({ rowId: item.id!, colId: col.id })}
                        onStartEdit={() => setEditingCell({ rowId: item.id!, colId: col.id })}
                        onCommitEdit={val => handleCommitCellEdit(item.id!, col.id, val)}
                        onCancelEdit={() => setEditingCell(null)}
                        onNavigateKey={handleNavigateKey}
                      />
                    );
                  })}

                  {/* Row Context Options Cell */}
                  <td role="gridcell" className="w-10 px-1 py-1 text-center border-r border-border/30">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-opacity cursor-pointer border-none bg-transparent">
                        <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 text-xs">
                        <DropdownMenuItem onClick={() => onAddRow(undefined, rowIndex)}>
                          <Plus className="w-3.5 h-3.5 mr-2" /> Insert Row Above
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAddRow(undefined, rowIndex + 1)}>
                          <Plus className="w-3.5 h-3.5 mr-2" /> Insert Row Below
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDuplicateRow(item.id!)}>
                          <Copy className="w-3.5 h-3.5 mr-2" /> Duplicate Row
                        </DropdownMenuItem>
                        {onEditItemInModal && (
                          <DropdownMenuItem onClick={() => onEditItemInModal(item)}>
                            Open Detail Form
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDeleteRow(item.id!)} className="text-destructive">
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Row
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}

            {/* Bottom Spacer for Virtualization */}
            {isVirtual && visibleRange.end < filteredItems.length && (
              <tr style={{ height: (filteredItems.length - visibleRange.end) * ROW_HEIGHT }} />
            )}

            {/* Add New Row Line Button */}
            <tr role="row">
              <td colSpan={activeColumns.length + 2} className="p-0 border-t border-border">
                <button
                  onClick={() => onAddRow()}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground flex items-center transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 mr-2 text-primary" /> + Add row
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Floating Bulk Selection Action Bar */}
      <BulkSelectionBar
        selectedCount={selectedRowIds.size}
        onDuplicate={handleBulkDuplicate}
        onDelete={handleBulkDelete}
        onClear={() => setSelectedRowIds(new Set())}
      />
    </div>
  );
}
