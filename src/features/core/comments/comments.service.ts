import { BaseRepository } from "@/lib/repository/base.repository";
import { BaseModel } from "@/types/repository";

export interface Comment extends BaseModel {
  entityId: string;
  entityType: string;
  parentId?: string; // For threaded replies
  content: string;
  isResolved: boolean;
  isPinned: boolean;
  mentions: string[]; // Array of userIds mentioned
}

class CommentRepository extends BaseRepository<Comment> {
  constructor() {
    super("_comments");
  }
}

export const commentsRepo = new CommentRepository();

export class CommentsService {
  static async addComment(params: {
    entityId: string;
    entityType: string;
    content: string;
    userId: string;
    parentId?: string;
    mentions?: string[];
  }) {
    return commentsRepo.create({
      entityId: params.entityId,
      entityType: params.entityType,
      content: params.content,
      parentId: params.parentId,
      mentions: params.mentions || [],
      isResolved: false,
      isPinned: false
    }, undefined, params.userId);
  }

  static async getComments(entityId: string) {
    return commentsRepo.list([
      { field: "entityId", operator: "==", value: entityId }
    ], { orderBy: "createdAt", orderDirection: "asc" });
  }

  static async resolveComment(commentId: string, userId: string) {
    return commentsRepo.update(commentId, { isResolved: true }, userId);
  }
}
