import { opportunityRepo } from "./opportunity.repository";
import { Opportunity, IntelligenceScore, RiskAssessment, OpportunityStatus } from "../models/opportunity";
import { AuditService } from "@/services/audit.service";
import { DEFAULT_PIPELINE_STAGES } from "../config/pipeline-stages";

export class OpportunityService {
  
  static calculateIntelligenceScore(opp: Partial<Opportunity>): IntelligenceScore {
    // 1. Base initialization
    let relScore = 50;
    let budgScore = opp.budget && opp.estimatedRevenue && opp.budget >= opp.estimatedRevenue ? 90 : 40;
    
    // 2. Urgency
    let urgScore = 50;
    if (opp.urgency === "CRITICAL") urgScore = 100;
    else if (opp.urgency === "HIGH") urgScore = 80;
    else if (opp.urgency === "LOW") urgScore = 20;

    // 3. Competition
    let compScore = 100;
    if (opp.competitors && opp.competitors.length > 0) {
      compScore -= opp.competitors.length * 15;
    }

    // 4. Printing Potential
    let printScore = 50;
    if (opp.estimatedRevenue && opp.estimatedRevenue > 50000) printScore = 90;
    else if (opp.estimatedRevenue && opp.estimatedRevenue > 10000) printScore = 70;

    // 5. Activity Score
    // In a real implementation, we'd query the activityRepo for this company/opp to see recent engagement
    let actScore = 50;

    // Aggregate
    const overall = Math.round(
      (relScore * 0.1) +
      (budgScore * 0.2) +
      (urgScore * 0.2) +
      ((opp.probability || 0) * 0.2) +
      (compScore * 0.1) +
      (actScore * 0.1) +
      (printScore * 0.1)
    );

    return {
      relationshipScore: relScore,
      budgetScore: budgScore,
      urgencyScore: urgScore,
      probabilityScore: opp.probability || 0,
      competitionScore: compScore,
      activityScore: actScore,
      printingPotential: printScore,
      overallWinProbability: Math.min(Math.max(overall, 0), 100)
    };
  }

  static async updateStage(oppId: string, newStageId: string, userId: string, notes?: string): Promise<void> {
    const opp = await opportunityRepo.get(oppId);
    if (!opp) throw new Error("Opportunity not found");

    const stageConfig = DEFAULT_PIPELINE_STAGES.find(s => s.id === newStageId);
    if (!stageConfig) throw new Error("Invalid stage ID");

    let status: OpportunityStatus = "OPEN";
    if (newStageId === "stage_won") status = "WON";
    if (newStageId === "stage_lost") status = "LOST";
    if (newStageId === "stage_dormant") status = "DORMANT";

    const updates: Partial<Opportunity> = {
      stageId: newStageId,
      stageEnteredAt: new Date().toISOString(),
      probability: stageConfig.defaultProbability,
      status
    };

    // Recalculate intelligence score based on new probability
    updates.intelligenceScore = this.calculateIntelligenceScore({
      ...opp,
      probability: stageConfig.defaultProbability
    });

    await opportunityRepo.update(oppId, updates, userId);

    await AuditService.logEvent({
      entityId: oppId,
      entityType: "opportunity",
      action: "STAGE_CHANGED",
      userId,
      reason: `Moved from ${opp.stageId} to ${newStageId}. ${notes || ""}`
    });
  }
}
