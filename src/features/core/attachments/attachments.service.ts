import { BaseRepository } from "@/lib/repository/base.repository";
import { BaseModel } from "@/types/repository";
import { StorageService, UploadProgress } from "@/services/storage.service";

export interface Attachment extends BaseModel {
  entityId: string;
  entityType: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  downloadUrl: string;
  storagePath: string;
  version: number;
}

class AttachmentRepository extends BaseRepository<Attachment> {
  constructor() {
    super("_attachments");
  }
}

export const attachmentsRepo = new AttachmentRepository();

export class AttachmentsService {
  static async uploadAttachment(
    entityId: string,
    entityType: string,
    file: File,
    userId: string,
    onProgress?: (progress: UploadProgress) => void
  ) {
    const storagePath = StorageService.generateFilePath(entityType, entityId, file.name);
    
    // Upload to Firebase Storage
    const downloadUrl = await StorageService.uploadFile(storagePath, file, { entityId, entityType }, onProgress);

    // Create record in Firestore
    return attachmentsRepo.create({
      entityId,
      entityType,
      fileName: file.name,
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      downloadUrl,
      storagePath,
      version: 1
    }, undefined, userId);
  }

  static async getAttachments(entityId: string) {
    return attachmentsRepo.list([
      { field: "entityId", operator: "==", value: entityId }
    ], { orderBy: "createdAt", orderDirection: "desc" });
  }

  static async deleteAttachment(attachmentId: string, storagePath: string, userId: string) {
    // Soft delete the firestore record
    await attachmentsRepo.softDelete(attachmentId, userId);
    
    // Actually delete from storage (optional, depending on retention policy)
    // await StorageService.deleteFile(storagePath);
  }
}
