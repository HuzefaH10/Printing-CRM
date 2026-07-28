import { BaseRepository } from "@/lib/repository/base.repository";
import { InventoryItem, StockMovement, WarehouseLocation, StockReservation } from "../models/inventory";

export class InventoryRepository extends BaseRepository<InventoryItem> {
  constructor() {
    super("inventoryItems");
  }
}

export class StockMovementRepository extends BaseRepository<StockMovement> {
  constructor() {
    super("stockMovements");
  }
}

export class WarehouseLocationRepository extends BaseRepository<WarehouseLocation> {
  constructor() {
    super("warehouseLocations");
  }
}

export class StockReservationRepository extends BaseRepository<StockReservation> {
  constructor() {
    super("stockReservations");
  }
}

export const inventoryRepo = new InventoryRepository();
export const stockMovementRepo = new StockMovementRepository();
export const warehouseRepo = new WarehouseLocationRepository();
export const stockReservationRepo = new StockReservationRepository();
