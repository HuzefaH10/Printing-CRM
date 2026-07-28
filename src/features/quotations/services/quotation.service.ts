import { quotationRepo } from "./quotation.repository";
import { Quotation, PrintItem } from "../models/quotation";
import { AuditService } from "@/services/audit.service";

export class QuotationService {
  static async getQuotationById(id: string): Promise<Quotation | null> {
    return await quotationRepo.get(id);
  }

  static async getQuotationsByCompany(companyId: string): Promise<Quotation[]> {
    const { data } = await quotationRepo.list([{ field: "companyId", operator: "==", value: companyId }]);
    return data;
  }

  static async getQuotationsByOpportunity(opportunityId: string): Promise<Quotation[]> {
    const { data } = await quotationRepo.list([{ field: "opportunityId", operator: "==", value: opportunityId }]);
    return data;
  }

  static calculateTotals(quotation: Partial<Quotation>): Partial<Quotation> {
    const items = quotation.items || [];
    let subtotal = 0;
    let totalEstimatedCost = 0;
    let totalEstimatedProfit = 0;

    items.forEach(item => {
      subtotal += (item.totalPrice || 0);
      
      const itemCost = (item.materialCost || 0) + 
                       (item.printingCost || 0) + 
                       (item.finishingCost || 0) + 
                       (item.packagingCost || 0) + 
                       (item.deliveryCost || 0) + 
                       (item.outsourcedCost || 0) + 
                       (item.laborCost || 0) + 
                       (item.otherCharges || 0);
                       
      totalEstimatedCost += itemCost;
      totalEstimatedProfit += (item.totalPrice - itemCost);
    });

    const discountValue = quotation.discountValue || (subtotal * (quotation.discountPercentage || 0) / 100);
    const postDiscount = subtotal - discountValue;
    const taxValue = quotation.taxValue || (postDiscount * (quotation.taxPercentage || 0) / 100);
    const grandTotal = postDiscount + taxValue;
    const overallMargin = grandTotal > 0 ? (totalEstimatedProfit / grandTotal) * 100 : 0;

    return {
      ...quotation,
      subtotal,
      discountValue,
      taxValue,
      grandTotal,
      totalEstimatedCost,
      totalEstimatedProfit,
      overallMargin
    };
  }

  static calculateItemProfitability(item: PrintItem): PrintItem {
    const totalCost = (item.materialCost || 0) + 
                      (item.printingCost || 0) + 
                      (item.finishingCost || 0) + 
                      (item.packagingCost || 0) + 
                      (item.deliveryCost || 0) + 
                      (item.outsourcedCost || 0) + 
                      (item.laborCost || 0) + 
                      (item.otherCharges || 0);

    const profit = item.totalPrice - totalCost;
    const margin = item.totalPrice > 0 ? (profit / item.totalPrice) * 100 : 0;
    const markup = totalCost > 0 ? (profit / totalCost) * 100 : 0;

    return {
      ...item,
      profit,
      margin,
      markup
    };
  }

  static async createQuotation(data: Omit<Quotation, "id" | "createdAt" | "updatedAt">, userId?: string): Promise<Quotation> {
    // Generate simple quote number if missing
    if (!data.quotationNumber) {
      data.quotationNumber = `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const calculatedData = this.calculateTotals(data) as any;
    
    const newQuote = await quotationRepo.create(calculatedData, undefined, userId);

    if (userId) {
      await AuditService.logEvent({
        entityId: newQuote.id,
        entityType: "quotation",
        action: "CREATED",
        userId,
        reason: "Drafted new quotation"
      });
    }

    return newQuote;
  }

  static async updateQuotation(id: string, updates: Partial<Quotation>, userId?: string, logReason?: string): Promise<void> {
    let finalUpdates = { ...updates };
    
    if (updates.items || updates.discountPercentage || updates.discountValue || updates.taxPercentage || updates.taxValue) {
      const existing = await this.getQuotationById(id);
      if (existing) {
        const merged = { ...existing, ...updates };
        // Recalculate item profitability if items changed
        if (updates.items) {
          merged.items = merged.items.map(i => this.calculateItemProfitability(i));
        }
        finalUpdates = this.calculateTotals(merged);
      }
    }

    await quotationRepo.update(id, finalUpdates as any, userId);

    if (userId && logReason) {
      await AuditService.logEvent({
        entityId: id,
        entityType: "quotation",
        action: "UPDATED",
        userId,
        reason: logReason
      });
    }
  }

  static async createRevision(originalId: string, userId: string, reason: string): Promise<Quotation> {
    const original = await this.getQuotationById(originalId);
    if (!original) throw new Error("Original quotation not found");

    // Archive the original
    await quotationRepo.update(originalId, { isArchived: true } as any, userId);

    // Clone data for revision
    const newRevisionData: Omit<Quotation, "id" | "createdAt" | "updatedAt"> = {
      ...original,
      revisionNumber: original.revisionNumber + 1,
      status: "Draft",
      isArchived: false,
      originalQuotationId: original.originalQuotationId || original.id, // Point to ultimate parent if multiple revisions
      revisionReason: reason,
      priceDifferenceFromPrevious: 0 // Will be calculated dynamically in UI or next save
    };

    // Remove old DB timestamps and IDs
    delete (newRevisionData as any).id;
    delete (newRevisionData as any).createdAt;
    delete (newRevisionData as any).updatedAt;

    const revision = await quotationRepo.create(newRevisionData as any, undefined, userId);

    await AuditService.logEvent({
      entityId: revision.id,
      entityType: "quotation",
      action: "CREATED_REVISION",
      userId,
      reason: `Created revision ${revision.revisionNumber} from quote ${original.quotationNumber}`
    });

    return revision;
  }
}
