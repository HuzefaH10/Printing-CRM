import { BaseModel } from "@/types/repository";

export interface ContactPreferences {
  communicationChannel?: "Email" | "Phone" | "WhatsApp" | "Teams" | "Zoom" | "Google Meet" | "In Person" | string;
  bestTimeToContact?: string;
  avoidContactTimes?: string;
  preferredMeetingDuration?: number;
  preferredProposalFormat?: string;
  preferredFileFormat?: string;
  favoriteBeverage?: string;
  meetingPreferences?: string;
  communicationStyle?: string;
  interests?: string[];
  hobbies?: string[];
  preferredPrintingProducts?: string[];
  favoritePaperTypes?: string[];
  preferredFinishes?: string[];
}

export interface RelationshipProfile {
  decisionAuthority?: "Decision Maker" | "Influencer" | "Technical Reviewer" | "Finance Approver" | "Procurement" | "Gatekeeper" | "Executive" | "End User" | "Other" | string;
  customRoleTitle?: string;
  relationshipStrength: number; // 0-100
  trustScore: number; // 0-100
  influenceScore: number; // 0-100
  communicationFrequency?: string;
  responsiveness?: string;
  averageReplyTime?: string;
  lastContactDate?: Date | string | null;
  nextFollowUp?: Date | string | null;
}

export interface ContactHealthScore {
  relationshipScore: number;
  engagementScore: number;
  trustScore: number;
  influenceScore: number;
  responseScore: number;
  activityScore: number;
  overallHealth: number; // 0-100
}

export interface Contact extends BaseModel {
  companyId: string;
  
  // Basic Details
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  jobTitle?: string;
  department?: string;
  
  // Contact Info
  email?: string;
  workEmail?: string;
  personalEmail?: string;
  phone?: string;
  mobile?: string;
  whatsappNumber?: string;
  officeExtension?: string;
  linkedin?: string;
  website?: string;
  
  // Location
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
  language?: string;
  
  // Dates
  birthday?: Date | string;
  workAnniversary?: Date | string;
  
  // Profiles & Scores
  relationshipProfile: RelationshipProfile;
  preferences: ContactPreferences;
  healthScore: ContactHealthScore;
  
  // Meta
  notes?: string;
  tags?: string[];
  ownerId?: string;
  status: "ACTIVE" | "INACTIVE" | "LEFT_COMPANY";
  priority: "LOW" | "MEDIUM" | "HIGH" | "VIP";
  isArchived: boolean;
  isFavorite: boolean;
  profilePhotoUrl?: string;
}
