import { activityRepo } from "./activity.repository";
import { Activity } from "../models/activity";
import { AuditService } from "@/services/audit.service";
import { eventBus } from "@/lib/events/event-bus";
import { CreatePayload } from "@/types/repository";

export class ActivityService {
  static async createActivity(data: CreatePayload<Activity>, userId: string): Promise<Activity> {
    const activity = await activityRepo.create({
      ...data,
      status: data.status || "PENDING",
      priority: data.priority || "MEDIUM",
    } as any, undefined, userId);

    await AuditService.logEvent({
      entityId: activity.id,
      entityType: "activity",
      action: "CREATED",
      userId,
      newValue: activity as unknown as Record<string, any>
    });

    if (activity.relatedCompanyId) {
      eventBus.publish("COMPANY_ACTIVITY_LOGGED", {
        companyId: activity.relatedCompanyId,
        activityType: activity.type
      });
    }

    return activity;
  }

  static async completeActivity(activityId: string, userId: string, notes?: string): Promise<void> {
    const activity = await activityRepo.get(activityId);
    if (!activity) throw new Error("Activity not found");

    const updates: Partial<Activity> = {
      status: "COMPLETED",
      completedAt: new Date().toISOString()
    };

    if (notes) {
      updates.detailedNotes = activity.detailedNotes ? `${activity.detailedNotes}\n\nCompletion Notes:\n${notes}` : notes;
    }

    await activityRepo.update(activityId, updates, userId);

    await AuditService.logEvent({
      entityId: activityId,
      entityType: "activity",
      action: "UPDATED",
      userId,
      reason: "Marked as completed"
    });

    if (activity.relatedCompanyId) {
      eventBus.publish("COMPANY_ACTIVITY_COMPLETED", {
        companyId: activity.relatedCompanyId,
        activityType: activity.type
      });
    }
  }
}
