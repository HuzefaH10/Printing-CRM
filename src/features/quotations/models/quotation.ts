import { BaseModel } from "@/types/repository";

export interface PrintItem {
  id: string;
  productName: string;
  category: string;
  description: string;
  quantity: number;
  units: string;
  
  // Specs
  finishedSize?: string;
  flatSize?: string;
  paperType?: string;
  paperGSM?: string;
  paperBrand?: string;
  printingColors?: string;
  printingSides?: "Single Sided" | "Double Sided" | "Mixed" | string;
  
  // Finishing
  binding?: string;
  lamination?: string;
  foiling?: string;
  embossing?: string;
  spotUV?: string;
  dieCutting?: string;
  numbering?: string;
  perforation?: string;
  
  // Fulfillment
  packaging?: string;
  deliveryMethod?: string;
  specialInstructions?: string;
  artworkStatus?: "Pending" | "Received" | "Approved" | "Not Required" | string;
  estimatedProductionTime?: string;

  // Item Level Pricing
  unitPrice: number;
  totalPrice: number;
  
  // Cost breakdown
  materialCost: number;
  printingCost: number;
  finishingCost: number;
  packagingCost: number;
  deliveryCost: number;
  outsourcedCost: number;
  laborCost: number;
  otherCharges: number;
  
  margin: number; // Percentage
  markup: number; // Percentage
  profit: number; // Value
}

export interface Quotation extends BaseModel {
  quotationNumber: string;
  revisionNumber: number; // 0 for original, increments for revisions
  title: string;
  
  // Foreign Keys
  companyId: string;
  opportunityId: string;
  primaryContactId?: string;
  
  status: "Draft" | "Internal Review" | "Approved" | "Sent" | "Viewed" | "Accepted" | "Rejected" | "Expired" | "Cancelled" | string;
  
  preparedBy: string; // User ID
  reviewedBy?: string; // User ID
  approvedBy?: string; // User ID
  
  issueDate: Date | string;
  expiryDate: Date | string;
  
  currency: string;
  language: string;
  paymentTerms: string;
  deliveryTerms: string;
  
  // Data
  items: PrintItem[];
  
  // Aggregated Pricing
  subtotal: number;
  discountPercentage: number;
  discountValue: number;
  taxPercentage: number;
  taxValue: number;
  grandTotal: number;
  
  // Total Costs (sum of items)
  totalEstimatedCost: number;
  totalEstimatedProfit: number;
  overallMargin: number;

  notes: {
    internal?: string;
    customer?: string;
  };
  
  tags: string[];
  
  // Revision Tracking
  isArchived: boolean;
  originalQuotationId?: string; // If this is a revision, point to parent
  revisionReason?: string;
  priceDifferenceFromPrevious?: number;
}
