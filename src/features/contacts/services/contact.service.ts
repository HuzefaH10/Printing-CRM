import { contactRepo } from "./contact.repository";
import { Contact, ContactHealthScore } from "../models/contact";
import { AuditService } from "@/services/audit.service";

export class ContactService {
  static async getContactById(id: string): Promise<Contact | null> {
    return await contactRepo.get(id);
  }

  static async getContactsByCompanyId(companyId: string): Promise<Contact[]> {
    const { data } = await contactRepo.list([{ field: "companyId", operator: "==", value: companyId }]);
    return data;
  }

  static async createContact(contactData: Omit<Contact, "id" | "createdAt" | "updatedAt">, userId?: string): Promise<Contact> {
    const healthScore = this.calculateHealthScore(contactData);
    const newContact = await contactRepo.create({ ...contactData, healthScore } as any, undefined, userId);

    if (userId) {
      await AuditService.logEvent({
        entityId: newContact.id,
        entityType: "contact",
        action: "CREATED",
        userId,
        reason: "Created new contact"
      });
    }

    return newContact;
  }

  static async updateContact(id: string, updates: Partial<Contact>, userId?: string, logReason?: string): Promise<void> {
    let finalUpdates = { ...updates };
    
    // Recalculate health score if relationship profile or preferences change
    if (updates.relationshipProfile || updates.preferences) {
      const existing = await this.getContactById(id);
      if (existing) {
        const mergedData = { ...existing, ...updates };
        finalUpdates.healthScore = this.calculateHealthScore(mergedData as Contact);
      }
    }

    await contactRepo.update(id, finalUpdates as any, userId);

    if (userId && logReason) {
      await AuditService.logEvent({
        entityId: id,
        entityType: "contact",
        action: "UPDATED",
        userId,
        reason: logReason
      });
    }
  }

  static calculateHealthScore(contact: Partial<Contact>): ContactHealthScore {
    const profile = contact.relationshipProfile || {} as any;
    const prefs = contact.preferences || {} as any;

    const relationshipScore = profile.relationshipStrength || 0;
    const trustScore = profile.trustScore || 0;
    const influenceScore = profile.influenceScore || 0;

    // Response Score heuristic
    let responseScore = 50; // Default
    if (profile.responsiveness === "High") responseScore = 90;
    if (profile.responsiveness === "Medium") responseScore = 70;
    if (profile.responsiveness === "Low") responseScore = 30;

    // Engagement Score heuristic based on how much data we know
    let engagementScore = 0;
    if (prefs.favoriteBeverage) engagementScore += 20;
    if (prefs.communicationStyle) engagementScore += 20;
    if (prefs.bestTimeToContact) engagementScore += 20;
    if (profile.lastContactDate) engagementScore += 20;
    if (profile.nextFollowUp) engagementScore += 20;

    // Activity Score based on recency of contact
    let activityScore = 50;
    if (profile.lastContactDate) {
      const daysSinceContact = Math.floor((new Date().getTime() - new Date(profile.lastContactDate).getTime()) / (1000 * 3600 * 24));
      if (daysSinceContact <= 7) activityScore = 90;
      else if (daysSinceContact <= 30) activityScore = 70;
      else if (daysSinceContact <= 90) activityScore = 40;
      else activityScore = 10;
    }

    // Weighted Overall Health
    const overallHealth = Math.round(
      (relationshipScore * 0.3) +
      (trustScore * 0.25) +
      (engagementScore * 0.15) +
      (responseScore * 0.15) +
      (activityScore * 0.15)
    );

    return {
      relationshipScore,
      engagementScore,
      trustScore,
      influenceScore,
      responseScore,
      activityScore,
      overallHealth
    };
  }
}
