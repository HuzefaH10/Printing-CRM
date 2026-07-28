import { BaseModel } from "@/types/repository";

export type InvoiceStatus = "DRAFT" | "PENDING_APPROVAL" | "ISSUED" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED" | "WRITTEN_OFF";
export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "CHEQUE" | "CARD" | "ONLINE_PORTAL" | string;

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Invoice extends BaseModel {
  invoiceNumber: string;
  companyId: string;
  contactId?: string;
  quotationId?: string;
  productionJobId?: string;
  
  issueDate: Date | string;
  dueDate: Date | string;
  currency: string;
  paymentTerms: string;
  
  items: InvoiceItem[];
  
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  grandTotal: number;
  
  outstandingBalance: number;
  
  status: InvoiceStatus;
  
  notes?: string;
  attachments?: string[];
  
  approvedById?: string;
}

export interface Payment extends BaseModel {
  paymentNumber: string;
  invoiceId: string;
  companyId: string;
  
  amount: number;
  currency: string;
  paymentDate: Date | string;
  
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  
  receivedById: string;
  bankPlaceholder?: string;
  
  notes?: string;
  attachments?: string[];
}

export interface SupplierPayable extends BaseModel {
  purchaseOrderId: string;
  goodsReceiptId?: string;
  supplierId: string;
  
  supplierInvoicePlaceholder?: string;
  dueDate: Date | string;
  
  totalAmount: number;
  outstandingAmount: number;
  
  paymentStatus: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE";
}

export interface JobProfitability {
  productionJobId: string;
  
  quotedRevenue: number;
  actualRevenue: number;
  
  estimatedCost: number;
  actualMaterialCost: number;
  actualLaborCostPlaceholder: number;
  actualDeliveryCost: number;
  totalActualCost: number;
  
  grossProfit: number;
  marginPercentage: number;
  netContribution: number;
}
