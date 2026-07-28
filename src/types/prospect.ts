export type ProspectStatus =
  | 'New'
  | 'Researching'
  | 'Contact Planned'
  | 'Contacted'
  | 'Meeting Scheduled'
  | 'Meeting Completed'
  | 'Qualified'
  | 'Proposal Requested'
  | 'Opportunity Created'
  | 'Lost'
  | 'Won'
  | 'Archived'
  | 'Converted';

export type ProspectPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ProspectLeadStatus = 'Cold' | 'Warm' | 'Hot';
export type ProspectRating = '*' | '**' | '***' | '****' | '*****' | string; // To allow arbitrary rating strings from excel
export type GovPrivate = 'Government' | 'Private' | 'Other';

export interface Prospect {
  id?: string;
  
  // Core Info
  organizationName: string;
  industry: string;
  description: string;
  website: string;
  location: string;
  businessType: string;
  likelyPrintingRequirements: string;
  priority: ProspectPriority;
  rating: ProspectRating;
  status: ProspectStatus;
  source: string;

  // Decision Maker
  decisionMakerName?: string;
  decisionMakerRole?: string;
  decisionMakerEmail?: string;
  decisionMakerPhone?: string;

  // Sales Fields
  leadStatus?: ProspectLeadStatus;
  qualificationScore?: number; // 0-100
  potentialAnnualSpend?: number;
  potentialBusinessValue?: number;
  currentVendor?: string;
  tenderParticipant?: boolean;
  sector?: GovPrivate;
  lastContact?: string; // ISO String
  nextFollowUp?: string; // ISO String
  followUpCount?: number;
  probabilityOfConversion?: number; // 0-100
  expectedFirstOrder?: string; // ISO String
  estimatedRevenue?: number;
  competitors?: string[];
  relationshipScore?: number; // 0-100
  customFields?: Record<string, any>;

  // Metadata
  assignedSalesperson?: string;
  tags?: string[];
  notes?: string;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  
  // Lifecycle
  convertedCompanyId?: string; // Set when converted to a Company
}
