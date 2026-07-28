import { BaseRepository } from "@/lib/repository/base.repository";
import { Document, KnowledgeArticle, Template } from "../models/knowledge";

export class DocumentRepository extends BaseRepository<Document> {
  constructor() {
    super("documents");
  }
}

export class KnowledgeArticleRepository extends BaseRepository<KnowledgeArticle> {
  constructor() {
    super("knowledgeArticles");
  }
}

export class TemplateRepository extends BaseRepository<Template> {
  constructor() {
    super("knowledgeTemplates");
  }
}

export const documentRepo = new DocumentRepository();
export const knowledgeArticleRepo = new KnowledgeArticleRepository();
export const templateRepo = new TemplateRepository();
