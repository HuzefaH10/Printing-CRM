import { Role } from "@/types/user";

export class OutreachUtils {
  /**
   * Helper to check if role has Sales / CRM write access
   */
  static hasSalesPermission(role?: Role | null): boolean {
    if (!role) return false;
    return ["Owner", "Admin", "Sales"].includes(role);
  }

  /**
   * Check if 5-minute rate limit is active for a company
   */
  static isRateLimited(lastOutreachSentAt?: Date | string | null): { isLimited: boolean; minutesRemaining: number; elapsedMs: number } {
    if (!lastOutreachSentAt) return { isLimited: false, minutesRemaining: 0, elapsedMs: Infinity };

    const lastSentTime = new Date(lastOutreachSentAt).getTime();
    if (isNaN(lastSentTime)) return { isLimited: false, minutesRemaining: 0, elapsedMs: Infinity };

    const now = Date.now();
    const elapsedMs = now - lastSentTime;
    const FIVE_MINUTES_MS = 5 * 60 * 1000;

    if (elapsedMs < FIVE_MINUTES_MS) {
      const remainingMs = FIVE_MINUTES_MS - elapsedMs;
      const minutesRemaining = Math.ceil(remainingMs / (60 * 1000));
      return { isLimited: true, minutesRemaining, elapsedMs };
    }

    return { isLimited: false, minutesRemaining: 0, elapsedMs };
  }
}
