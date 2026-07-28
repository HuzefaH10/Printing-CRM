import { serverTimestamp, Timestamp } from "firebase/firestore";
import { BaseRepository } from "@/lib/repository/base.repository";
import { BaseModel } from "@/types/repository";

export type AuditAction = "CREATED" | "UPDATED" | "DELETED" | "RESTORED" | "ARCHIVED" | "STAGE_CHANGED" | "ACTIVITY_LOGGED" | "ACTIVITY_COMPLETED" | string;

export interface AuditLog extends BaseModel {
  entityId: string;
  entityType: string;
  action: AuditAction;
  userId?: string | null;
  oldValue?: Record<string, any> | null;
  newValue?: Record<string, any> | null;
  diff?: Record<string, any> | null;
  reason?: string | null;
  ipAddress?: string | null; // Placeholder for future usage
}

class AuditRepository extends BaseRepository<AuditLog> {
  constructor() {
    super("_audit_logs");
  }
}

const auditRepo = new AuditRepository();

export class AuditService {
  /**
   * Log an audit event. Usually called automatically by repositories or business logic.
   */
  static async logEvent(params: {
    entityId: string;
    entityType: string;
    action: AuditAction;
    userId?: string;
    oldValue?: Record<string, any>;
    newValue?: Record<string, any>;
    reason?: string;
  }): Promise<void> {
    
    let diff: Record<string, any> | undefined = undefined;

    // Calculate a simple diff for updates to save space
    if (params.action === "UPDATED" && params.oldValue && params.newValue) {
      diff = {};
      const allKeys = new Set([...Object.keys(params.oldValue), ...Object.keys(params.newValue)]);
      
      allKeys.forEach(key => {
        // Skip metadata fields to reduce noise
        if (["updatedAt", "createdAt", "updatedBy"].includes(key)) return;
        
        const oldVal = params.oldValue?.[key];
        const newVal = params.newValue?.[key];
        
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          diff![key] = { from: oldVal, to: newVal };
        }
      });
      
      // If there are no actual differences (besides metadata), we might not want to log.
      // But for audit compliance, we log it anyway with an empty diff.
    }

    try {
      await auditRepo.create({
        entityId: params.entityId,
        entityType: params.entityType,
        action: params.action,
        userId: params.userId || null,
        oldValue: params.oldValue || null,
        newValue: params.newValue || null,
        diff: diff || null,
        reason: params.reason || null,
        ipAddress: null, // To be injected via server headers in future Next.js API routes
      });
    } catch (error) {
      // We don't throw audit errors to prevent blocking the main user flow,
      // but we must log them to system monitoring.
      console.error("Failed to write audit log:", error);
    }
  }

  /**
   * Helper to retrieve timeline for a specific entity
   */
  static async getEntityHistory(entityId: string, limitCount: number = 50) {
    return auditRepo.list(
      [{ field: "entityId", operator: "==", value: entityId }],
      { orderBy: "createdAt", orderDirection: "desc", limit: limitCount }
    );
  }
}
