import { BaseRepository } from "@/lib/repository/base.repository";
import { ProductionJob } from "../models/job";

class ProductionRepository extends BaseRepository<ProductionJob> {
  constructor() {
    super("production_jobs");
  }
}

export const productionRepo = new ProductionRepository();
