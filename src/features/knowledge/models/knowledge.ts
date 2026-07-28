import { BaseModel } from "@/types/repository";

export type DocumentType = 
  | "CONTRACT" 
  | "QUOTATION" 
  | "INVOICE" 
  | "PURCHASE_ORDER" 
  | "TENDER_DOCUMENT" 
  | "VENDOR_REGISTRATION" 
  | "COMPANY_PROFILE" 
  | "CERTIFICATE" 
  | "ISO_DOCUMENT" 
  | "MACHINE_MANUAL" 
  | "OPERATING_PROCEDURE" 
  | "SOP" 
  | "TRAINING_MATERIAL" 
  | "ARTWORK" 
  | "DESIGN_FILE" 
  | "PDF" 
  | "WORD" 
  | "EXCEL" 
  | "POWERPOINT" 
  | "IMAGE" 
  | "VIDEO" 
  | "AUDIO" 
  | "SCANNED_DOCUMENT" 
  | "EMAIL" 
  | "MEETING_MINUTES" 
  | "PRESENTATION"
  | string;

export type KnowledgeCategory = "SALES" | "PRODUCTION" | "FINANCE" | "WAREHOUSE" | "PROCUREMENT" | "MARKETING" | "LEGAL" | "HR" | "ADMINISTRATION" | "MACHINES" | "MAINTENANCE" | "QUALITY" | "TRAINING" | string;
export type ApprovalStatus = "DRAFT" | "UNDER_REVIEW" | "CHANGES_REQUESTED" | "APPROVED" | "PUBLISHED" | "ARCHIVED" | "REJECTED";
export type VisibilityLevel = "PRIVATE" | "DEPARTMENT" | "MANAGEMENT" | "ORGANIZATION" | "SPECIFIC_USERS";

export interface VersionControl {
  majorVersion: number;
  minorVersion: number;
  revisionNotes?: string;
  isDraft: boolean;
  approvedVersionId?: string;
}

export interface ArtworkMetadata {
  designerId?: string;
  approvalStatus: ApprovalStatus;
  customerApproval: boolean;
  internalApproval: boolean;
  printReadyStatus: boolean;
  colorProfilePlaceholder?: string;
  preflightChecklistPlaceholder?: string;
}

export interface CertificateMetadata {
  issuingAuthority: string;
  issueDate: Date | string;
  expiryDate: Date | string;
  renewalDate: Date | string;
  responsiblePersonId: string;
  reminderScheduleDays: number[];
}

export interface SOPMetadata {
  department: string;
  reviewFrequencyDays: number;
  lastReviewDate: Date | string;
  nextReviewDate: Date | string;
  trainingRequired: boolean;
}

export interface EntityLinks {
  companyIds?: string[];
  contactIds?: string[];
  opportunityIds?: string[];
  quotationIds?: string[];
  productionJobIds?: string[];
  supplierIds?: string[];
  inventoryItemIds?: string[];
  purchaseOrderIds?: string[];
  tenderIds?: string[];
  invoiceIds?: string[];
  paymentIds?: string[];
  machinePlaceholders?: string[];
}

export interface Document extends BaseModel {
  documentId: string;
  title: string;
  description: string;
  
  category: KnowledgeCategory;
  subcategory?: string;
  documentType: DocumentType;
  
  ownerId: string;
  authorId: string;
  department: string;
  
  status: ApprovalStatus;
  versionControl: VersionControl;
  confidentialityLevel: VisibilityLevel;
  language: string;
  
  tags: string[];
  linkedEntities: EntityLinks;
  
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  
  artworkMetadata?: ArtworkMetadata;
  certificateMetadata?: CertificateMetadata;
  sopMetadata?: SOPMetadata;
}

export interface KnowledgeArticle extends BaseModel {
  title: string;
  richTextBody: string;
  category: KnowledgeCategory;
  
  ownerId: string;
  authorId: string;
  status: ApprovalStatus;
  
  versionControl: VersionControl;
  confidentialityLevel: VisibilityLevel;
  
  attachments?: string[]; // Array of Document IDs
  references?: string[]; // Links to external resources or internal IDs
  relatedArticleIds?: string[];
  
  linkedEntities: EntityLinks;
  tags: string[];
}

export interface Template extends BaseModel {
  templateName: string;
  description: string;
  category: KnowledgeCategory;
  documentType: DocumentType;
  
  fileUrl?: string; // If it's a file template
  richTextBody?: string; // If it's a content template
  
  status: ApprovalStatus;
  ownerId: string;
}
