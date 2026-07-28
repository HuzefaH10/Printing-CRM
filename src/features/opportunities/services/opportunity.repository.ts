import { BaseRepository } from "@/lib/repository/base.repository";
import { Opportunity } from "../models/opportunity";

class OpportunityRepository extends BaseRepository<Opportunity> {
  constructor() {
    super("opportunities");
  }
}

export const opportunityRepo = new OpportunityRepository();
