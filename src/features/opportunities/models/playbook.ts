import { BaseModel } from "@/types/repository";

export interface PlaybookSummary {
  businessObjective?: string;
  whyThisMatters?: string;
  customerBackground?: string;
  businessChallenges?: string;
  currentSupplier?: string;
  knownPainPoints?: string;
}

export interface DecisionMakingProcess {
  decisionMakers?: string[]; // Contact IDs or names
  influencers?: string[];
  procurementTeam?: string[];
  financeApprovers?: string[];
  technicalReviewers?: string[];
  knownChampions?: string[];
  knownBlockers?: string[];
}

export interface CustomerIntelligence {
  estimatedAnnualSpend?: number;
  typicalOrderSize?: string;
  orderFrequency?: string;
  budgetCycle?: string;
  tenderCycle?: string;
  vendorRegistrationStatus?: "NOT_REGISTERED" | "IN_PROGRESS" | "REGISTERED" | "EXPIRED" | string;
  contractRenewalDate?: Date | string;
  previousPrintingHistory?: string;
  preferredCommunicationMethod?: string;
  preferredMeetingStyle?: string;
  preferredProposalFormat?: string;
}

export interface CompetitiveAnalysis {
  currentPrinter?: string;
  competitors?: string[];
  competitorStrengths?: string;
  competitorWeaknesses?: string;
  estimatedPricingPosition?: string;
  ourCompetitiveAdvantages?: string;
  potentialRisks?: string;
  switchingBarriers?: string;
}

export interface PlaybookStep {
  id: string;
  title: string;
  ownerId?: string;
  dueDate?: Date | string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";
  notes?: string;
  completedAt?: Date | string;
}

export interface PlaybookObjection {
  id: string;
  category: "Price" | "Delivery" | "Quality" | "Experience" | "Approval" | "Budget" | "Relationship" | "Other" | string;
  objection: string;
  recommendedResponse: string;
}

export interface PlaybookSuccessMetrics {
  estimatedWinProbability: number;
  relationshipStrength: number;
  competitivePosition: number;
  customerEngagement: number;
  readinessScore: number;
  overallScore: number;
}

export interface OpportunityPlaybook extends BaseModel {
  opportunityId: string;
  companyId: string;
  templateId?: string; // If derived from a template
  
  summary: PlaybookSummary;
  decisionProcess: DecisionMakingProcess;
  customerIntelligence: CustomerIntelligence;
  competitiveAnalysis: CompetitiveAnalysis;
  
  winStrategySteps: PlaybookStep[];
  expectedObjections: PlaybookObjection[];
  nextBestAction?: string;
  
  successMetrics: PlaybookSuccessMetrics;
}
