import { BaseRepository } from "@/lib/repository/base.repository";
import { Invoice, Payment, SupplierPayable } from "../models/finance";

export class InvoiceRepository extends BaseRepository<Invoice> {
  constructor() {
    super("invoices");
  }
}

export class PaymentRepository extends BaseRepository<Payment> {
  constructor() {
    super("payments");
  }
}

export class SupplierPayableRepository extends BaseRepository<SupplierPayable> {
  constructor() {
    super("supplierPayables");
  }
}

export const invoiceRepo = new InvoiceRepository();
export const paymentRepo = new PaymentRepository();
export const supplierPayableRepo = new SupplierPayableRepository();
