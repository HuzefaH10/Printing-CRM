import { BaseModel } from "@/types/repository";

export type ModuleSource = 
  | "SALES" 
  | "PRODUCTION" 
  | "FINANCE" 
  | "WAREHOUSE" 
  | "PROCUREMENT" 
  | "TENDERS" 
  | "KNOWLEDGE"
  | "CUSTOMERS"
  | "ACTIVITIES";

export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface Alert extends BaseModel {
  title: string;
  description: string;
  severity: AlertSeverity;
  module: ModuleSource;
  
  linkedEntityId?: string;
  linkedEntityType?: string; // e.g., "Company", "Quotation", "InventoryItem"
  
  isResolved: boolean;
  resolvedAt?: Date | string;
  resolvedByUserId?: string;
  
  dueDate?: Date | string; // For alerts that have a deadline (e.g. renewals)
}

export interface TimelineEvent extends BaseModel {
  eventType: string; // e.g., "QUOTATION_APPROVED", "PRODUCTION_STARTED"
  actorId: string; // The user or system who triggered the event
  module: ModuleSource;
  
  title: string;
  description: string;
  
  linkedEntityId?: string;
  linkedEntityType?: string;
  
  metadata?: Record<string, any>;
}

export interface BusinessHealthScore {
  overallScore: number; // 0-100
  
  departmentScores: {
    sales: number;
    production: number;
    finance: number;
    customer: number;
    inventory: number;
    supplier: number;
    compliance: number;
  };
  
  trend: "UP" | "DOWN" | "STABLE";
  recommendationsPlaceholders: string[];
}
