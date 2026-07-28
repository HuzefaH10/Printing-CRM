import { BaseRepository } from "@/lib/repository/base.repository";
import { BaseModel } from "@/types/repository";
import { eventBus } from "@/lib/events/event-bus";

export type NotificationType = "success" | "warning" | "error" | "info" | "reminder" | "activity" | "assignment";

export interface AppNotification extends BaseModel {
  userId: string;       // The recipient of the notification
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;        // Optional URL to navigate when clicked
  entityId?: string;    // Related entity
  entityType?: string;
}

class NotificationRepository extends BaseRepository<AppNotification> {
  constructor() {
    super("_notifications");
  }
}

const notificationRepo = new NotificationRepository();

export class NotificationService {
  /**
   * Create a new notification for a specific user
   */
  static async create(params: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
    entityId?: string;
    entityType?: string;
  }): Promise<AppNotification> {
    const payload = {
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || "info",
      read: false,
      link: params.link || undefined,
      entityId: params.entityId || undefined,
      entityType: params.entityType || undefined,
    };

    try {
      const notification = await notificationRepo.create(payload);
      
      // Fire an event so the UI can pop up a toast or update a badge counter
      eventBus.publish("NOTIFICATION_CREATED", notification);
      
      return notification;
    } catch (error) {
      console.error("Failed to create notification:", error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    await notificationRepo.update(notificationId, { read: true });
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    // In a real production scenario, doing this on the client requires loading all unread and batch updating.
    // Or prefer a Cloud Function for bulk operations.
    const { data: unreads } = await notificationRepo.list([
      { field: "userId", operator: "==", value: userId },
      { field: "read", operator: "==", value: false }
    ], { limit: 100 }); // Reasonable cap for client-side batch

    if (unreads.length === 0) return;

    const updates = unreads.map(n => ({
      id: n.id,
      data: { read: true }
    }));

    await notificationRepo.batchWrite([], updates, [], userId);
  }

  /**
   * Listen to real-time notifications for a user
   */
  static subscribeToUserNotifications(userId: string, onUpdate: (notifications: AppNotification[]) => void) {
    return notificationRepo.subscribe(
      [{ field: "userId", operator: "==", value: userId }],
      { orderBy: "createdAt", orderDirection: "desc", limit: 50 },
      onUpdate
    );
  }
}
