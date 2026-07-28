import { productionRepo } from "./production.repository";
import { ProductionJob, JobStage } from "../models/job";
import { AuditService } from "@/services/audit.service";

export class ProductionService {
  static async getJobById(id: string): Promise<ProductionJob | null> {
    return await productionRepo.get(id);
  }

  static async getJobsByCompany(companyId: string): Promise<ProductionJob[]> {
    const { data } = await productionRepo.list([{ field: "companyId", operator: "==", value: companyId }]);
    return data;
  }

  static async getJobsByQuotation(quotationId: string): Promise<ProductionJob[]> {
    const { data } = await productionRepo.list([{ field: "quotationId", operator: "==", value: quotationId }]);
    return data;
  }

  static getDefaultStages(): JobStage[] {
    const stages = [
      "Order Approved",
      "Artwork Received", 
      "Artwork Verification",
      "Prepress",
      "Proof Preparation",
      "Proof Approval",
      "Plate Making Placeholder",
      "Paper Allocation",
      "Printing",
      "Drying Placeholder",
      "Cutting",
      "Folding",
      "Binding",
      "Lamination",
      "Foiling",
      "Embossing",
      "Spot UV",
      "Die Cutting",
      "Packing",
      "Quality Inspection",
      "Dispatch Ready",
      "Delivered",
      "Completed",
      "Cancelled"
    ];

    return stages.map((name, idx) => ({
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
      name,
      status: "Pending",
      order: idx + 1
    }));
  }

  static async createJob(data: Omit<ProductionJob, "id" | "createdAt" | "updatedAt">, userId?: string): Promise<ProductionJob> {
    if (!data.jobNumber) {
      data.jobNumber = `JOB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    if (!data.stages || data.stages.length === 0) {
      data.stages = this.getDefaultStages();
    }

    const job = await productionRepo.create(data as any, undefined, userId);

    if (userId) {
      await AuditService.logEvent({
        entityId: job.id,
        entityType: "production_job",
        action: "CREATED",
        userId,
        reason: "Created new production job"
      });
    }

    return job;
  }

  static async updateJob(id: string, updates: Partial<ProductionJob>, userId?: string, logReason?: string): Promise<void> {
    await productionRepo.update(id, updates as any, userId);

    if (userId && logReason) {
      await AuditService.logEvent({
        entityId: id,
        entityType: "production_job",
        action: "UPDATED",
        userId,
        reason: logReason
      });
    }
  }

  static async advanceStage(jobId: string, stageId: string, userId: string): Promise<void> {
    const job = await this.getJobById(jobId);
    if (!job) throw new Error("Job not found");

    const updatedStages = job.stages.map(stage => {
      if (stage.id === stageId) {
        return {
          ...stage,
          status: "Completed",
          completedAt: new Date().toISOString()
        };
      }
      return stage;
    });

    const activeStage = updatedStages.find(s => s.status !== "Completed" && s.status !== "Skipped");
    const newJobStatus = activeStage ? `In ${activeStage.name}` : "Completed";

    await this.updateJob(jobId, {
      stages: updatedStages,
      status: newJobStatus as any
    }, userId, `Advanced stage to ${activeStage?.name || 'Completed'}`);
  }
}
