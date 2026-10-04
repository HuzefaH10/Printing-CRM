import { BaseRepository } from "@/lib/repository/base.repository";
import { StockCategory, StockItem } from "../models/stock";

export class StockCategoryRepository extends BaseRepository<StockCategory> {
  constructor() {
    super("stockCategories");
  }
}

export class StockItemRepository extends BaseRepository<StockItem> {
  constructor() {
    super("stockItems");
  }
}

export const stockCategoryRepo = new StockCategoryRepository();
export const stockItemRepo = new StockItemRepository();
