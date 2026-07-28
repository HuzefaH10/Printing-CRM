import { Invoice, Payment, InvoiceStatus } from "../models/finance";
import { invoiceRepo, paymentRepo } from "./finance.repository";

export class FinanceService {
  
  /**
   * Records a payment and automatically applies it to the corresponding invoice,
   * adjusting the outstanding balance and updating the invoice status.
   */
  static async recordPayment(paymentData: Partial<Payment>, userId: string): Promise<Payment> {
    if (!paymentData.invoiceId) throw new Error("Invoice ID is required to record a payment.");
    if (!paymentData.amount || paymentData.amount <= 0) throw new Error("Payment amount must be greater than zero.");

    // Retrieve the target invoice
    const invoice = await invoiceRepo.get(paymentData.invoiceId);
    if (!invoice) throw new Error("Target invoice not found.");
    
    // Create the payment record
    const payment = await paymentRepo.create({
      paymentNumber: `PAY-${new Date().getTime()}`,
      invoiceId: invoice.id,
      companyId: invoice.companyId,
      amount: paymentData.amount,
      currency: invoice.currency,
      paymentDate: paymentData.paymentDate || new Date(),
      paymentMethod: paymentData.paymentMethod || "BANK_TRANSFER",
      referenceNumber: paymentData.referenceNumber,
      receivedById: userId,
      notes: paymentData.notes
    }, undefined, userId);

    // Apply the payment to the invoice
    invoice.outstandingBalance = Math.max(0, invoice.outstandingBalance - payment.amount);
    
    // Determine the new status
    if (invoice.outstandingBalance === 0) {
      invoice.status = "PAID";
    } else if (invoice.status === "ISSUED" || invoice.status === "PARTIALLY_PAID") {
      invoice.status = "PARTIALLY_PAID";
    }
    
    // In a real system, we would also update the Company's CustomerCreditProfile here
    
    await invoiceRepo.update(invoice.id, invoice, userId);
    
    return payment as Payment;
  }
  
  /**
   * Issues a draft invoice, making it active and updating the company's used credit.
   */
  static async issueInvoice(invoiceId: string, userId: string): Promise<Invoice> {
    const invoice = await invoiceRepo.get(invoiceId);
    if (!invoice) throw new Error("Invoice not found");
    
    if (invoice.status !== "DRAFT" && invoice.status !== "PENDING_APPROVAL") {
      throw new Error("Only Draft or Pending invoices can be issued.");
    }
    
    invoice.status = "ISSUED";
    invoice.issueDate = new Date();
    
    await invoiceRepo.update(invoice.id, invoice, userId);
    
    // Future: Update Company credit utilization
    
    return invoice;
  }
}
