import { BaseRepository } from "@/lib/repository/base.repository";
import { OpportunityPlaybook } from "../models/playbook";

class PlaybookRepository extends BaseRepository<OpportunityPlaybook> {
  constructor() {
    super("opportunity_playbooks");
  }
}

export const playbookRepo = new PlaybookRepository();
