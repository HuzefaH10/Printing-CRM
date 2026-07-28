import { BaseModel } from "@/types/repository";

export interface PaperSpecs {
  paperType: string;
  paperFinish: string;
  paperGSM: number;
  width?: number; // mm
  length?: number; // mm
  sheetSize?: string;
  rollWidth?: number; // mm
  rollLength?: number; // m
  color?: string;
  grainDirection?: "Long" | "Short" | "None" | string;
  fscPlaceholder?: boolean;
  certificationPlaceholder?: string;
  storageConditions?: string;
}

export interface InventoryItem extends BaseModel {
  itemCode: string;
  itemName: string;
  description?: string;
  
  category: "Paper" | "Ink" | "Toner" | "Chemicals" | "Binding Materials" | "Lamination Film" | "Foils" | "Packaging Materials" | "Office Supplies" | "Machine Consumables" | "Spare Parts" | string;
  subcategory?: string;
  
  brand?: string;
  supplierId?: string;
  manufacturer?: string;
  sku?: string;
  
  // Location
  warehouseId?: string;
  rack?: string;
  shelf?: string;
  bin?: string;
  
  // Units
  unit: string; // e.g., Sheets, Reams, Kgs, Liters, Rolls
  purchaseUnit?: string;
  consumptionUnit?: string;
  
  // Stock Levels
  currentQuantity: number;
  reservedQuantity: number;
  availableQuantity: number; // Derived: current - reserved
  
  minimumStock: number;
  maximumStock?: number;
  reorderPoint: number;
  
  // Costing
  preferredSupplierId?: string;
  averageCost: number;
  lastPurchaseCost?: number;
  inventoryValue: number; // Derived: current * averageCost
  currency: string;
  
  leadTimeDays?: number;
  
  // Placeholders
  barcodePlaceholder?: string;
  qrCodePlaceholder?: string;
  expiryDatePlaceholder?: Date | string;
  batchNumberPlaceholder?: string;
  
  // Specific intelligence
  paperSpecs?: PaperSpecs;
  
  tags: string[];
  notes?: string;
  archived: boolean;
}

export interface StockMovement extends BaseModel {
  inventoryItemId: string;
  
  type: "Purchase" | "Issue" | "Return" | "Transfer" | "Adjustment" | "Production Consumption" | "Production Return" | "Damage" | "Waste" | "Sample Usage" | "Customer Sample" | "Manual Correction" | string;
  
  quantity: number; // Positive for incoming, negative for outgoing
  unitCost?: number;
  totalValue?: number;
  
  referenceId?: string; // Job ID, PO ID, etc.
  referenceType?: "ProductionJob" | "PurchaseOrder" | "Manual" | string;
  
  performedById: string;
  notes?: string;
}

export interface WarehouseLocation extends BaseModel {
  name: string;
  code: string;
  address?: string;
  
  zones?: string[];
  rows?: string[];
  racks?: string[];
  shelves?: string[];
  bins?: string[];
  
  managerId?: string;
  notes?: string;
}

export interface StockReservation extends BaseModel {
  inventoryItemId: string;
  quantity: number;
  
  status: "Active" | "Fulfilled" | "Cancelled" | string;
  
  reservedForId?: string; // Job ID, Opportunity ID, etc.
  reservedForType?: "ProductionJob" | "Customer" | "Tender" | "Sample Kit" | string;
  
  notes?: string;
}
