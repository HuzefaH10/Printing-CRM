import { BaseModel } from "@/types/repository";

export type ActivityType = 
  | "CALL" 
  | "MEETING" 
  | "EMAIL" 
  | "VISIT" 
  | "TASK" 
  | "FOLLOW_UP" 
  | "NOTE" 
  | "OTHER";

export type ActivityStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "OVERDUE";
export type ActivityPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

// --- Specific Payloads ---

export interface CallPayload {
  direction: "INCOMING" | "OUTGOING" | "MISSED";
  result: "ANSWERED" | "VOICEMAIL" | "NO_ANSWER" | "BUSY";
  durationMinutes?: number;
  recordingUrl?: string;
}

export interface MeetingPayload {
  agenda?: string;
  attendees?: string[]; // array of contact IDs or names
  outcome?: string;
  meetingMode: "IN_PERSON" | "VIDEO" | "PHONE";
  location?: string; // Physical address or Zoom link
  rating?: number; // 1-5
}

export interface EmailPayload {
  direction: "SENT" | "RECEIVED";
  subject: string;
  recipients: string[];
  threadId?: string;
  opened?: boolean;
}

export interface VisitPayload {
  visitType: "CUSTOMER" | "OFFICE" | "FACTORY" | "SITE";
  purpose: string;
}

export interface TaskPayload {
  completionNotes?: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
}

export interface FollowUpPayload {
  chainGroupId?: string;
  overdueAlertSent?: boolean;
}

// -------------------------

export interface Activity extends BaseModel {
  title: string;
  shortDescription?: string;
  detailedNotes?: string;
  
  type: ActivityType;
  status: ActivityStatus;
  priority: ActivityPriority;
  
  // Polymorphic Metadata payload
  payload?: CallPayload | MeetingPayload | EmailPayload | VisitPayload | TaskPayload | FollowUpPayload | Record<string, any>;
  
  // Relations
  entityType?: "company" | "contact" | "opportunity" | "quote" | "job" | "ticket" | string;
  entityId?: string;
  
  relatedCompanyId?: string; // Denormalized for fast filtering by company
  relatedContactId?: string; // Denormalized for fast filtering by contact
  
  // Ownership
  assignedTo?: string; // User ID
  createdBy: string; // User ID
  
  // Scheduling
  startDate?: Date | string;
  endDate?: Date | string;
  dueDate?: Date | string;
  reminderDate?: Date | string;
  completedAt?: Date | string;
  durationMinutes?: number;
  
  // Visibility & Organization
  tags?: string[];
  color?: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  isPrivate?: boolean;
  
  // Future AI
  aiSummary?: string;
}
