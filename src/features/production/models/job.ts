import { BaseModel } from "@/types/repository";

export interface ProductionProduct {
  id: string;
  productName: string;
  quantity: number;
  finishedSize?: string;
  paper?: string;
  paperGSM?: string;
  printingMethod?: string;
  colorConfiguration?: string;
  binding?: string;
  finishing?: string;
  packaging?: string;
  deliveryInstructions?: string;
  
  // Embedded Artwork Tracking
  artworkStatus: "Pending" | "Received" | "In Review" | "Approved" | "Rejected" | string;
  artworkVersion: number;
  artworkRevisionCount?: number;
  artworkApprovedBy?: string;
  artworkApprovalDate?: Date | string;
  artworkCustomerComments?: string;
  artworkInternalComments?: string;
  artworkFileUrlPlaceholder?: string;
}

export interface JobMaterial {
  type: "Paper" | "Ink" | "Lamination" | "Binding" | "Packaging" | string;
  name: string;
  vendor?: string;
  batchPlaceholder?: string;
  consumptionPlaceholder?: number;
}

export interface WorkAssignments {
  productionManagerId?: string;
  machineOperatorId?: string;
  finishingTeamId?: string;
  packagingTeamId?: string;
  qualityInspectorId?: string;
  deliveryCoordinatorId?: string;
}

export interface JobStage {
  id: string;
  name: string; // e.g., Prepress, Printing, Binding, QC
  status: "Pending" | "In Progress" | "Completed" | "Skipped" | "Delayed" | string;
  assignedTo?: string; // User ID
  startedAt?: Date | string;
  completedAt?: Date | string;
  color?: string;
  expectedDurationHours?: number;
  order: number;
}

export interface QualityControl {
  status: "Pending" | "Pass" | "Fail" | "Rework Required" | string;
  inspector?: string;
  inspectionDate?: Date | string;
  defects?: string[];
  correctiveActions?: string;
  notes?: string;
}

export interface JobDelivery {
  method: "Courier" | "Pickup" | "Company Vehicle" | "Third-party Logistics" | string;
  address?: string;
  contactName?: string;
  dispatchDate?: Date | string;
  expectedDeliveryDate?: Date | string;
  deliveredDate?: Date | string;
  receivedBy?: string;
  trackingNumber?: string;
  status: "Pending" | "Dispatched" | "Delivered" | "Failed" | string;
}

export interface ProductionJob extends BaseModel {
  jobNumber: string; // e.g., JOB-2026-001
  jobName: string;
  
  // Foreign Keys
  quotationId?: string;
  opportunityId?: string;
  companyId: string;
  primaryContactId?: string;
  
  status: "Waiting" | "In Prepress" | "In Printing" | "In Finishing" | "In Quality Control" | "Ready for Dispatch" | "Delivered" | "Delayed" | "Cancelled" | string;
  priority: "Low" | "Normal" | "High" | "Rush" | string;
  
  assignedManagerId?: string;
  assignedTeamId?: string;
  
  customerPONumber?: string;
  
  dueDate?: Date | string;
  deliveryDate?: Date | string;
  deliveryTime?: string;
  
  products: ProductionProduct[];
  stages: JobStage[];
  
  qualityControl?: QualityControl;
  delivery?: JobDelivery;
  
  materials?: JobMaterial[];
  assignments?: WorkAssignments;

  tags: string[];
  notes?: string;
}
