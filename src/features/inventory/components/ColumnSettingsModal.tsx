"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { stockCategoryRepo } from "../services/stock.repository";
import { StockCategory, ColumnDef } from "../models/stock";
import { PAPER_PRESET_COLUMNS, mergePaperPreset, COMMON_GSM_SUGGESTIONS } from "../constants/paper-preset";
import { AuditService } from "@/services/audit.service";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2, ArrowUp, ArrowDown, Sparkles, Eye, EyeOff } from "lucide-react";

interface ColumnSettingsModalProps {
  category: StockCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ColumnSettingsModal({
  category,
  open,
  onOpenChange,
}: ColumnSettingsModalProps) {
  const { user } = useAuth();
  const [columns, setColumns] = useState<ColumnDef[]>(category.columns || []);
  const [sheetsPerReam, setSheetsPerReam] = useState<number>(category.sheetsPerReam || 500);
  const [categoryName, setCategoryName] = useState<string>(category.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [newOptionInputs, setNewOptionInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (category) {
      setColumns(category.columns || []);
      setSheetsPerReam(category.sheetsPerReam || 500);
      setCategoryName(category.name || "");
    }
  }, [category, open]);

  const handleSave = async (updatedColumns: ColumnDef[], updatedSheetsPerReam: number, nameToSave?: string) => {
    try {
      setIsSaving(true);
      const name = nameToSave ?? categoryName;

      await stockCategoryRepo.update(category.id!, {
        name,
        columns: updatedColumns,
        sheetsPerReam: updatedSheetsPerReam
      });

      await AuditService.logEvent({
        entityId: category.id!,
        entityType: "category_columns",
        action: "UPDATED",
        userId: user?.uid,
        oldValue: { columns: category.columns, sheetsPerReam: category.sheetsPerReam },
        newValue: { columns: updatedColumns, sheetsPerReam: updatedSheetsPerReam },
        reason: "Updated category column settings"
      });
    } catch (err) {
      console.error("Failed to update category columns:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPaperPreset = async () => {
    const merged = mergePaperPreset(columns);
    setColumns(merged);
    await handleSave(merged, sheetsPerReam);
  };

  const handleAddColumn = () => {
    const newId = `col_${Date.now()}`;
    const newCol: ColumnDef = {
      id: newId,
      label: `Column ${columns.length + 1}`,
      type: "text",
      required: false,
      showInTable: true,
      order: columns.length + 1
    };
    const updated = [...columns, newCol];
    setColumns(updated);
    handleSave(updated, sheetsPerReam);
  };

  const handleColumnUpdate = (colId: string, updates: Partial<ColumnDef>) => {
    const updated = columns.map(c => (c.id === colId ? { ...c, ...updates } : c));
    setColumns(updated);
    handleSave(updated, sheetsPerReam);
  };

  const handleDeleteColumn = (colId: string) => {
    const updated = columns.filter(c => c.id !== colId);
    setColumns(updated);
    handleSave(updated, sheetsPerReam);
  };

  const handleMoveColumn = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === columns.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newCols = [...columns];
    const temp = newCols[index];
    newCols[index] = newCols[targetIndex];
    newCols[targetIndex] = temp;

    const reordered = newCols.map((col, idx) => ({ ...col, order: idx + 1 }));
    setColumns(reordered);
    handleSave(reordered, sheetsPerReam);
  };

  const handleAddOption = (colId: string) => {
    const inputVal = (newOptionInputs[colId] || "").trim();
    if (!inputVal) return;

    const col = columns.find(c => c.id === colId);
    if (!col) return;

    const currentOptions = col.options || [];
    if (currentOptions.includes(inputVal)) return;

    const updatedOptions = [...currentOptions, inputVal];
    handleColumnUpdate(colId, { options: updatedOptions });

    setNewOptionInputs(prev => ({ ...prev, [colId]: "" }));
  };

  const handleRemoveOption = (colId: string, optionToRemove: string) => {
    const col = columns.find(c => c.id === colId);
    if (!col) return;
    const updatedOptions = (col.options || []).filter(o => o !== optionToRemove);
    handleColumnUpdate(colId, { options: updatedOptions });
  };

  const handleMoveOption = (colId: string, index: number, direction: "up" | "down") => {
    const col = columns.find(c => c.id === colId);
    if (!col || !col.options) return;

    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === col.options.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newOpts = [...col.options];
    const temp = newOpts[index];
    newOpts[index] = newOpts[targetIndex];
    newOpts[targetIndex] = temp;

    handleColumnUpdate(colId, { options: newOpts });
  };

  const handleSheetsPerReamChange = (val: number) => {
    const safeVal = Math.max(1, Math.floor(val || 500));
    setSheetsPerReam(safeVal);
    handleSave(columns, safeVal);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Column Settings: {category.name}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Customize category attributes, data types, validation rules, and ream sizing.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Start Preset Callout (Fixed Layout Bug: no overflow, w-full, max-w-full, break-words) */}
          <div className="w-full max-w-full break-words bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800/60 text-sm overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                Quick start: add the standard Paper columns.
              </p>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                Adds Paper Type, GSM, Size, and Quantity (Reams) to this category without overwriting existing columns.
              </p>
            </div>
            <Button
              onClick={handleAddPaperPreset}
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 self-start sm:self-center"
            >
              Add Paper columns
            </Button>
          </div>

          {/* Category Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/20 border border-border/50">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Category Name</Label>
              <Input
                value={categoryName}
                onChange={(e) => {
                  setCategoryName(e.target.value);
                  handleSave(columns, sheetsPerReam, e.target.value);
                }}
                placeholder="e.g. Paper Stock"
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span>Sheets Per Ream (sheetsPerReam)</span>
                <span className="text-[10px] text-muted-foreground font-normal">Default: 500</span>
              </Label>
              <Input
                type="number"
                min={1}
                step={1}
                value={sheetsPerReam}
                onChange={(e) => handleSheetsPerReamChange(parseInt(e.target.value, 10))}
                placeholder="500"
                className="h-9 font-mono"
              />
            </div>
          </div>

          {/* Columns Header & Add Button */}
          <div className="flex items-center justify-between pt-2">
            <h3 className="text-sm font-bold tracking-tight uppercase text-muted-foreground">
              Columns ({columns.length})
            </h3>
            <Button size="sm" variant="outline" onClick={handleAddColumn}>
              <Plus className="w-4 h-4 mr-1.5" /> Add Column
            </Button>
          </div>

          {/* Columns List */}
          {columns.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed rounded-lg text-muted-foreground">
              <p className="text-sm">No columns created yet.</p>
              <p className="text-xs mt-1 text-muted-foreground/70">
                Click "Add Paper columns" above or "Add Column" to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {columns.map((col, index) => (
                <div
                  key={col.id}
                  className="p-4 rounded-lg border border-border/60 bg-card shadow-sm space-y-4 transition-all"
                >
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          disabled={index === 0}
                          onClick={() => handleMoveColumn(index, "up")}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          disabled={index === columns.length - 1}
                          onClick={() => handleMoveColumn(index, "down")}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <span className="font-mono text-xs text-muted-foreground w-6">#{index + 1}</span>

                      <Input
                        value={col.label}
                        onChange={(e) => handleColumnUpdate(col.id, { label: e.target.value })}
                        placeholder="Column Label"
                        className="h-8 font-semibold text-sm w-44"
                      />

                      <Badge variant="secondary" className="uppercase text-[10px]">
                        {col.type}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={col.showInTable ? "secondary" : "ghost"}
                        onClick={() => handleColumnUpdate(col.id, { showInTable: !col.showInTable })}
                        className="h-8 text-xs gap-1"
                      >
                        {col.showInTable ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="hidden sm:inline">In Table</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="hidden sm:inline">Form Only</span>
                          </>
                        )}
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteColumn(col.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">ID (slug)</Label>
                      <Input
                        value={col.id}
                        onChange={(e) => handleColumnUpdate(col.id, { id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })}
                        className="h-8 font-mono text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Type</Label>
                      <Select
                        value={col.type}
                        onValueChange={(val: string | null) => {
                          if (val && ["text", "number", "select", "quantity_reams"].includes(val)) {
                            handleColumnUpdate(col.id, { type: val as ColumnDef["type"] });
                          }
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">text</SelectItem>
                          <SelectItem value="number">number</SelectItem>
                          <SelectItem value="select">select</SelectItem>
                          <SelectItem value="quantity_reams">quantity_reams</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Unit (optional)</Label>
                      <Input
                        value={col.unit || ""}
                        onChange={(e) => handleColumnUpdate(col.id, { unit: e.target.value })}
                        placeholder="e.g. gsm, mm, sheets"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-1 border-t border-border/30 text-xs">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={col.required}
                        onCheckedChange={(checked) => handleColumnUpdate(col.id, { required: checked })}
                      />
                      <Label className="text-xs cursor-pointer">Required</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={col.showInTable}
                        onCheckedChange={(checked) => handleColumnUpdate(col.id, { showInTable: checked })}
                      />
                      <Label className="text-xs cursor-pointer">Show in Table</Label>
                    </div>

                    {col.type === "select" && (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={col.allowCustomOption ?? true}
                          onCheckedChange={(checked) => handleColumnUpdate(col.id, { allowCustomOption: checked })}
                        />
                        <Label className="text-xs cursor-pointer">Allow Custom Options</Label>
                      </div>
                    )}
                  </div>

                  {col.type === "number" && (
                    <div className="space-y-2 pt-2 border-t border-border/30">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Min Value</Label>
                          <Input
                            type="number"
                            value={col.min ?? ""}
                            onChange={(e) => handleColumnUpdate(col.id, { min: e.target.value !== "" ? parseFloat(e.target.value) : undefined })}
                            placeholder="No min"
                            className="h-8 font-mono text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Max Value</Label>
                          <Input
                            type="number"
                            value={col.max ?? ""}
                            onChange={(e) => handleColumnUpdate(col.id, { max: e.target.value !== "" ? parseFloat(e.target.value) : undefined })}
                            placeholder="No max"
                            className="h-8 font-mono text-xs"
                          />
                        </div>
                      </div>

                      {(col.unit === "gsm" || col.id === "gsm") && (
                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground">Common GSM presets:</Label>
                          <div className="flex flex-wrap gap-1">
                            {COMMON_GSM_SUGGESTIONS.map((gsm) => (
                              <Button
                                key={gsm}
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-6 px-1.5 text-[10px] font-mono"
                                onClick={() => handleColumnUpdate(col.id, { min: 40, max: 500 })}
                              >
                                {gsm}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {col.type === "select" && (
                    <div className="space-y-3 pt-2 border-t border-border/30">
                      <Label className="text-xs font-semibold">Options Editor</Label>

                      <div className="flex items-center gap-2">
                        <Input
                          value={newOptionInputs[col.id] || ""}
                          onChange={(e) => setNewOptionInputs(prev => ({ ...prev, [col.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddOption(col.id);
                            }
                          }}
                          placeholder="Add new dropdown option..."
                          className="h-8 text-xs"
                        />
                        <Button
                          size="sm"
                          type="button"
                          variant="secondary"
                          onClick={() => handleAddOption(col.id)}
                          className="h-8 text-xs"
                        >
                          Add Option
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(col.options || []).map((opt, optIndex) => (
                          <div
                            key={opt}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 text-xs border border-border/50"
                          >
                            <span>{opt}</span>
                            <div className="flex items-center gap-0.5 ml-1">
                              <button
                                type="button"
                                disabled={optIndex === 0}
                                onClick={() => handleMoveOption(col.id, optIndex, "up")}
                                className="hover:text-primary disabled:opacity-30"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                disabled={optIndex === (col.options?.length || 0) - 1}
                                onClick={() => handleMoveOption(col.id, optIndex, "down")}
                                className="hover:text-primary disabled:opacity-30"
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(col.id, opt)}
                                className="text-destructive hover:opacity-75 ml-1"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t border-border/50 bg-muted/10">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
