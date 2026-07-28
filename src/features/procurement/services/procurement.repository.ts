import { BaseRepository } from "@/lib/repository/base.repository";
import { PurchaseRequest, PurchaseOrder, GoodsReceipt, PriceHistory } from "../models/procurement";

export class PurchaseRequestRepository extends BaseRepository<PurchaseRequest> {
  constructor() {
    super("purchaseRequests");
  }
}

export class PurchaseOrderRepository extends BaseRepository<PurchaseOrder> {
  constructor() {
    super("purchaseOrders");
  }
}

export class GoodsReceiptRepository extends BaseRepository<GoodsReceipt> {
  constructor() {
    super("goodsReceipts");
  }
}

export class PriceHistoryRepository extends BaseRepository<PriceHistory> {
  constructor() {
    super("priceHistory");
  }
}

export const purchaseRequestRepo = new PurchaseRequestRepository();
export const purchaseOrderRepo = new PurchaseOrderRepository();
export const goodsReceiptRepo = new GoodsReceiptRepository();
export const priceHistoryRepo = new PriceHistoryRepository();
