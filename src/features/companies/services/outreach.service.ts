import * as z from "zod";
import { companyRepo } from "./company.repository";
import { activityRepo } from "@/features/activities/services/activity.repository";
import { AuditService } from "@/services/audit.service";
import { OutreachSettingsService } from "@/features/settings/services/outreach-settings.service";
import { EmailService } from "@/services/email.service";
import { Role } from "@/types/user";

export const outreachRequestSchema = z.object({
  companyId: z.string().min(1, "Company ID is required"),
  contactEmail: z.string().email("A valid recipient email address is required"),
  contactName: z.string().min(1, "Contact name is required"),
  customMessage: z.string().min(20, "Message body must be at least 20 characters long"),
});

export type OutreachRequestInput = z.infer<typeof outreachRequestSchema>;

export class OutreachService {
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

  /**
   * Send partnership email, log activity on success, reject and don't log on failure.
   */
  static async sendPartnershipEmail(
    input: OutreachRequestInput,
    user: { uid: string; email?: string | null; role?: Role | null }
  ) {
    // 1. Permission check
    if (!this.hasSalesPermission(user.role)) {
      throw new Error("Unauthorized: Only users with Sales, Admin, or Owner roles can send partnership outreach.");
    }

    // 2. Zod Validation
    const validated = outreachRequestSchema.parse(input);

    // 3. Fetch Company & check existence
    const company = await companyRepo.get(validated.companyId);
    if (!company) {
      throw new Error("Company not found.");
    }

    // 4. Rate Limiting Check (5 minutes per company)
    const rateLimit = this.isRateLimited(company.lastOutreachSentAt);
    if (rateLimit.isLimited) {
      throw new Error(`Rate limit active: An outreach email was recently sent to ${company.name}. Please wait ${rateLimit.minutesRemaining} minute(s) before sending another.`);
    }

    // 5. Fetch Outreach Settings
    const settings = await OutreachSettingsService.getSettings();

    // 6. Build Subject & Signature
    const subject = `Partnership Opportunity — ${settings.companyPressName || "Printing Press"}`;
    const bodyText = validated.customMessage;

    // 7. Dispatch Real Email via EmailService
    const emailResult = await EmailService.sendPartnershipEmail({
      to: validated.contactEmail,
      recipientName: validated.contactName,
      subject,
      body: bodyText,
      signature: settings.defaultSignature,
      settings,
    });

    const nowIso = new Date().toISOString();

    // 8. On Success: Write Activity log entry & update company
    try {
      // Create Activity log entry
      const activity = await activityRepo.create(
        {
          title: `Partnership Outreach Email Sent to ${validated.contactName}`,
          shortDescription: `Outreach email sent to ${validated.contactEmail} (${settings.companyPressName})`,
          detailedNotes: bodyText,
          type: "EMAIL",
          status: "COMPLETED",
          priority: "MEDIUM",
          relatedCompanyId: company.id,
          entityType: "company",
          entityId: company.id,
          assignedTo: user.uid,
          payload: {
            direction: "SENT",
            subject,
            recipients: [validated.contactEmail],
            recipientName: validated.contactName,
            status: "outreach_email_sent",
            sentAt: nowIso,
            provider: emailResult.provider,
            messageId: emailResult.messageId || null,
          },
        } as any,
        undefined,
        user.uid
      );

      // Audit Log
      await AuditService.logEvent({
        entityId: company.id,
        entityType: "company",
        action: "outreach_email_sent",
        userId: user.uid,
        newValue: {
          activityId: activity.id,
          recipientEmail: validated.contactEmail,
          recipientName: validated.contactName,
          sentAt: nowIso,
        },
      });

      // Update Company rate limit & relationship tracker
      await companyRepo.update(
        company.id,
        {
          lastOutreachSentAt: nowIso,
          relationshipTracker: {
            ...company.relationshipTracker,
            lastEmailAt: nowIso,
            lastContactAt: nowIso,
          },
        },
        user.uid
      );

      // Increment daily email count tracking for Gmail 500 emails/day soft limit
      const todayDate = nowIso.split("T")[0];
      const isNewDay = settings.dailySentDate !== todayDate;
      const currentCount = isNewDay ? 0 : (settings.dailySentCount || 0);

      await OutreachSettingsService.updateSettings({
        dailySentCount: currentCount + 1,
        dailySentDate: todayDate,
      });

      return {
        success: true,
        activityId: activity.id,
        sentAt: nowIso,
        provider: emailResult.provider,
      };
    } catch (dbError: any) {
      console.error("Failed to record activity log after email send:", dbError);
      // Email was sent, so we still return success with warning
      return {
        success: true,
        sentAt: nowIso,
        warning: "Email sent successfully, but failed to update activity log.",
      };
    }
  }
}
