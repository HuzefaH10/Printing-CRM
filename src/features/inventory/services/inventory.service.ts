import { InventoryItem, StockMovement } from "../models/inventory";
import { inventoryRepo, stockMovementRepo } from "./inventory.repository";

export class InventoryService {
  
  /**
   * Generates a realistic mock inventory item
   */
  static generateMockItem(overrides?: Partial<InventoryItem>): InventoryItem {
    const isPaper = Math.random() > 0.5;
    const category = isPaper ? "Paper" : "Ink";
    const currentQty = Math.floor(Math.random() * 5000);
    const reservedQty = Math.floor(Math.random() * (currentQty * 0.3));
    const avgCost = Math.random() * 10 + 0.5;

    return {
      id: crypto.randomUUID(),
      itemCode: `INV-${Math.floor(Math.random() * 10000)}`,
      itemName: isPaper ? `Art Paper ${Math.floor(Math.random() * 300)}GSM` : `Cyan Offset Ink`,
      category,
      unit: isPaper ? "Sheets" : "Kgs",
      currentQuantity: currentQty,
      reservedQuantity: reservedQty,
      availableQuantity: currentQty - reservedQty,
      minimumStock: 500,
      reorderPoint: 750,
      averageCost: avgCost,
      inventoryValue: currentQty * avgCost,
      currency: "USD",
      tags: [],
      archived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  /**
   * Re-calculates available quantity and inventory value for an item
   */
  static async recalculateStock(itemId: string): Promise<InventoryItem> {
    const item = await inventoryRepo.get(itemId);
    if (!item) throw new Error("Item not found");
    
    item.availableQuantity = item.currentQuantity - item.reservedQuantity;
    item.inventoryValue = item.currentQuantity * item.averageCost;
    
    await inventoryRepo.update(item.id, item);
    return item;
  }
  
  /**
   * Records a stock movement and updates the inventory item
   */
  static async recordMovement(
    itemId: string,
    type: StockMovement["type"],
    quantity: number,
    userId: string,
    options?: Partial<StockMovement>
  ): Promise<void> {
    const item = await inventoryRepo.get(itemId);
    if (!item) throw new Error("Item not found");
    
    // Create movement audit record
    const movement: Omit<StockMovement, "id" | "createdAt" | "updatedAt"> = {
      inventoryItemId: itemId,
      type,
      quantity,
      performedById: userId,
      ...options
    };
    
    await stockMovementRepo.create(movement);
    
    // Update inventory levels
    item.currentQuantity += quantity; // quantity can be negative for outgoing
    item.availableQuantity = item.currentQuantity - item.reservedQuantity;
    item.inventoryValue = item.currentQuantity * item.averageCost;
    
    await inventoryRepo.update(item.id, item);
  }
}
