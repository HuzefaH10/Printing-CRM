"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, ArrowUpDown, AlertTriangle, Package } from "lucide-react";
import { InventoryItem } from "../models/inventory";

interface InventoryListTableProps {
  items: InventoryItem[];
  isLoading: boolean;
}

export function InventoryListTable({ items, isLoading }: InventoryListTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const categories = ["All", ...Array.from(new Set(items.map(i => i.category)))];

  const filteredItems = items.filter(i => {
    const matchesSearch = 
      i.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      i.itemCode.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = categoryFilter === "All" || i.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search item name or code..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            {categories.map(cat => (
              <Badge 
                key={cat}
                variant={categoryFilter === cat ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Code</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Available</TableHead>
              <TableHead className="text-right">Reserved</TableHead>
              <TableHead className="text-right">Unit Value</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No inventory items found.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
                const isLowStock = item.availableQuantity <= item.reorderPoint;
                const isOutOfStock = item.availableQuantity <= 0;
                
                return (
                  <TableRow 
                    key={item.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/inventory/${item.id}`)}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {item.itemCode}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium flex items-center gap-2">
                        {item.itemName}
                        {isOutOfStock && <Badge variant="destructive" className="text-[10px] h-4 px-1">OUT OF STOCK</Badge>}
                        {isLowStock && !isOutOfStock && <Badge variant="outline" className="text-[10px] h-4 px-1 border-orange-500 text-orange-500 bg-orange-500/10">LOW STOCK</Badge>}
                      </div>
                      {item.paperSpecs && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {item.paperSpecs.paperGSM}GSM • {item.paperSpecs.paperFinish}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={`font-semibold ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-orange-500' : ''}`}>
                        {item.availableQuantity.toLocaleString()} {item.unit}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {item.reservedQuantity.toLocaleString()} {item.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: item.currency }).format(item.averageCost)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: item.currency }).format(item.inventoryValue)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
