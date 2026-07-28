import { BaseModel } from "@/types/repository";

export type JobStatus = "Prepress" | "Proofing" | "Production" | "Finishing" | "Delivery" | "Invoiced" | "Completed";
export type ArtworkStatus = "Pending" | "Received" | "Approved";

export interface Job extends BaseModel {
  opportunityId: string;
  organizationId: string;
  jobNumber: string; // format: JOB-YYYY-NNNN
  status: JobStatus;
  specifications: Record<string, any>; // maps directly from OpportunitySpecs
  artworkStatus: ArtworkStatus;
  deliveryDeadline: Date | string; // Required
  actualDeliveryDate?: Date | string | null;
}
