import { BaseRepository } from "@/lib/repository/base.repository";
import { BaseModel } from "@/types/repository";

export interface Tag extends BaseModel {
  name: string;
  color: string; // Hex color code
  entityType?: string; // Optional: restrict tag to specific module
  isSystem?: boolean; // If true, cannot be deleted by users
}

export interface EntityTag {
  entityId: string;
  tagId: string;
}

class TagRepository extends BaseRepository<Tag> {
  constructor() {
    super("_tags");
  }
}

class EntityTagRepository extends BaseRepository<EntityTag & BaseModel> {
  constructor() {
    super("_entity_tags");
  }
}

export const tagsRepo = new TagRepository();
export const entityTagsRepo = new EntityTagRepository();

export class TagsService {
  static async createTag(name: string, color: string, userId: string, entityType?: string) {
    return tagsRepo.create({
      name,
      color,
      entityType: entityType,
      isSystem: false,
    }, undefined, userId);
  }

  static async assignTag(entityId: string, tagId: string, userId: string) {
    // Check if it already exists to avoid duplicates
    const { data: existing } = await entityTagsRepo.list([
      { field: "entityId", operator: "==", value: entityId },
      { field: "tagId", operator: "==", value: tagId }
    ]);
    
    if (existing.length > 0) return existing[0];
    
    return entityTagsRepo.create({
      entityId,
      tagId,
    }, undefined, userId);
  }

  static async removeTag(entityId: string, tagId: string, userId: string) {
    const { data: existing } = await entityTagsRepo.list([
      { field: "entityId", operator: "==", value: entityId },
      { field: "tagId", operator: "==", value: tagId }
    ]);
    
    if (existing.length > 0) {
      // Hard delete relationship records
      await entityTagsRepo.hardDelete(existing[0].id);
    }
  }

  static async getEntityTags(entityId: string) {
    const { data: relationships } = await entityTagsRepo.list([
      { field: "entityId", operator: "==", value: entityId }
    ]);
    
    if (relationships.length === 0) return [];
    
    // Fetch actual tag details
    const tagIds = relationships.map(r => r.tagId);
    
    // In Firestore, 'in' queries are limited to 10 items.
    // If >10 tags, we'd need to chunk. Assuming <10 for a single entity.
    const { data: tags } = await tagsRepo.list([
      { field: "id", operator: "in", value: tagIds }
    ]);
    
    return tags;
  }
}
