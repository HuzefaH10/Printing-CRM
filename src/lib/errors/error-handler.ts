/**
 * Centralized Error Handling Framework
 */

export class AppError extends Error {
  public code: string;
  public details?: any;
  public isRecoverable: boolean;

  constructor(message: string, code: string, isRecoverable = true, details?: any) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.isRecoverable = isRecoverable;
    this.details = details;
  }
}

export class ErrorHandler {
  /**
   * Log an error to external tracking services (e.g., Sentry, LogRocket)
   * For now, outputs a structured console error.
   */
  static logError(error: Error | AppError | unknown, context?: Record<string, any>) {
    console.error("[AppError] Captured:", error, "Context:", context);
    
    // Future: Send to Sentry, etc.
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error, { extra: context });
    // }
  }

  /**
   * Parse unknown errors into user-friendly messages
   */
  static getFriendlyMessage(error: unknown): string {
    if (error instanceof AppError) {
      return error.message;
    }
    
    if (error instanceof Error) {
      // Handle known Firebase errors
      if (error.message.includes("permission-denied")) {
        return "You do not have permission to perform this action.";
      }
      if (error.message.includes("offline")) {
        return "You appear to be offline. Please check your connection.";
      }
      return error.message;
    }
    
    return "An unexpected error occurred. Please try again.";
  }
}
