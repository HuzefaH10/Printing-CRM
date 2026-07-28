import { BaseModel } from "@/types/repository";

export type OpportunityStatus = "Lead" | "Scoping" | "Quoted" | "Negotiation" | "Won" | "Lost";

export interface OpportunitySpecs {
  quantity?: number;
  size?: string;
  colors?: string;
  gsm?: string;
  finishing?: string;
  [key: string]: any; // Allow free-form specs for now
}

export interface Opportunity extends BaseModel {
  organizationId: string;
  personId?: string;
  title: string;
  status: OpportunityStatus;
  quotedValue?: number;
  estimatedCost?: number;
  expectedCloseDate?: Date | string | null;
  lossReason?: string;
  specs?: OpportunitySpecs;
}
