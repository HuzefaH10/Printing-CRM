"use client";

import { useBiometricConfirm } from "./useBiometricConfirm";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/toast";
import { BiometricAuditService } from "@/services/biometric-audit.service";

export function useBiometricGate() {
  const { confirmWithBiometric } = useBiometricConfirm();
  const { user } = useAuth();

  /**
   * Wraps an action function with a biometric gate.
   * Execution is paused until the user passes biometric verification.
   * If verification fails or is cancelled, execution is blocked.
   * 
   * @param actionFn The function to execute upon successful verification
   * @param actionType Description of the action (for audit log and prompt)
   * @returns A wrapped function that returns a Promise
   */
  const withBiometricGate = <TArgs extends any[], TReturn>(
    actionFn: (...args: TArgs) => Promise<TReturn> | TReturn,
    actionType: string
  ) => {
    return async (...args: TArgs): Promise<TReturn | undefined> => {
      // Trigger WebAuthn confirmation
      const res = await confirmWithBiometric(actionType);
      
      if (res.success) {
        // Log to global biometric audit trail (if not a fallback)
        // We log it regardless of fallback as long as it passed the security gate
        if (user?.uid) {
          await BiometricAuditService.logEvent({
            action: actionType,
            userId: user.uid,
            verified: true,
          });
        }
        
        // Execute the original action
        return actionFn(...args);
      } else {
        // Block execution
        toast.add({
          type: "error",
          title: "Biometric Verification Required",
          description: "This action was blocked because biometric verification failed or was cancelled.",
        });
        return undefined;
      }
    };
  };

  return { withBiometricGate };
}
