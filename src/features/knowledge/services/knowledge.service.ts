import { Document, KnowledgeArticle } from "../models/knowledge";
import { documentRepo, knowledgeArticleRepo } from "./knowledge.repository";

export class KnowledgeService {
  
  /**
   * Promotes a document to the next version, returning a new Draft instance
   * while keeping the original intact.
   */
  static async createNewVersion(
    originalDocId: string, 
    userId: string, 
    bumpType: "MAJOR" | "MINOR"
  ): Promise<Document> {
    const original = await documentRepo.get(originalDocId);
    if (!original) throw new Error("Original document not found.");
    
    // Create new copy
    const newDoc: Partial<Document> = {
      ...original,
      id: undefined, // Let the repo generate a new ID
      documentId: original.documentId, // Keep the same external tracking ID
      status: "DRAFT",
      versionControl: {
        majorVersion: bumpType === "MAJOR" ? original.versionControl.majorVersion + 1 : original.versionControl.majorVersion,
        minorVersion: bumpType === "MINOR" ? original.versionControl.minorVersion + 1 : 0,
        isDraft: true
      },
      authorId: userId, // The person creating the new version
    };
    
    return await documentRepo.create(newDoc as any, undefined, userId);
  }
  
  /**
   * Approves a draft document or article, making it the active published version.
   */
  static async approveContent(
    contentId: string, 
    contentType: "DOCUMENT" | "ARTICLE", 
    userId: string
  ): Promise<Document | KnowledgeArticle> {
    
    if (contentType === "DOCUMENT") {
      const doc = await documentRepo.get(contentId);
      if (!doc) throw new Error("Document not found.");
      
      doc.status = "APPROVED";
      doc.versionControl.isDraft = false;
      
      // If it's artwork, mark internal approval
      if (doc.artworkMetadata) {
        doc.artworkMetadata.internalApproval = true;
        doc.artworkMetadata.approvalStatus = "APPROVED";
      }
      
      await documentRepo.update(doc.id, doc, userId);
      return doc;
      
    } else {
      const article = await knowledgeArticleRepo.get(contentId);
      if (!article) throw new Error("Article not found.");
      
      article.status = "PUBLISHED";
      article.versionControl.isDraft = false;
      
      await knowledgeArticleRepo.update(article.id, article, userId);
      return article;
    }
  }
}
