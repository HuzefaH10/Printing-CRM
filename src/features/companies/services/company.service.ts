import { companyRepo } from "./company.repository";
import { Company, IntelligenceScore, RelationshipTracker } from "../models/company";
import { AuditService } from "@/services/audit.service";
import { CreatePayload } from "@/types/repository";

export class CompanyService {
  /**
   * Helper to compute the overall intelligence score
   */
  static computeOverallScore(scores: Partial<IntelligenceScore>): number {
    const s = {
      relationshipScore: scores.relationshipScore || 0,
      potentialScore: scores.potentialScore || 0,
      opportunityScore: scores.opportunityScore || 0,
      urgencyScore: scores.urgencyScore || 0,
      engagementScore: scores.engagementScore || 0,
    };
    
    return Math.round(
      (s.relationshipScore * 0.3) + 
      (s.potentialScore * 0.25) + 
      (s.engagementScore * 0.2) + 
      (s.opportunityScore * 0.15) + 
      (s.urgencyScore * 0.1)
    );
  }

  /**
   * Generates default Intelligence Score for a new company
   */
  static getDefaultIntelligence(): IntelligenceScore {
    return {
      relationshipScore: 10,
      potentialScore: 50,
      opportunityScore: 10,
      urgencyScore: 10,
      engagementScore: 0,
      overallScore: 16 // based on above weighting
    };
  }

  /**
   * Generates default Relationship Tracker
   */
  static getDefaultRelationshipTracker(): RelationshipTracker {
    return {
      responseTimeDays: 0,
      averageFollowUpDays: 0,
      communicationFrequency: "NONE",
      health: "FAIR"
    };
  }

  static async createCompany(
    data: Omit<CreatePayload<Company>, "intelligence" | "relationshipTracker">, 
    userId: string
  ): Promise<Company> {
    const intelligence = this.getDefaultIntelligence();
    const relationshipTracker = this.getDefaultRelationshipTracker();

    const company = await companyRepo.create({
      ...data,
      intelligence,
      relationshipTracker,
    }, undefined, userId);

    await AuditService.logEvent({
      entityId: company.id,
      entityType: "company",
      action: "CREATED",
      userId,
      newValue: company as unknown as Record<string, any>
    });

    return company;
  }

  /**
   * Logs an interaction and recalculates the relationship score / tracker
   */
  static async logInteraction(companyId: string, type: "CALL" | "MEETING" | "EMAIL", userId: string) {
    const company = await companyRepo.get(companyId);
    if (!company) throw new Error("Company not found");

    const now = new Date().toISOString();
    const tracker = { ...company.relationshipTracker };
    const intel = { ...company.intelligence };

    if (type === "CALL") tracker.lastCallAt = now;
    if (type === "MEETING") tracker.lastMeetingAt = now;
    if (type === "EMAIL") tracker.lastEmailAt = now;
    
    tracker.lastContactAt = now;

    // Bump engagement and relationship scores based on interaction
    intel.engagementScore = Math.min(100, intel.engagementScore + 5);
    intel.relationshipScore = Math.min(100, intel.relationshipScore + 2);
    intel.overallScore = this.computeOverallScore(intel);

    // Determine Health
    tracker.health = intel.relationshipScore > 80 ? "EXCELLENT" : 
                     intel.relationshipScore > 50 ? "GOOD" : 
                     intel.relationshipScore > 20 ? "FAIR" : "POOR";

    await companyRepo.update(companyId, {
      relationshipTracker: tracker,
      intelligence: intel
    }, userId);

    await AuditService.logEvent({
      entityId: company.id,
      entityType: "company",
      action: "UPDATED",
      userId,
      reason: `Logged ${type} interaction`
    });
  }
}
