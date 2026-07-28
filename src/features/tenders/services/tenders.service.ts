import { Tender, VendorRegistration } from "../models/tender";
import { tenderRepo, vendorRegistrationRepo } from "./tenders.repository";

export class TenderService {
  
  /**
   * Evaluates and updates the status of a Vendor Registration
   * based on document verification and expiry dates.
   */
  static async evaluateRegistrationStatus(registrationId: string, userId: string): Promise<VendorRegistration> {
    const reg = await vendorRegistrationRepo.get(registrationId);
    if (!reg) throw new Error("Registration not found");
    
    // Check if expired
    if (reg.expiryDate && new Date(reg.expiryDate) < new Date()) {
      reg.status = "EXPIRED";
    }
    // Check if renewal required (within 30 days of expiry)
    else if (reg.expiryDate) {
      const daysUntilExpiry = (new Date(reg.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
      if (daysUntilExpiry <= 30 && reg.status === "APPROVED") {
        reg.status = "RENEWAL_REQUIRED";
      }
    }
    
    // Check document completeness if still collecting
    if (reg.status === "COLLECTING_DOCUMENTS") {
      const allUploaded = reg.documentRequirements.every(doc => doc.status === "UPLOADED" || doc.status === "VERIFIED");
      if (allUploaded) {
        reg.status = "SUBMITTED";
      }
    }
    
    await vendorRegistrationRepo.update(reg.id, reg, userId);
    return reg;
  }
  
  /**
   * Updates the award status of a tender, setting the expected profit 
   * and potentially triggering future opportunity creation.
   */
  static async awardTender(
    tenderId: string, 
    status: "AWARDED" | "LOST", 
    userId: string,
    analysisData?: any
  ): Promise<Tender> {
    const tender = await tenderRepo.get(tenderId);
    if (!tender) throw new Error("Tender not found");
    
    tender.awardStatus = status;
    tender.evaluationStatus = "COMPLETED";
    
    if (status === "AWARDED") {
      tender.award.expectedProfit = tender.estimatedProfit;
      tender.award.expectedRevenue = tender.ourSubmittedPrice;
      // In the future: Automatically generate a Won Opportunity here
    }
    
    if (analysisData) {
      tender.award = {
        ...tender.award,
        ...analysisData
      };
    }
    
    await tenderRepo.update(tender.id, tender, userId);
    return tender;
  }
}
