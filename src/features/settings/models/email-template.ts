import { BaseModel } from "@/types/repository";

export type EmailTemplateSector = 
  | "Publishing" 
  | "Education" 
  | "Government" 
  | "Corporate" 
  | "Healthcare" 
  | "NGO" 
  | "Retail" 
  | "Generic";

export interface EmailTemplate extends BaseModel {
  sectorTag: EmailTemplateSector;
  subject: string;
  bodyTemplate: string;
  isActive: boolean;
}

export const EMAIL_TEMPLATE_PLACEHOLDERS = [
  "{{companyName}}",
  "{{contactName}}",
  "{{decisionMakerRole}}",
  "{{senderName}}",
  "{{senderPhone}}",
  "{{senderEmail}}",
  "{{companyLogoOrName}}"
];
