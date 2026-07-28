import { BaseModel } from "@/types/repository";

export type CompanyStatus = "LEAD" | "PROSPECT" | "ACTIVE" | "INACTIVE" | "CHURNED" | "PARTNER" | "VENDOR";
export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface CompanyLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  area: string;
  googleMapsUrl?: string;
  timeZone?: string;
  workingHours?: string;
}

export interface PrintingProfile {
  products: string[]; // e.g., ["Books", "Packaging", "Brochures"]
  typicalQuantities: string; // e.g., "500-1000", "10,000+"
  preferredPaper: string[];
  preferredBinding: string[];
  preferredFinishing: string[];
  preferredDeliverySchedule: string;
  artworkContact: string; // Contact ID
  approvalProcess: string;
  printingFrequency: string; // e.g., "Monthly", "Quarterly", "Ad-hoc"
  estimatedYearlySpend: number;
  typicalOrderValue: number;
  seasonality: string;
  preferredQuotationFormat: string;
  paymentTerms: string;
  preferredCommunicationMethod: string;
  knownSuppliers: string[];
  knownCompetitors: string[];
  currentPrintingCompany?: string;
  likelihoodToOutsource: number; // 1-100
  tenderParticipation: boolean;
  vendorRegistrationAvailable: boolean;
  sampleRequested: boolean;
  sampleSent: boolean;
  sampleApproved: boolean;
}

export interface IntelligenceScore {
  relationshipScore: number; // 1-100
  potentialScore: number;
  opportunityScore: number;
  urgencyScore: number;
  engagementScore: number;
  overallScore: number; // Computed average or weighted
}

export interface RelationshipTracker {
  lastContactAt?: Date | string | null;
  lastMeetingAt?: Date | string | null;
  lastCallAt?: Date | string | null;
  lastEmailAt?: Date | string | null;
  lastVisitAt?: Date | string | null;
  responseTimeDays: number;
  averageFollowUpDays: number;
  communicationFrequency: string;
  health: "POOR" | "FAIR" | "GOOD" | "EXCELLENT";
}

export interface SupplierProfile {
  supplierCategory: string; // e.g., Paper Mills, Ink Suppliers
  supplierSubcategory?: string;
  supplierType: "MANUFACTURER" | "DISTRIBUTOR" | "WHOLESALER" | "SERVICE_PROVIDER" | string;
  paymentTerms: string;
  creditLimit?: number;
  leadTimeDays: number;
  preferredShippingMethod?: string;
  incotermsPlaceholder?: string;
  bankDetailsPlaceholder?: string;
  vendorCode?: string;
}

export interface Company extends BaseModel {
  // Basic Info
  name: string;
  legalName: string;
  displayName?: string;
  industry: string;
  subIndustry?: string;
  category: string;
  description: string;
  
  // Contact
  website?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  phone: string;
  mobile?: string;
  email: string;
  supportEmail?: string;
  salesEmail?: string;
  procurementEmail?: string;

  // Nested Objects
  location: CompanyLocation;
  printingProfile?: PrintingProfile;
  supplierProfile?: SupplierProfile;
  intelligence: IntelligenceScore;
  relationshipTracker: RelationshipTracker;

  // Roles
  isCustomer: boolean;
  isSupplier: boolean;
  isPartner: boolean;

  // Metadata & Metrics
  companySize?: string;
  employeeCount?: number;
  revenue?: number;
  currency: string;
  language: string;
  vendorId?: string;
  taxNumber?: string;
  registrationNumber?: string;
  
  customerSince?: Date | string | null;
  source?: string;
  leadSource?: string;
  priority: PriorityLevel;
  status: CompanyStatus;

  // Financials
  potentialRevenue?: number;
  lifetimeValue?: number;

  // Tagging
  tags: string[]; // Tag IDs
  colorLabel?: string;
  
  // Custom Fields (Dynamic key-value map)
  customFields?: Record<string, any>;

  // Ownership
  ownerId?: string;
}
