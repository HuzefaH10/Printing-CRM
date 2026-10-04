"use client";

import React, { useEffect, useState } from "react";
import { InventoryItem } from "@/features/inventory/models/inventory";
import { inventoryRepo } from "@/features/inventory/services/inventory.repository";
import { InventoryService } from "@/features/inventory/services/inventory.service";
import { InventoryListTable } from "@/features/inventory/components/InventoryListTable";
import { Button } from "@/components/ui/button";
import { Plus, Download, PackageSearch, AlertTriangle, Layers, Wallet, BarChart3, TrendingDown } from "lucide-react";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      let { data } = await inventoryRepo.list();
      
      // Intentionally empty. No mock items auto-generated.
      
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalValue = items.reduce((sum, item) => sum + item.inventoryValue, 0);
  const lowStockItems = items.filter(i => i.availableQuantity > 0 && i.availableQuantity <= i.reorderPoint);
  const outOfStockItems = items.filter(i => i.availableQuantity <= 0);
  const totalReserved = items.reduce((sum, item) => sum + item.reservedQuantity, 0);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Warehouse & Inventory</h2>
          <p className="text-muted-foreground">Manage raw materials, track stock movements, and ensure production readiness.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={async () => {
            if (confirm('Clear all inventory data?')) {
              setIsLoading(true);
              const { data } = await inventoryRepo.list();
              for (const item of data) await inventoryRepo.hardDelete(item.id!);
              setItems([]);
              setIsLoading(false);
            }
          }}>
            <AlertTriangle className="w-4 h-4 mr-2" /> Clear Dummy Data
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button size="sm" onClick={async () => {
            await inventoryRepo.create({
              sku: "NEW-" + Math.floor(Math.random()*10000),
              name: "New Material",
              category: "PAPER",
              unitOfMeasure: "Reams",
              availableQuantity: 0,
              reservedQuantity: 0,
              reorderPoint: 10,
              unitCost: 0,
              inventoryValue: 0
            });
            loadItems();
          }}>
            <Plus className="w-4 h-4 mr-2" /> Add Material
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalValue)}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Value</p>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <Layers className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{items.length}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Unique Items</p>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4 shadow-sm flex items-center gap-4 border-l-4 border-l-orange-500">
          <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">{lowStockItems.length}</p>
            <p className="text-xs text-orange-600/80 uppercase tracking-wider font-semibold">Low Stock</p>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4 shadow-sm flex items-center gap-4 border-l-4 border-l-red-500">
          <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{outOfStockItems.length}</p>
            <p className="text-xs text-red-600/80 uppercase tracking-wider font-semibold">Out of Stock</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <InventoryListTable items={items} isLoading={isLoading} />
      </div>
    </div>
  );
}
