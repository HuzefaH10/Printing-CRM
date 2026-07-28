import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTask,
  StorageError
} from "firebase/storage";
import { storage } from "@/config/firebase";

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified?: number;
}

export interface UploadProgress {
  progress: number;
  status: "running" | "paused" | "success" | "error";
  downloadUrl?: string;
  error?: StorageError;
}

export class StorageService {
  /**
   * Generates a standardized storage path based on entity and ID.
   * Format: `[module]/[entityId]/[timestamp]_[filename]`
   */
  static generateFilePath(module: string, entityId: string, fileName: string): string {
    const timestamp = Date.now();
    // Sanitize filename to remove special characters that might cause issues in URLs
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    return `${module}/${entityId}/${timestamp}_${sanitizedName}`;
  }

  /**
   * Upload a file with progress tracking
   * @param path The full path in storage
   * @param file The file object
   * @param metadata Optional metadata
   * @param onProgress Callback for upload progress
   * @returns A promise that resolves to the download URL
   */
  static uploadFile(
    path: string,
    file: File | Blob,
    metadata?: any,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!storage) {
        reject(new Error("Storage is not initialized. Ensure this is running on the client."));
        return;
      }

      const storageRef = ref(storage, path);
      
      const customMetadata = {
        customMetadata: {
          originalName: (file as File).name || "unknown",
          ...metadata
        }
      };

      const uploadTask: UploadTask = uploadBytesResumable(storageRef, file, customMetadata);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress({
              progress,
              status: snapshot.state as any,
            });
          }
        },
        (error) => {
          if (onProgress) {
            onProgress({ progress: 0, status: "error", error });
          }
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) {
              onProgress({ progress: 100, status: "success", downloadUrl });
            }
            resolve(downloadUrl);
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  }

  /**
   * Delete a file from storage by its full path or download URL
   */
  static async deleteFile(pathOrUrl: string): Promise<void> {
    if (!storage) throw new Error("Storage is not initialized.");
    
    try {
      // If a URL is passed, we can still parse it or create a ref from it in some cases,
      // but ref(storage, path) requires the path relative to bucket.
      // Firebase `ref` can actually take a gs:// or https:// firebase storage URL directly.
      const fileRef = ref(storage, pathOrUrl);
      await deleteObject(fileRef);
    } catch (error: any) {
      // If the object doesn't exist, we don't need to throw an error 
      // in most soft-deletion architectures, but we will log it.
      if (error.code === 'storage/object-not-found') {
        console.warn("Storage object not found, it may have already been deleted.");
        return;
      }
      throw error;
    }
  }

  /**
   * Retrieves the download URL for an existing file path
   */
  static async getFileUrl(path: string): Promise<string> {
    if (!storage) throw new Error("Storage is not initialized.");
    const fileRef = ref(storage, path);
    return await getDownloadURL(fileRef);
  }
}
