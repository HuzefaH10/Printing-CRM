"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { InventoryItem } from "@/features/inventory/models/inventory";
import { inventoryRepo } from "@/features/inventory/services/inventory.repository";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Loader2,
  Package,
  AlertTriangle,
  TrendingDown,
  History,
  Truck,
  FileText,
  Settings,
  BarChart3,
  Paperclip,
  ClipboardList,
  Factory,
  Users,
  Layers,
  Calendar,
} from "lucide-react";

export default function InventoryItemPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadItem();
  }, [id]);

  const loadItem = async () => {
    setIsLoading(true);
    try {
      const data = await inventoryRepo.get(id);
      setItem(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-xl font-bold mb-2">Item Not Found</h2>
        <Button onClick={() => router.push("/inventory")}>
          Back to Inventory
        </Button>
      </div>
    );
  }

  const isLowStock =
    item.availableQuantity > 0 &&
    item.availableQuantity <= item.reorderPoint;
  const isOutOfStock = item.availableQuantity <= 0;

  const fmt = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: item.currency || "USD",
    }).format(val);

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Back + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/inventory")}
          className="-ml-3"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <History className="w-4 h-4 mr-2" /> Record Movement
          </Button>
          <Button variant="outline" size="sm">
            <ClipboardList className="w-4 h-4 mr-2" /> Reserve Stock
          </Button>
          <Button variant="secondary" size="sm">
            <Settings className="w-4 h-4 mr-2" /> Settings
          </Button>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-card rounded-lg border shadow-sm p-6 flex flex-col md:flex-row gap-6 justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {item.itemName}
            </h1>
            <Badge variant="secondary">{item.category}</Badge>
            {isOutOfStock && (
              <Badge variant="destructive">OUT OF STOCK</Badge>
            )}
            {isLowStock && !isOutOfStock && (
              <Badge
                variant="outline"
                className="border-orange-500 text-orange-500 bg-orange-500/10"
              >
                LOW STOCK
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground font-mono">
            {item.itemCode}
            {item.sku ? ` • SKU: ${item.sku}` : ""}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-6 text-right">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              Available
            </p>
            <p
              className={`text-2xl font-bold ${
                isOutOfStock
                  ? "text-red-600"
                  : isLowStock
                  ? "text-orange-500"
                  : ""
              }`}
            >
              {item.availableQuantity.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{item.unit}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              Reserved
            </p>
            <p className="text-2xl font-bold">
              {item.reservedQuantity.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{item.unit}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              Value
            </p>
            <p className="text-2xl font-bold">{fmt(item.inventoryValue)}</p>
            <p className="text-xs text-muted-foreground">
              @ {fmt(item.averageCost)}/{item.unit}
            </p>
          </div>
        </div>
      </div>

      {/* Paper Intelligence Card (conditional) */}
      {item.paperSpecs && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" /> Paper Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Type
                </span>
                <span className="text-sm">
                  {item.paperSpecs.paperType || "-"}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Finish
                </span>
                <span className="text-sm">
                  {item.paperSpecs.paperFinish || "-"}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  GSM
                </span>
                <span className="text-sm">
                  {item.paperSpecs.paperGSM || "-"}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Sheet Size
                </span>
                <span className="text-sm">
                  {item.paperSpecs.sheetSize || "-"}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Width
                </span>
                <span className="text-sm">
                  {item.paperSpecs.width
                    ? `${item.paperSpecs.width}mm`
                    : "-"}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Length
                </span>
                <span className="text-sm">
                  {item.paperSpecs.length
                    ? `${item.paperSpecs.length}mm`
                    : "-"}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Grain Direction
                </span>
                <span className="text-sm">
                  {item.paperSpecs.grainDirection || "-"}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Color
                </span>
                <span className="text-sm">
                  {item.paperSpecs.color || "-"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stock">Stock Levels</TabsTrigger>
          <TabsTrigger value="movements">Movement History</TabsTrigger>
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
          <TabsTrigger value="production">Production Usage</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Item Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Category
                    </span>
                    <span className="text-sm">{item.category}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Subcategory
                    </span>
                    <span className="text-sm">
                      {item.subcategory || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Brand
                    </span>
                    <span className="text-sm">{item.brand || "-"}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Manufacturer
                    </span>
                    <span className="text-sm">
                      {item.manufacturer || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Unit
                    </span>
                    <span className="text-sm">{item.unit}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Lead Time
                    </span>
                    <span className="text-sm">
                      {item.leadTimeDays
                        ? `${item.leadTimeDays} days`
                        : "-"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Reorder Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Minimum Stock
                    </span>
                    <span className="text-sm">
                      {item.minimumStock.toLocaleString()} {item.unit}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Maximum Stock
                    </span>
                    <span className="text-sm">
                      {item.maximumStock
                        ? `${item.maximumStock.toLocaleString()} ${item.unit}`
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Reorder Point
                    </span>
                    <span className="text-sm">
                      {item.reorderPoint.toLocaleString()} {item.unit}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Average Cost
                    </span>
                    <span className="text-sm">{fmt(item.averageCost)}</span>
                  </div>
                </div>

                {isLowStock && (
                  <div className="mt-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center gap-2 text-sm text-orange-600">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    This item is below its reorder point. Consider placing
                    a purchase order.
                  </div>
                )}
                {isOutOfStock && (
                  <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-sm text-red-600">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    This item is out of stock. Immediate reorder required.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Warehouse Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Warehouse
                    </span>
                    <span className="text-sm">
                      {item.warehouseId || "Default"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Rack / Shelf / Bin
                    </span>
                    <span className="text-sm">
                      {[item.rack, item.shelf, item.bin]
                        .filter(Boolean)
                        .join(" / ") || "-"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Placeholders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Placeholders</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Barcode:{" "}
                  {item.barcodePlaceholder || "Not assigned yet"}
                </p>
                <p>
                  QR Code:{" "}
                  {item.qrCodePlaceholder || "Not assigned yet"}
                </p>
                <p>
                  Batch:{" "}
                  {item.batchNumberPlaceholder || "Not assigned yet"}
                </p>
                <p>
                  Expiry:{" "}
                  {item.expiryDatePlaceholder
                    ? String(item.expiryDatePlaceholder)
                    : "N/A"}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stock">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 rounded-lg bg-muted/30 border">
                  <p className="text-3xl font-bold">
                    {item.currentQuantity.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">
                    Current Stock
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30 border">
                  <p className="text-3xl font-bold">
                    {item.reservedQuantity.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">
                    Reserved
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30 border">
                  <p
                    className={`text-3xl font-bold ${
                      isOutOfStock
                        ? "text-red-600"
                        : isLowStock
                        ? "text-orange-500"
                        : "text-emerald-600"
                    }`}
                  >
                    {item.availableQuantity.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">
                    Available
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30 border">
                  <p className="text-3xl font-bold">
                    {fmt(item.inventoryValue)}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">
                    Total Value
                  </p>
                </div>
              </div>

              <div className="h-32 flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                <BarChart3 className="w-8 h-8 opacity-20 mr-3" />
                <span>Stock level trend chart placeholder</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground py-24">
              <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-semibold mb-1">Movement History</p>
              <p className="text-sm">
                Every purchase, issue, return, transfer, and adjustment
                will be recorded as a permanent audit trail here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reservations">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground py-24">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-semibold mb-1">Stock Reservations</p>
              <p className="text-sm">
                Materials reserved for specific jobs, customers, tenders,
                or sample kits will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground py-24">
              <Factory className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-semibold mb-1">Production Usage</p>
              <p className="text-sm">
                Tracks allocated, consumed, returned, and wasted quantities
                for every production job using this material.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground py-24">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-semibold mb-1">
                Supplier Intelligence
              </p>
              <p className="text-sm">
                Preferred supplier, purchase history, lead time, average
                cost, and price trends will be displayed here.
              </p>
              <p className="text-xs mt-4">
                Connects to the Procurement &amp; Supplier Intelligence Engine.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground py-24">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-semibold mb-1">Documents</p>
              <p className="text-sm">
                Material safety data sheets, certifications, and supplier
                documents will be stored here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attachments">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground py-24">
              <Paperclip className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-semibold mb-1">Attachments</p>
              <p className="text-sm">
                Upload and manage file attachments related to this
                inventory item.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground py-24">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-semibold mb-1">Item Analytics</p>
              <p className="text-sm">
                Consumption trends, cost history, waste tracking, and
                usage forecasting placeholder.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground py-24">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-semibold mb-1">Timeline</p>
              <p className="text-sm">
                Universal Activity Engine integration — every stock event,
                purchase, issue, and adjustment will appear as a permanent
                timeline entry.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground py-24">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-semibold mb-1">Item Settings</p>
              <p className="text-sm">
                Configure stock policies, alert thresholds, unit
                conversions, and archival.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
