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
import { CATEGORY_PRESETS, mergePreset, CategoryPreset } from "@/lib/inventory/presets";
import { COMMON_GSM_SUGGESTIONS } from "../constants/paper-preset";
import { AuditService } from "@/services/audit.service";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2, ArrowUp, ArrowDown, Sparkles, Eye, EyeOff, Layers } from "lucide-react";

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
  const [reorderLevel, setReorderLevel] = useState<number>(category.reorderLevel || 0);
  const [categoryName, setCategoryName] = useState<string>(category.name || "");
  const [activePresetId, setActivePresetId] = useState<string | undefined>(category.presetId);
  const [isSaving, setIsSaving] = useState(false);
  const [newOptionInputs, setNewOptionInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (category) {
      setColumns(category.columns || []);
      setSheetsPerReam(category.sheetsPerReam || 500);
      setReorderLevel(category.reorderLevel || 0);
      setCategoryName(category.name || "");
      setActivePresetId(category.presetId);
    }
  }, [category, open]);

  const handleSave = async (
    updatedColumns: ColumnDef[],
    updatedSheetsPerReam: number,
    updatedReorderLevel: number,
    nameToSave?: string,
    presetIdToSave?: string
  ) => {
    try {
      setIsSaving(true);
      const name = nameToSave ?? categoryName;
      const presetId = presetIdToSave ?? activePresetId;

      await stockCategoryRepo.update(category.id!, {
        name,
        columns: updatedColumns,
        sheetsPerReam: updatedSheetsPerReam,
        reorderLevel: updatedReorderLevel,
        presetId
      });

      await AuditService.logEvent({
        entityId: category.id!,
        entityType: "category_columns",
        action: "UPDATED",
        userId: user?.uid,
        oldValue: { columns: category.columns, reorderLevel: category.reorderLevel },
        newValue: { columns: updatedColumns, reorderLevel: updatedReorderLevel, presetId },
        reason: "Updated category column settings"
      });
    } catch (err) {
      console.error("Failed to update category columns:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyPreset = async (preset: CategoryPreset) => {
    const merged = mergePreset(columns, preset.columns);
    const newPerReam = preset.sheetsPerReam ?? sheetsPerReam;
    setColumns(merged);
    setSheetsPerReam(newPerReam);
    setActivePresetId(preset.id);

    await handleSave(merged, newPerReam, reorderLevel, undefined, preset.id);

    await AuditService.logEvent({
      entityId: category.id!,
      entityType: "category_preset",
      action: "PRESET_APPLIED",
      userId: user?.uid,
      reason: `Applied ${preset.label} category preset`
    });
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
    handleSave(updated, sheetsPerReam, reorderLevel);
  };

  const handleColumnUpdate = (colId: string, updates: Partial<ColumnDef>) => {
    const updated = columns.map(c => (c.id === colId ? { ...c, ...updates } : c));
    setColumns(updated);
    handleSave(updated, sheetsPerReam, reorderLevel);
  };

  const handleDeleteColumn = (colId: string) => {
    const updated = columns.filter(c => c.id !== colId);
    setColumns(updated);
    handleSave(updated, sheetsPerReam, reorderLevel);
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
    handleSave(reordered, sheetsPerReam, reorderLevel);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Column Settings: {category.name}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Configure category attributes, preset templates, data types, and reorder levels.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Preset Picker Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> Category Presets
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.values(CATEGORY_PRESETS).map((preset) => (
                <div
                  key={preset.id}
                  className={`p-3.5 rounded-lg border transition-all flex flex-col justify-between space-y-2 ${
                    activePresetId === preset.id
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-border/60 hover:border-border bg-card"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{preset.label}</span>
                      {activePresetId === preset.id && (
                        <Badge variant="default" className="text-[10px] h-4">Active</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{preset.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={activePresetId === preset.id ? "secondary" : "outline"}
                    onClick={() => handleApplyPreset(preset)}
                    className="w-full h-7 text-xs mt-2"
                  >
                    Apply {preset.label} Columns
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Category Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/20 border border-border/50">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Category Name</Label>
              <Input
                value={categoryName}
                onChange={(e) => {
                  setCategoryName(e.target.value);
                  handleSave(columns, sheetsPerReam, reorderLevel, e.target.value);
                }}
                placeholder="e.g. Paper Stock"
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Sheets Per Ream</Label>
              <Input
                type="number"
                min={1}
                step={1}
                value={sheetsPerReam}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value, 10) || 500);
                  setSheetsPerReam(val);
                  handleSave(columns, val, reorderLevel);
                }}
                placeholder="500"
                className="h-9 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span>Low-Stock Reorder Level</span>
                <span className="text-[10px] text-muted-foreground font-normal">(Base unit)</span>
              </Label>
              <Input
                type="number"
                min={0}
                step="any"
                value={reorderLevel || ""}
                onChange={(e) => {
                  const val = Math.max(0, parseFloat(e.target.value) || 0);
                  setReorderLevel(val);
                  handleSave(columns, sheetsPerReam, val);
                }}
                placeholder="e.g. 100"
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
              <p className="text-sm font-semibold">No columns created yet.</p>
              <p className="text-xs mt-1 text-muted-foreground/70">
                Choose a category preset above or click "Add Column" to get started.
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
                          if (val && ["text", "number", "select", "quantity_reams", "quantity_units"].includes(val)) {
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
                          <SelectItem value="quantity_units">quantity_units</SelectItem>
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

                  {/* Config for quantity_units */}
                  {(col.type === "quantity_units" || col.type === "quantity_reams") && (
                    <div className="grid grid-cols-3 gap-3 p-3 rounded bg-muted/30 border border-border/40">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Unit Label (e.g. tin, box, bottle)</Label>
                        <Input
                          value={col.unitLabel || ""}
                          onChange={(e) => handleColumnUpdate(col.id, { unitLabel: e.target.value })}
                          placeholder="tin"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Pack Size</Label>
                        <Input
                          type="number"
                          value={col.packSize ?? ""}
                          onChange={(e) => handleColumnUpdate(col.id, { packSize: parseFloat(e.target.value) || 1 })}
                          placeholder="1"
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Pack Base Unit (e.g. kg, L, pcs)</Label>
                        <Input
                          value={col.packUnit || ""}
                          onChange={(e) => handleColumnUpdate(col.id, { packUnit: e.target.value })}
                          placeholder="kg"
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  )}

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
