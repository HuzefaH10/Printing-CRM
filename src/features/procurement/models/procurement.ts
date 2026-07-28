import { BaseModel } from "@/types/repository";

export type ProcurementStatus = "DRAFT" | "SUBMITTED" | "MANAGER_APPROVAL" | "FINANCE_APPROVAL" | "APPROVED" | "ORDERED" | "PARTIAL_RECEIPT" | "RECEIVED" | "CLOSED" | "REJECTED" | "CANCELLED";

export interface PurchaseRequestItem {
  inventoryItemId?: string; // Optional if requesting something not yet in inventory
  description: string;
  quantity: number;
  unit: string;
  estimatedUnitPrice?: number;
  estimatedTotal?: number;
}

export interface PurchaseRequest extends BaseModel {
  requestNumber: string;
  requestedById: string;
  department: string;
  purpose: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  requiredDate: Date | string;
  
  items: PurchaseRequestItem[];
  estimatedTotalBudget: number;
  
  status: ProcurementStatus;
  
  notes?: string;
  attachments?: string[];
}

export interface PurchaseOrderItem {
  inventoryItemId: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount?: number;
  tax?: number;
  lineTotal: number;
  expectedDeliveryDate?: Date | string;
  warehouseDestinationId?: string;
}

export interface PurchaseOrder extends BaseModel {
  poNumber: string;
  supplierId: string; // References Company where isSupplier = true
  relatedPurchaseRequestId?: string;
  
  orderDate: Date | string;
  expectedDeliveryDate: Date | string;
  actualDeliveryDate?: Date | string;
  
  currency: string;
  items: PurchaseOrderItem[];
  
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  shippingCost: number;
  grandTotal: number;
  
  status: ProcurementStatus;
  
  notes?: string;
  attachments?: string[];
}

export interface ReceivedItem {
  purchaseOrderItemIndex: number;
  inventoryItemId: string;
  quantityReceived: number;
  quantityDamaged: number;
  quantityRejected: number;
  quantityAccepted: number;
  inspectionNotes?: string;
}

export interface GoodsReceipt extends BaseModel {
  grnNumber: string;
  purchaseOrderId: string;
  supplierId: string;
  
  deliveryDate: Date | string;
  receivedById: string;
  
  items: ReceivedItem[];
  
  isPartialDelivery: boolean;
  warehouseId?: string;
  
  carrier?: string;
  trackingNumberPlaceholder?: string;
  deliveryNotes?: string;
  photosPlaceholder?: string[];
}

export interface PriceHistory extends BaseModel {
  supplierId: string;
  inventoryItemId: string;
  purchaseOrderId?: string;
  
  purchaseDate: Date | string;
  price: number;
  currency: string;
  discount?: number;
  
  leadTimeDays?: number;
  quantityPurchased: number;
}

export interface SupplierPerformance {
  supplierId: string;
  onTimeDeliveryPercentage: number;
  qualityRating: number;
  priceCompetitiveness: number;
  communicationRating: number;
  responseTimeDays: number;
  defectRatePercentage: number;
  returnRatePercentage: number;
  overallScore: number;
}
