"use client";

import React, { useEffect, useState } from "react";
import { stockCategoryRepo, stockItemRepo } from "@/features/inventory/services/stock.repository";
import { StockCategory, StockItem } from "@/features/inventory/models/stock";
import { SpreadsheetGrid } from "@/components/ui/spreadsheet-grid/SpreadsheetGrid";
import { ColumnSettingsModal } from "@/features/inventory/components/ColumnSettingsModal";
import { ItemFormModal } from "@/features/inventory/components/ItemFormModal";
import { Card } from "@/components/ui/card";
import { Search, Settings, FileSpreadsheet, Plus, AlertCircle, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function StockCategoryPage({ params }: { params: any }) {
  const unwrappedParams = React.use(params) as { categoryId: string };
  const categoryId = unwrappedParams.categoryId;

  const [category, setCategory] = useState<StockCategory | null>(null);
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  const handleDataChange = async (id: string, colId: string, value: any) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const currentValues = item.values || item.data || {};
    const newValues = { ...currentValues, [colId]: value };

    // Optimistic UI update
    setItems(prev => prev.map(i => (i.id === id ? { ...i, values: newValues } : i)));

    try {
      await stockItemRepo.update(id, {
        values: newValues
      });
    } catch (err) {
      console.error("Failed to update item cell value:", err);
    }
  };

  const handleAddRow = async (groupValue?: string) => {
    if (!category) return;
    const initialValues: Record<string, any> = {};

    if (groupValue && category.groupByColumn && groupValue !== "Uncategorized") {
      initialValues[category.groupByColumn] = groupValue;
    }

    try {
      await stockItemRepo.create({
        categoryId: category.id!,
        values: initialValues
      } as any);
    } catch (err) {
      console.error("Failed to create row:", err);
    }
  };

  // Soft delete row via repository softDelete
  const handleDeleteRow = async (id: string) => {
    try {
      await stockItemRepo.softDelete(id);
    } catch (err) {
      console.error("Failed to soft delete item:", err);
    }
  };

  const handleDuplicateRow = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item || !category) return;

    const currentValues = item.values || item.data || {};

    try {
      await stockItemRepo.create({
        categoryId: category.id!,
        values: { ...currentValues }
      } as any);
    } catch (err) {
      console.error("Failed to duplicate row:", err);
    }
  };

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
          <span>Loading category inventory...</span>
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

  const filteredItems = items.filter(item => {
    if (!search) return true;
    const term = search.toLowerCase();
    const itemVals = item.values || item.data || {};
    return Object.values(itemVals).some(val => {
      if (typeof val === "object" && val !== null && "w" in val) {
        return `${val.w}x${val.h}`.toLowerCase().includes(term);
      }
      return String(val || "").toLowerCase().includes(term);
    });
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-primary" />
            {category.name}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage inventory items with flexible column definitions. Inline edit or open detail form.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="w-4 h-4 mr-2" /> Column Settings
          </Button>
          <Button onClick={handleOpenCreateModal}>
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
        </div>
      </div>

      <Card className="card-elevated border-border/50">
        <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${category.name}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/30"
            />
          </div>

          <div className="text-xs text-muted-foreground font-mono">
            {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
          </div>
        </div>

        {category.columns && category.columns.length > 0 ? (
          <SpreadsheetGrid
            columns={category.columns}
            data={filteredItems}
            sheetsPerReam={category.sheetsPerReam || 500}
            onDataChange={handleDataChange}
            onAddRow={handleAddRow}
            onDeleteRow={handleDeleteRow}
            onDuplicateRow={handleDuplicateRow}
            onEditItemInModal={handleOpenEditModal}
            groupByColumn={category.groupByColumn}
          />
        ) : (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
            <p className="mb-4 text-base font-semibold">No columns defined for this category.</p>
            <p className="mb-6 text-sm text-muted-foreground/80 max-w-sm">
              Use Column Settings to define custom columns or quickly apply the standard Paper columns preset.
            </p>
            <Button onClick={() => setIsSettingsOpen(true)}>
              <Settings className="w-4 h-4 mr-2" /> Setup Columns
            </Button>
          </div>
        )}
      </Card>

      {/* Column Settings Modal */}
      <ColumnSettingsModal
        category={category}
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
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
