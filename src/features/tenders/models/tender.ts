import { BaseModel } from "@/types/repository";

export type RegistrationStatus = "NOT_STARTED" | "COLLECTING_DOCUMENTS" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "EXPIRED" | "RENEWAL_REQUIRED" | "ARCHIVED";

export interface DocumentRequirement {
  id: string;
  name: string; // e.g., Commercial Registration, Tax Certificate
  status: "PENDING" | "UPLOADED" | "VERIFIED" | "EXPIRED";
  expiryDate?: Date | string;
  renewalDate?: Date | string;
  version: string;
  attachmentUrl?: string;
}

export interface VendorRegistration extends BaseModel {
  registrationNumber: string;
  companyId: string; // The Organization you are registering with
  
  registrationType: string;
  authority: string;
  department: string;
  category: string;
  subcategory?: string;
  
  registrationDate?: Date | string;
  expiryDate?: Date | string;
  renewalDate?: Date | string;
  
  status: RegistrationStatus;
  approvalStage: string;
  
  assignedOwnerId: string;
  
  documentRequirements: DocumentRequirement[];
  
  verificationNotes?: string;
  notes?: string;
  attachments?: string[];
  tags?: string[];
}

export type TenderType = "OPEN_TENDER" | "LIMITED_TENDER" | "DIRECT_PURCHASE" | "RFQ" | "RFP" | "FRAMEWORK_AGREEMENT" | "ANNUAL_CONTRACT" | "EMERGENCY_PURCHASE" | string;
export type SubmissionStatus = "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "LATE_SUBMISSION" | "WITHDRAWN";
export type EvaluationStatus = "PENDING" | "UNDER_EVALUATION" | "CLARIFICATION_REQUESTED" | "NEGOTIATION" | "COMPLETED";
export type AwardStatus = "PENDING" | "AWARDED" | "LOST" | "CANCELLED";

export interface EligibilityRequirement {
  id: string;
  name: string; // e.g., Minimum Experience, Local Registration
  isSatisfied: boolean;
  notes?: string;
}

export interface SubmissionWorkspace {
  submissionDate?: Date | string;
  submissionMethod: "PORTAL" | "COURIER" | "EMAIL" | "IN_PERSON" | string;
  submittedById?: string;
  packageChecklistComplete: boolean;
  courierPlaceholder?: string;
  onlinePortalPlaceholder?: string;
  receiptNumber?: string;
  submissionConfirmation?: boolean;
  isLateSubmission: boolean;
}

export interface EvaluationAnalysis {
  technicalScore?: number;
  commercialScore?: number;
  finalRanking?: number;
  clarificationsRequested: boolean;
  negotiationsHeld: boolean;
  presentationPlaceholder?: boolean;
  siteVisitPlaceholder?: boolean;
  awardDecision?: string;
  feedback?: string;
}

export interface AwardAnalysis {
  contractValue?: number;
  contractDurationMonths?: number;
  expectedRevenue?: number;
  expectedProfit?: number;
  
  productionPlanPlaceholder?: string;
  invoiceSchedulePlaceholder?: string;
  
  winningCompanyPlaceholder?: string;
  winningPricePlaceholder?: number;
  
  priceDifference?: number;
  technicalDifferenceNotes?: string;
  commercialDifferenceNotes?: string;
  customerFeedback?: string;
  
  lessonsLearned?: string;
}

export interface Tender extends BaseModel {
  tenderNumber: string;
  tenderName: string;
  organizationId: string; // Company ID
  department?: string;
  category: string;
  description: string;
  referenceNumber?: string;
  
  publicationDate: Date | string;
  closingDate: Date | string;
  openingDate?: Date | string;
  
  estimatedContractValue: number;
  currency: string;
  tenderType: TenderType;
  
  submissionStatus: SubmissionStatus;
  evaluationStatus: EvaluationStatus;
  awardStatus: AwardStatus;
  
  ourSubmittedPrice?: number;
  estimatedProfit?: number;
  estimatedMarginPercentage?: number;
  
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  ownerId: string;
  
  eligibilityChecklist: EligibilityRequirement[];
  documentChecklist: DocumentRequirement[];
  
  submission: SubmissionWorkspace;
  evaluation: EvaluationAnalysis;
  award: AwardAnalysis;
  
  notes?: string;
  attachments?: string[];
}
