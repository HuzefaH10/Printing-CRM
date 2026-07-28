import { BaseRepository } from "@/lib/repository/base.repository";
import { Quotation } from "../models/quotation";

class QuotationRepository extends BaseRepository<Quotation> {
  constructor() {
    super("quotations");
  }
}

export const quotationRepo = new QuotationRepository();
