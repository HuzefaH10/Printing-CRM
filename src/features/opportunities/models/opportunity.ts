import { BaseModel } from "@/types/repository";

export type OpportunityStatus = "OPEN" | "WON" | "LOST" | "DORMANT" | "ARCHIVED";
export type OpportunityPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type PrintingCategory = 
  | "Books" | "Textbooks" | "Manuals" | "Catalogues" | "Corporate Profiles" 
  | "Annual Reports" | "ESG Reports" | "Training Material" | "Packaging" 
  | "Labels" | "Business Cards" | "Brochures" | "Flyers" | "Stationery" 
  | "Calendars" | "Diaries" | "Posters" | "Custom Printing" 
  | "Large Format" | "Variable Data Printing" | "Other" | string;

export interface PrintingRequirements {
  productType?: string;
  quantity?: number;
  paper?: string;
  size?: string;
  binding?: string;
  finishing?: string;
  color?: string;
  packaging?: string;
  deliveryOptions?: string;
  specialInstructions?: string;
  artworkStatus?: "READY" | "NEEDS_DESIGN" | "WITH_CLIENT";
  deadline?: Date | string;
}

export interface RiskAssessment {
  priceCompetitionScore: number; // 1-10
  deliveryRiskScore: number; // 1-10
  paymentRiskScore: number; // 1-10
  relationshipRiskScore: number; // 1-10
  specificationRiskScore: number; // 1-10
  overallRiskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  notes?: string;
}

export interface CompetitorTracking {
  competitorName: string;
  strengths?: string;
  weaknesses?: string;
  estimatedPricing?: number;
  relationshipLevel?: "WEAK" | "UNKNOWN" | "STRONG";
  whyWeCanWin?: string;
}

export interface WinLossAnalysis {
  reason?: string;
  winningPrice?: number;
  winningMargin?: number;
  lostToCompetitor?: string;
  priceDifference?: number;
  customerFeedback?: string;
  lessonsLearned?: string;
  repeatPotential?: boolean;
}

export interface IntelligenceScore {
  relationshipScore: number; // 1-100
  budgetScore: number; // 1-100
  urgencyScore: number; // 1-100
  probabilityScore: number; // 1-100
  competitionScore: number; // 1-100
  activityScore: number; // 1-100
  printingPotential: number; // 1-100
  overallWinProbability: number; // 1-100 (weighted aggregate)
}

export interface Opportunity extends BaseModel {
  // Core Info
  name: string;
  description?: string;
  companyId: string;
  contactIds?: string[]; // Multiple contacts involved
  ownerId: string; // Assigned User
  
  // Pipeline State
  pipelineId?: string; // For future multi-pipeline support
  stageId: string; // Current Kanban Stage ID
  stageEnteredAt?: Date | string;
  status: OpportunityStatus;
  priority: OpportunityPriority;
  
  // Financials
  estimatedRevenue: number;
  estimatedProfit?: number;
  expectedMargin?: number; // percentage
  currency: string;
  budget?: number;
  
  // Printing Specifics
  printingCategory: PrintingCategory;
  expectedQuantity?: number;
  sampleRequired?: boolean;
  sampleSent?: boolean;
  sampleApproved?: boolean;
  quotationRequired?: boolean;
  quotationSent?: boolean;
  vendorRegistrationRequired?: boolean;
  tenderNumber?: string;
  
  // Timing & Forecasting
  expectedCloseDate?: Date | string;
  probability: number; // 0-100 user input probability
  urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  source?: string;
  decisionTimeline?: string;
  procurementMethod?: string; // e.g., Tender, Direct, Portal
  
  // Tracking
  lastActivityAt?: Date | string;
  nextActivityAt?: Date | string;
  nextActivityId?: string;
  
  // Nested Objects
  printingRequirements: PrintingRequirements;
  riskAssessment: RiskAssessment;
  competitors: CompetitorTracking[];
  winLossAnalysis?: WinLossAnalysis;
  intelligenceScore?: IntelligenceScore;
  
  // Metadata
  tags?: string[];
}
