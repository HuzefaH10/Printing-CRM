import { BaseRepository } from "@/lib/repository/base.repository";
import { BaseModel } from "@/types/repository";

export interface BiometricAuditLog extends BaseModel {
  action: string;
  userId: string;
  verified: boolean;
  timestamp: string;
}

class BiometricAuditRepository extends BaseRepository<BiometricAuditLog> {
  constructor() {
    super("biometric_audit_logs");
  }
}

export const biometricAuditRepo = new BiometricAuditRepository();

export class BiometricAuditService {
  /**
   * Log a biometrically verified action
   */
  static async logEvent(params: { action: string; userId: string; verified: boolean }) {
    try {
      await biometricAuditRepo.create({
        action: params.action,
        userId: params.userId,
        verified: params.verified,
        timestamp: new Date().toISOString()
      }, undefined, params.userId);
    } catch (err) {
      console.error("Failed to log biometric action:", err);
    }
  }

  /**
   * Get recent biometric audit logs
   */
  static async getRecentLogs(limitCount: number = 50) {
    return biometricAuditRepo.list([], { orderBy: "timestamp", orderDirection: "desc", limit: limitCount });
  }
}
