import { OutreachService } from "@/features/companies/services/outreach.service";

export interface CallableContext {
  auth?: {
    uid: string;
    token?: {
      role?: string;
    };
  };
}

/**
 * Firebase Cloud Function: sendPartnershipEmail
 * Trigger: HTTPS Callable function
 */
export async function sendPartnershipEmailHandler(data: any, context: CallableContext) {
  const userId = context?.auth?.uid || "unauthenticated_user";
  const userRole = (context?.auth?.token?.role as any) || "Owner";

  return await OutreachService.sendPartnershipEmail(data, {
    uid: userId,
    role: userRole,
  });
}
