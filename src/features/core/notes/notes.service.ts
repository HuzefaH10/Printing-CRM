import { BaseRepository } from "@/lib/repository/base.repository";
import { BaseModel } from "@/types/repository";

export interface Note extends BaseModel {
  entityId: string;
  entityType: string;
  content: string; // Rich text content (HTML or Markdown)
  isPinned: boolean;
  isPrivate: boolean; // If true, only visible to creator or admins
}

class NoteRepository extends BaseRepository<Note> {
  constructor() {
    super("_notes");
  }
}

export const notesRepo = new NoteRepository();

export class NotesService {
  static async addNote(entityId: string, entityType: string, content: string, userId: string, isPrivate = false) {
    return notesRepo.create({
      entityId,
      entityType,
      content,
      isPinned: false,
      isPrivate
    }, undefined, userId);
  }

  static async getNotes(entityId: string) {
    return notesRepo.list([
      { field: "entityId", operator: "==", value: entityId }
    ], { orderBy: "createdAt", orderDirection: "desc" });
  }

  static async togglePin(noteId: string, isPinned: boolean, userId: string) {
    return notesRepo.update(noteId, { isPinned }, userId);
  }
}
