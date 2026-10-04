"use client";

import React, { useEffect, useState } from "react";
import { stockCategoryRepo, stockItemRepo } from "@/features/inventory/services/stock.repository";
import { StockCategory, StockItem, StockColumn } from "@/features/inventory/models/stock";
import { SpreadsheetGrid } from "@/components/ui/spreadsheet-grid/SpreadsheetGrid";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Settings, FileSpreadsheet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function StockCategoryPage({ params }: { params: any }) {
  const unwrappedParams = React.use(params) as { categoryId: string };
  const categoryId = unwrappedParams.categoryId;
  
  const [category, setCategory] = useState<StockCategory | null>(null);
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Settings modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const unsubCat = stockCategoryRepo.subscribe(
      [{ field: "id", operator: "==", value: categoryId }],
      {},
      (data) => {
        if (data.length > 0) setCategory(data[0]);
      }
    );
    
    const unsubItems = stockItemRepo.subscribe(
      [{ field: "categoryId", operator: "==", value: categoryId }],
      {},
      (data) => {
        setItems(data);
        setLoading(false);
      }
    );
    
    return () => {
      unsubCat();
      unsubItems();
    };
  }, [categoryId]);

  const handleDataChange = async (id: string, field: string, value: any) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    // Update local immediately for responsive feel
    const newItems = items.map(i => i.id === id ? { ...i, data: { ...i.data, [field]: value } } : i);
    setItems(newItems);
    
    await stockItemRepo.update(id, { data: { ...item.data, [field]: value } });
  };

  const handleAddRow = async (groupValue?: string) => {
    if (!category) return;
    const newData: any = {};
    if (groupValue && category.groupByColumn && groupValue !== 'Uncategorized') {
      newData[category.groupByColumn] = groupValue;
    }
    
    await stockItemRepo.create({
      categoryId: category.id!,
      data: newData
    });
  };

  const handleDeleteRow = async (id: string) => {
    await stockItemRepo.hardDelete(id);
  };

  const handleDuplicateRow = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item || !category) return;
    await stockItemRepo.create({
      categoryId: category.id!,
      data: { ...item.data },
      lowStockThreshold: item.lowStockThreshold
    });
  };
  
  // Seed paper reference columns if empty
  const handleSeedPaper = async () => {
    if (!category) return;
    const columns: StockColumn[] = [
      { id: 'paper_type', name: 'Paper Type', type: 'dropdown', options: ['Art Paper', 'Bond Paper', 'Board', 'Bristol'], width: 150 },
      { id: 'gsm', name: 'GSM', type: 'number', width: 100 },
      { id: 'size', name: 'Size (cm)', type: 'text', width: 120 },
      { id: 'quantity', name: 'Quantity (Reams)', type: 'fraction', width: 150 }
    ];
    await stockCategoryRepo.update(category.id!, { columns, groupByColumn: 'paper_type' });
    setIsSettingsOpen(false);
  };

  if (!category && !loading) {
    return <div className="p-8 text-center text-muted-foreground">Category not found</div>;
  }

  const filteredItems = items.filter(item => {
    if (!search) return true;
    const term = search.toLowerCase();
    return Object.values(item.data).some(val => String(val).toLowerCase().includes(term));
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-primary" />
            {category?.name || "Loading..."}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage inventory exactly like a spreadsheet. Changes save automatically.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="w-4 h-4 mr-2" /> Columns
          </Button>
        </div>
      </div>

      <Card className="card-elevated border-border/50">
        <div className="p-4 border-b border-border/50 flex gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={`Search ${category?.name || 'items'}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/30"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading grid...</div>
        ) : category?.columns && category.columns.length > 0 ? (
          <SpreadsheetGrid
            columns={category.columns}
            data={filteredItems}
            onDataChange={handleDataChange}
            onAddRow={handleAddRow}
            onDeleteRow={handleDeleteRow}
            onDuplicateRow={handleDuplicateRow}
            groupByColumn={category.groupByColumn}
          />
        ) : (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
            <p className="mb-4">No columns defined for this category.</p>
            <Button onClick={() => setIsSettingsOpen(true)}>Setup Columns</Button>
          </div>
        )}
      </Card>
      
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Column Settings</DialogTitle>
            <DialogDescription>Define the attributes for this category.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-200 dark:border-amber-800 text-sm">
              <p>Since this is a reference implementation, you can instantly seed the exact Paper columns requested:</p>
              <Button onClick={handleSeedPaper} className="mt-3 w-full" variant="outline">
                Seed "Paper" Format (Type, GSM, Size, Fraction Reams)
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
