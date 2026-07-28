import { opportunityRepo } from "./opportunity.repository";
import { Opportunity, OpportunityStatus } from "../models/opportunity";

export class OpportunityService {
  static async updateStatus(oppId: string, newStatus: OpportunityStatus, userId: string, extraUpdates?: Partial<Opportunity>): Promise<void> {
    const opp = await opportunityRepo.get(oppId);
    if (!opp) throw new Error("Opportunity not found");

    const updates: Partial<Opportunity> = {
      status: newStatus,
      ...extraUpdates
    };

    await opportunityRepo.update(oppId, updates, userId);
  }

  static async createOpportunity(data: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<string> {
    const created = await opportunityRepo.create(data, userId);
    return created.id;
  }
}
