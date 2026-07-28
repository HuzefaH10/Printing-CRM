import { PurchaseRequest, PurchaseOrder, GoodsReceipt, ProcurementStatus } from "../models/procurement";
import { purchaseRequestRepo, purchaseOrderRepo, goodsReceiptRepo, priceHistoryRepo } from "./procurement.repository";

export class ProcurementService {
  
  /**
   * Approves a purchase request and transitions its status
   */
  static async approvePurchaseRequest(
    requestId: string,
    userId: string,
    level: "MANAGER" | "FINANCE"
  ): Promise<PurchaseRequest> {
    const request = await purchaseRequestRepo.get(requestId);
    if (!request) throw new Error("Purchase Request not found");
    
    if (level === "MANAGER" && request.status === "SUBMITTED") {
      request.status = "MANAGER_APPROVAL";
    } else if (level === "FINANCE" && request.status === "MANAGER_APPROVAL") {
      request.status = "APPROVED";
    }
    
    // In a real system, we would log this to an approval timeline
    await purchaseRequestRepo.update(request.id, request);
    return request;
  }
  
  /**
   * Converts an approved purchase request into a draft purchase order
   */
  static async convertRequestToOrder(
    requestId: string,
    supplierId: string,
    userId: string
  ): Promise<PurchaseOrder> {
    const request = await purchaseRequestRepo.get(requestId);
    if (!request) throw new Error("Purchase Request not found");
    if (request.status !== "APPROVED") throw new Error("Request must be approved first");
    
    const poItems = request.items.map(item => ({
      inventoryItemId: item.inventoryItemId || "TEMP",
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.estimatedUnitPrice || 0,
      lineTotal: (item.quantity * (item.estimatedUnitPrice || 0))
    }));
    
    const subtotal = poItems.reduce((sum, item) => sum + item.lineTotal, 0);
    
    const orderData = {
      poNumber: `PO-${new Date().getTime()}`,
      supplierId,
      relatedPurchaseRequestId: request.id,
      orderDate: new Date(),
      expectedDeliveryDate: request.requiredDate,
      currency: "USD",
      items: poItems,
      subtotal,
      totalDiscount: 0,
      totalTax: 0,
      shippingCost: 0,
      grandTotal: subtotal,
      status: "DRAFT" as ProcurementStatus,
    };
    
    const order = await purchaseOrderRepo.create(orderData, undefined, userId);
    
    request.status = "ORDERED";
    await purchaseRequestRepo.update(request.id, request);
    
    return order;
  }
  
  /**
   * Receives goods for a purchase order (Placeholder for Inventory engine sync)
   */
  static async receiveGoods(
    orderId: string,
    receiptData: Partial<GoodsReceipt>,
    userId: string
  ): Promise<GoodsReceipt> {
    const order = await purchaseOrderRepo.get(orderId);
    if (!order) throw new Error("Purchase Order not found");
    
    const receipt = await goodsReceiptRepo.create({
      grnNumber: `GRN-${new Date().getTime()}`,
      purchaseOrderId: order.id,
      supplierId: order.supplierId,
      deliveryDate: new Date(),
      receivedById: userId,
      items: receiptData.items || [],
      isPartialDelivery: receiptData.isPartialDelivery || false,
    }, undefined, userId);
    
    // Future: Automatically inject StockMovement records into the Inventory Engine here
    
    order.status = receiptData.isPartialDelivery ? "PARTIAL_RECEIPT" : "RECEIVED";
    await purchaseOrderRepo.update(order.id, order);
    
    return receipt as GoodsReceipt;
  }
  
}
