import { playbookRepo } from "./playbook.repository";
import { playbookTemplateRepo } from "./playbook-template.repository";
import { OpportunityPlaybook, PlaybookSuccessMetrics } from "../models/playbook";
import { AuditService } from "@/services/audit.service";

export class PlaybookService {
  static async getPlaybookByOpportunityId(opportunityId: string): Promise<OpportunityPlaybook | null> {
    const { data } = await playbookRepo.list([{ field: "opportunityId", operator: "==", value: opportunityId }]);
    return data.length > 0 ? data[0] : null;
  }

  static async initializePlaybook(opportunityId: string, companyId: string, templateId?: string, userId?: string): Promise<OpportunityPlaybook> {
    let steps: any[] = [];
    let objections: any[] = [];

    if (templateId) {
      const template = await playbookTemplateRepo.get(templateId);
      if (template) {
        steps = template.defaultSteps.map(step => ({
          ...step,
          id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: "PENDING"
        }));
        
        objections = template.defaultObjections.map(obj => ({
          ...obj,
          id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }));
      }
    }

    const defaultMetrics: PlaybookSuccessMetrics = {
      estimatedWinProbability: 0,
      relationshipStrength: 0,
      competitivePosition: 0,
      customerEngagement: 0,
      readinessScore: 0,
      overallScore: 0
    };

    const newPlaybook = await playbookRepo.create({
      opportunityId,
      companyId,
      templateId,
      summary: {},
      decisionProcess: {},
      customerIntelligence: {},
      competitiveAnalysis: {},
      winStrategySteps: steps,
      expectedObjections: objections,
      successMetrics: defaultMetrics
    } as any, undefined, userId);

    if (userId) {
      await AuditService.logEvent({
        entityId: newPlaybook.id,
        entityType: "playbook",
        action: "CREATED",
        userId,
        reason: "Initialized playbook for opportunity"
      });
    }

    return newPlaybook;
  }

  static async updatePlaybook(id: string, updates: Partial<OpportunityPlaybook>, userId?: string, logReason?: string): Promise<void> {
    await playbookRepo.update(id, updates as any, userId);
    
    if (userId && logReason) {
      await AuditService.logEvent({
        entityId: id,
        entityType: "playbook",
        action: "UPDATED",
        userId,
        reason: logReason
      });
    }
  }

  static calculateMetrics(playbook: OpportunityPlaybook): PlaybookSuccessMetrics {
    // Basic heuristic calculation based on playbook completeness
    let readinessScore = 0;
    
    const summaryComplete = !!playbook.summary?.businessObjective ? 20 : 0;
    const decisionMakersIdentified = (playbook.decisionProcess?.decisionMakers?.length || 0) > 0 ? 20 : 0;
    const competitorsIdentified = (playbook.competitiveAnalysis?.competitors?.length || 0) > 0 ? 20 : 0;
    const intelligenceGathered = !!playbook.customerIntelligence?.budgetCycle ? 20 : 0;
    const strategyStepsStarted = playbook.winStrategySteps?.some(s => s.status !== "PENDING") ? 20 : 0;
    
    readinessScore = summaryComplete + decisionMakersIdentified + competitorsIdentified + intelligenceGathered + strategyStepsStarted;

    const completedSteps = playbook.winStrategySteps?.filter(s => s.status === "COMPLETED").length || 0;
    const totalSteps = playbook.winStrategySteps?.length || 1;
    const executionScore = (completedSteps / totalSteps) * 100;

    return {
      estimatedWinProbability: Math.round((readinessScore + executionScore) / 2),
      relationshipStrength: playbook.decisionProcess?.knownChampions?.length ? 80 : 30,
      competitivePosition: playbook.competitiveAnalysis?.ourCompetitiveAdvantages ? 75 : 40,
      customerEngagement: executionScore,
      readinessScore,
      overallScore: Math.round((readinessScore * 0.7) + (executionScore * 0.3))
    };
  }
}
