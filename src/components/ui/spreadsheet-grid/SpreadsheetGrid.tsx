"use client";

import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { StockColumn, StockItem } from "@/features/inventory/models/stock";
import { ChevronRight, ChevronDown, Plus, Copy, MoreHorizontal, Trash2, Copy as CopyIcon, AlertTriangle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface SpreadsheetGridProps {
  columns: StockColumn[];
  data: StockItem[];
  onDataChange: (id: string, field: string, value: any) => void;
  onAddRow: (groupedValue?: string) => void;
  onDeleteRow: (id: string) => void;
  onDuplicateRow: (id: string) => void;
  groupByColumn?: string;
  sortByColumn?: string;
}

// Helper to convert number to fraction string
export function formatFraction(value: number | undefined | null): string {
  if (value === undefined || value === null) return "";
  if (Number.isInteger(value)) return value.toString();
  
  const whole = Math.floor(value);
  const decimal = value - whole;
  
  let fraction = "";
  if (Math.abs(decimal - 0.25) < 0.01) fraction = "1/4";
  else if (Math.abs(decimal - 0.5) < 0.01) fraction = "1/2";
  else if (Math.abs(decimal - 0.75) < 0.01) fraction = "3/4";
  else return value.toString(); // Fallback if not standard quarter
  
  return whole > 0 ? `${whole} ${fraction}` : fraction;
}

// Helper to parse fraction string to number
export function parseFraction(text: string): number {
  if (!text) return 0;
  text = text.trim();
  
  // E.g. "1 1/2"
  const parts = text.split(" ");
  if (parts.length === 2) {
    const whole = parseFloat(parts[0]);
    const fracParts = parts[1].split("/");
    if (fracParts.length === 2) {
      return whole + (parseFloat(fracParts[0]) / parseFloat(fracParts[1]));
    }
  }
  
  // E.g. "1/2"
  if (text.includes("/")) {
    const fracParts = text.split("/");
    if (fracParts.length === 2) {
      return parseFloat(fracParts[0]) / parseFloat(fracParts[1]);
    }
  }
  
  return parseFloat(text) || 0;
}

export function SpreadsheetGrid({
  columns,
  data,
  onDataChange,
  onAddRow,
  onDeleteRow,
  onDuplicateRow,
  groupByColumn
}: SpreadsheetGridProps) {
  const [editingCell, setEditingCell] = useState<{ rowId: string, colId: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);
  
  // Grouping logic
  const groupedData = React.useMemo(() => {
    if (!groupByColumn) return { "All": data };
    const groups: Record<string, StockItem[]> = {};
    data.forEach(item => {
      const val = item.data[groupByColumn] || "Uncategorized";
      if (!groups[val]) groups[val] = [];
      groups[val].push(item);
    });
    return groups;
  }, [data, groupByColumn]);

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Expand all by default
    const initial: Record<string, boolean> = {};
    Object.keys(groupedData).forEach(k => initial[k] = true);
    setExpandedGroups(initial);
  }, [Object.keys(groupedData).length]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent, rowId: string, colId: string, groupKey: string, rowIndex: number, colIndex: number) => {
    if (e.key === "Enter" || e.key === "Escape") {
      commitEdit();
      e.preventDefault();
      return;
    }
    
    if (e.key === "Tab") {
      commitEdit();
      e.preventDefault();
      // Move to next cell
      const nextColIndex = e.shiftKey ? colIndex - 1 : colIndex + 1;
      if (nextColIndex >= 0 && nextColIndex < columns.length) {
        startEditing(rowId, columns[nextColIndex].id, data.find(d => d.id === rowId)?.data[columns[nextColIndex].id], columns[nextColIndex].type);
      }
    }
  };

  const startEditing = (rowId: string, colId: string, currentValue: any, type: string) => {
    setEditingCell({ rowId, colId });
    if (type === 'fraction') {
      setEditValue(formatFraction(currentValue));
    } else {
      setEditValue(currentValue?.toString() || "");
    }
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const commitEdit = () => {
    if (!editingCell) return;
    const col = columns.find(c => c.id === editingCell.colId);
    let finalValue: any = editValue;
    
    if (col?.type === 'number') finalValue = parseFloat(editValue) || 0;
    if (col?.type === 'fraction') finalValue = parseFraction(editValue);

    onDataChange(editingCell.rowId, editingCell.colId, finalValue);
    setEditingCell(null);
  };

  const renderCellContent = (item: StockItem, col: StockColumn) => {
    const val = item.data[col.id];
    
    if (col.type === 'fraction') {
      return formatFraction(val) + (val ? " Reams" : "");
    }
    
    return val || "";
  };

  return (
    <div className="w-full overflow-x-auto rounded-md border bg-card">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="w-8 px-2 py-2"></th>
            {columns.map(col => (
              <th key={col.id} className={`px-4 py-2 font-medium text-muted-foreground ${col.type === 'number' || col.type === 'fraction' ? 'text-right' : ''}`} style={{ width: col.width || 'auto' }}>
                {col.name}
              </th>
            ))}
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedData).map(([groupName, items]) => (
            <React.Fragment key={groupName}>
              {/* Group Header */}
              {groupByColumn && (
                <tr className="bg-muted/20 border-b group cursor-pointer hover:bg-muted/30" onClick={() => toggleGroup(groupName)}>
                  <td className="px-2 py-2">
                    {expandedGroups[groupName] ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </td>
                  <td colSpan={columns.length + 1} className="px-4 py-2 font-semibold flex items-center justify-between">
                    <span>{groupName === 'Uncategorized' ? 'All Items' : groupName} <span className="text-muted-foreground text-xs font-normal ml-2">({items.length})</span></span>
                    <button 
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded text-xs flex items-center gap-1 text-primary mr-8"
                      onClick={(e) => { e.stopPropagation(); onAddRow(groupName); }}
                    >
                      <Plus className="w-3 h-3" /> Add Item
                    </button>
                  </td>
                </tr>
              )}
              
              {/* Rows */}
              {expandedGroups[groupName] !== false && items.map((item, rowIndex) => {
                const isLowStock = item.lowStockThreshold && (item.data.quantity || 0) <= item.lowStockThreshold;

                return (
                  <tr key={item.id} className={`border-b hover:bg-muted/10 transition-colors ${isLowStock ? 'bg-red-50/50 dark:bg-red-950/10' : ''}`}>
                    <td className="px-2 py-2 text-center text-muted-foreground border-r bg-muted/5">
                      <span className="text-[10px]">{rowIndex + 1}</span>
                    </td>
                    
                    {columns.map((col, colIndex) => {
                      const isEditing = editingCell?.rowId === item.id && editingCell?.colId === col.id;
                      
                      return (
                        <td 
                          key={col.id}
                          className={`px-4 py-2 border-r relative group/cell ${col.type === 'number' || col.type === 'fraction' ? 'text-right' : ''}`}
                          onClick={() => !isEditing && startEditing(item.id!, col.id, item.data[col.id], col.type)}
                        >
                          {isEditing ? (
                            col.type === 'dropdown' ? (
                              <select 
                                ref={inputRef as any}
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onBlur={commitEdit}
                                onKeyDown={(e) => handleKeyDown(e, item.id!, col.id, groupName, rowIndex, colIndex)}
                                className="w-full absolute inset-0 px-4 py-2 bg-background border-2 border-primary focus:outline-none z-10"
                              >
                                <option value="">Select...</option>
                                {col.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            ) : (
                              <input
                                ref={inputRef as any}
                                type={col.type === 'number' ? 'number' : 'text'}
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onBlur={commitEdit}
                                onKeyDown={(e) => handleKeyDown(e, item.id!, col.id, groupName, rowIndex, colIndex)}
                                className="w-full absolute inset-0 px-4 py-2 bg-background border-2 border-primary focus:outline-none z-10"
                                autoFocus
                              />
                            )
                          ) : (
                            <div className="min-h-[20px] flex items-center">
                              {col.type === 'number' || col.type === 'fraction' ? <div className="w-full text-right">{renderCellContent(item, col)}</div> : renderCellContent(item, col)}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    
                    <td className="px-2 py-2 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onDuplicateRow(item.id!)}>
                            <CopyIcon className="w-4 h-4 mr-2" /> Duplicate Row
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDeleteRow(item.id!)} className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Row
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </React.Fragment>
          ))}
          
          {/* Add Row Button at bottom */}
          <tr>
            <td colSpan={columns.length + 2} className="p-0">
              <button 
                onClick={() => onAddRow()} 
                className="w-full text-left px-4 py-3 text-sm text-muted-foreground hover:bg-muted/30 hover:text-foreground flex items-center transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" /> Add new row
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
