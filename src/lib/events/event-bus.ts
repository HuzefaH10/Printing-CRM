export type AppEventType = 
  | "RECORD_CREATED"
  | "RECORD_UPDATED"
  | "RECORD_DELETED"
  | "FILE_UPLOADED"
  | "NOTIFICATION_CREATED"
  | "MODAL_OPENED"
  | "MODAL_CLOSED"
  | "THEME_CHANGED"
  | "COMPANY_ACTIVITY_LOGGED"
  | "COMPANY_ACTIVITY_COMPLETED";

export interface AppEvent<T = any> {
  type: AppEventType;
  payload: T;
  timestamp: number;
}

type EventHandler = (event: AppEvent) => void;

class EventBus {
  private listeners: Map<AppEventType, Set<EventHandler>> = new Map();

  /**
   * Subscribe to an event
   * @returns Unsubscribe function
   */
  subscribe<T = any>(type: AppEventType, handler: (event: AppEvent<T>) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    
    // Typecast handler to generic EventHandler to store it
    const genericHandler = handler as unknown as EventHandler;
    this.listeners.get(type)!.add(genericHandler);

    return () => {
      this.listeners.get(type)?.delete(genericHandler);
    };
  }

  /**
   * Publish an event to all subscribers
   */
  publish<T = any>(type: AppEventType, payload: T): void {
    const event: AppEvent<T> = {
      type,
      payload,
      timestamp: Date.now()
    };

    const handlers = this.listeners.get(type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${type}:`, error);
        }
      });
    }
  }

  /**
   * Clear all subscribers (useful for testing or full app resets)
   */
  clear(): void {
    this.listeners.clear();
  }
}

export const eventBus = new EventBus();
