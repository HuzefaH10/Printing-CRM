import { BaseRepository } from "@/lib/repository/base.repository";
import { PlaybookTemplate } from "../models/playbook-template";

class PlaybookTemplateRepository extends BaseRepository<PlaybookTemplate> {
  constructor() {
    super("playbook_templates");
  }
}

export const playbookTemplateRepo = new PlaybookTemplateRepository();
