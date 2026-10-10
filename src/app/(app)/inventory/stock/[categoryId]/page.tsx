"use client";

import React, { useEffect, useState, useCallback } from "react";
import { stockCategoryRepo, stockItemRepo } from "@/features/inventory/services/stock.repository";
import { StockCategory, StockItem, ColumnDef } from "@/features/inventory/models/stock";
import { SpreadsheetGrid } from "@/components/ui/spreadsheet-grid/SpreadsheetGrid";
import { ColumnSettingsModal } from "@/features/inventory/components/ColumnSettingsModal";
import { ItemFormModal } from "@/features/inventory/components/ItemFormModal";
import { PresetPickerModal } from "@/features/inventory/components/PresetPickerModal";
import { CATEGORY_PRESETS, mergePreset, CategoryPreset } from "@/lib/inventory/presets";
import { Card } from "@/components/ui/card";
import { Settings, FileSpreadsheet, Plus, AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuditService } from "@/services/audit.service";
import { useAuth } from "@/contexts/AuthContext";

export default function StockCategoryPage({ params }: { params: any }) {
  const { user } = useAuth();
  const unwrappedParams = React.use(params) as { categoryId: string };
  const categoryId = unwrappedParams.categoryId;

  const [category, setCategory] = useState<StockCategory | null>(null);
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPresetPickerOpen, setIsPresetPickerOpen] = useState(false);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubCat = stockCategoryRepo.subscribe(
      [{ field: "id", operator: "==", value: categoryId }],
      {},
      (data) => {
        if (data.length > 0) {
          setCategory(data[0]);
        } else {
          setError("Category not found");
        }
      }
    );

    const unsubItems = stockItemRepo.subscribe(
      [{ field: "categoryId", operator: "==", value: categoryId }],
      {},
      (data) => {
        const active = data.filter(i => !i.isDeleted && !i.deletedAt);
        setItems(active);
        setLoading(false);
      }
    );

    return () => {
      unsubCat();
      unsubItems();
    };
  }, [categoryId]);

  // Inline Cell Data Change with Autosave
  const handleDataChange = useCallback(async (id: string, colId: string, value: any) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const currentValues = item.values || item.data || {};
    const newValues = { ...currentValues, [colId]: value };

    // Optimistic UI update
    setItems(prev => prev.map(i => (i.id === id ? { ...i, values: newValues } : i)));

    await stockItemRepo.update(id, {
      values: newValues
    });
  }, [items]);

  // Add row
  const handleAddRow = useCallback(async (groupValue?: string, targetIndex?: number) => {
    if (!category) return;
    const initialValues: Record<string, any> = {};

    if (groupValue && category.groupByColumn && groupValue !== "Uncategorized") {
      initialValues[category.groupByColumn] = groupValue;
    }

    await stockItemRepo.create({
      categoryId: category.id!,
      values: initialValues
    } as any);
  }, [category]);

  // Soft Delete Row
  const handleDeleteRow = useCallback(async (id: string) => {
    await stockItemRepo.softDelete(id);
  }, []);

  // Duplicate Row
  const handleDuplicateRow = useCallback(async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item || !category) return;
    const currentValues = item.values || item.data || {};

    await stockItemRepo.create({
      categoryId: category.id!,
      values: { ...currentValues }
    } as any);
  }, [items, category]);

  // Add Column Inline (+)
  const handleAddColumn = useCallback(async () => {
    if (!category) return;
    const cols = category.columns || [];
    const newId = `col_${Date.now()}`;
    const newCol: ColumnDef = {
      id: newId,
      label: `Column ${cols.length + 1}`,
      type: "text",
      required: false,
      showInTable: true,
      order: cols.length + 1
    };

    const updatedCols = [...cols, newCol];
    await stockCategoryRepo.update(category.id!, { columns: updatedCols });
  }, [category]);

  // Update Column In-Place
  const handleUpdateColumn = useCallback(async (colId: string, updates: Partial<ColumnDef>) => {
    if (!category) return;
    const cols = (category.columns || []).map(c => (c.id === colId ? { ...c, ...updates } : c));
    await stockCategoryRepo.update(category.id!, { columns: cols });
  }, [category]);

  // Delete Column In-Place
  const handleDeleteColumn = useCallback(async (colId: string) => {
    if (!category) return;
    const cols = (category.columns || []).filter(c => c.id !== colId);
    await stockCategoryRepo.update(category.id!, { columns: cols });
  }, [category]);

  // Reorder Columns
  const handleReorderColumns = useCallback(async (reordered: ColumnDef[]) => {
    if (!category) return;
    await stockCategoryRepo.update(category.id!, { columns: reordered });
  }, [category]);

  // Apply Preset
  const handleApplyPreset = useCallback(async (preset: CategoryPreset = CATEGORY_PRESETS.paper) => {
    if (!category) return;
    const existing = category.columns || [];
    const merged = mergePreset(existing, preset.columns);
    const sheetsPerReam = preset.sheetsPerReam ?? category.sheetsPerReam ?? 500;

    await stockCategoryRepo.update(category.id!, {
      columns: merged,
      sheetsPerReam,
      presetId: preset.id
    });

    await AuditService.logEvent({
      entityId: category.id!,
      entityType: "category_preset",
      action: "PRESET_APPLIED",
      userId: user?.uid,
      reason: `Applied ${preset.label} preset columns`
    });
  }, [category, user]);

  const handleOpenEditModal = (item: StockItem) => {
    setEditingItem(item);
    setIsItemFormOpen(true);
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setIsItemFormOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-9 w-32 bg-muted animate-pulse rounded" />
        </div>
        <Card className="p-12 text-center text-muted-foreground flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-primary" />
          <span>Loading category grid...</span>
        </Card>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold">Category Not Found</h3>
        <p className="text-sm text-muted-foreground">
          The category you are trying to access does not exist or was deleted.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-primary" />
            {category.name}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Excel-style interactive grid. Single-click to select, type or Enter to edit, Tab/Enter to navigate.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsPresetPickerOpen(true)}>
            <Sparkles className="w-4 h-4 mr-2 text-amber-500" /> Presets
          </Button>
          <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="w-4 h-4 mr-2" /> Column Settings
          </Button>
          <Button onClick={handleOpenCreateModal}>
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <SpreadsheetGrid
        columns={category.columns || []}
        data={items}
        sheetsPerReam={category.sheetsPerReam || 500}
        reorderLevel={category.reorderLevel || 0}
        onDataChange={handleDataChange}
        onAddRow={handleAddRow}
        onDeleteRow={handleDeleteRow}
        onDuplicateRow={handleDuplicateRow}
        onUpdateColumn={handleUpdateColumn}
        onAddColumn={handleAddColumn}
        onDeleteColumn={handleDeleteColumn}
        onReorderColumns={handleReorderColumns}
        onApplyPreset={() => handleApplyPreset(CATEGORY_PRESETS.paper)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPresetPicker={() => setIsPresetPickerOpen(true)}
        onEditItemInModal={handleOpenEditModal}
        groupByColumn={category.groupByColumn}
      />

      {/* Column Settings Modal */}
      <ColumnSettingsModal
        category={category}
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />

      {/* Preset Picker Modal */}
      <PresetPickerModal
        currentPresetId={category.presetId}
        open={isPresetPickerOpen}
        onOpenChange={setIsPresetPickerOpen}
        onSelectPreset={handleApplyPreset}
      />

      {/* Item Form Modal */}
      <ItemFormModal
        categoryId={category.id!}
        columns={category.columns || []}
        sheetsPerReam={category.sheetsPerReam || 500}
        editingItem={editingItem}
        open={isItemFormOpen}
        onOpenChange={setIsItemFormOpen}
        onSuccess={() => setIsItemFormOpen(false)}
      />
    </div>
  );
}
