"use client";

import { useState, useEffect, useCallback } from "react";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { useAuth } from "@/contexts/AuthContext";
import { WebAuthnService } from "../services/webauthn.service";
import { WebAuthnCredential } from "../models/webauthn";
import { toast } from "@/components/ui/toast";

export function useBiometricConfirm() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [userCredentials, setUserCredentials] = useState<WebAuthnCredential[]>([]);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState<boolean>(true);

  // Check WebAuthn platform support
  useEffect(() => {
    async function checkWebAuthnSupport() {
      if (typeof window !== "undefined" && window.PublicKeyCredential) {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setIsSupported(available);
        } catch (err) {
          setIsSupported(false);
        }
      } else {
        setIsSupported(false);
      }
    }
    checkWebAuthnSupport();
  }, []);

  // Fetch registered credentials for current user
  const refreshCredentials = useCallback(async () => {
    if (!user?.uid) {
      setUserCredentials([]);
      setIsLoadingCredentials(false);
      return;
    }

    setIsLoadingCredentials(true);
    try {
      const creds = await WebAuthnService.getUserCredentials(user.uid);
      setUserCredentials(creds);
    } catch (err) {
      console.warn("Failed to load user biometric credentials:", err);
    } finally {
      setIsLoadingCredentials(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    refreshCredentials();
  }, [refreshCredentials]);

  /**
   * Register a new WebAuthn biometric credential (Fingerprint / Windows Hello / Touch ID)
   */
  const registerBiometric = async (deviceLabel?: string): Promise<boolean> => {
    if (!user?.uid) {
      toast.add({ type: "error", title: "Authentication Required", description: "You must be signed in to register biometric security." });
      return false;
    }

    try {
      // 1. Get options from server
      const optRes = await fetch("/api/webauthn/register/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, userName: user.email }),
      });

      const optData = await optRes.json();
      if (!optRes.ok || !optData.options) {
        throw new Error(optData.error || "Failed to initiate biometric registration.");
      }

      // 2. Trigger browser native WebAuthn prompt (fingerprint / Windows Hello)
      const registrationResponse = await startRegistration({ optionsJSON: optData.options });

      // 3. Verify with server & save
      const verifyRes = await fetch("/api/webauthn/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationResponse,
          userId: user.uid,
          deviceLabel: deviceLabel || (navigator.platform ? `Device (${navigator.platform})` : "Biometric Sensor"),
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.verified) {
        throw new Error(verifyData.error || "Failed to verify biometric registration.");
      }

      toast.add({
        type: "success",
        title: "Biometric Registered!",
        description: "Fingerprint / Security key successfully bound to your account.",
      });

      await refreshCredentials();
      return true;
    } catch (err: any) {
      console.error("Biometric registration error:", err);
      const isCancelled = err?.name === "NotAllowedError" || err?.message?.includes("cancelled");
      toast.add({
        type: "error",
        title: isCancelled ? "Registration Cancelled" : "Biometric Registration Failed",
        description: isCancelled ? "Fingerprint scan was cancelled." : err?.message || "Could not register biometric device.",
      });
      return false;
    }
  };

  /**
   * Delete a registered biometric credential
   */
  const deleteBiometric = async (credentialId: string): Promise<boolean> => {
    if (!user?.uid) return false;
    try {
      await WebAuthnService.deleteCredential(user.uid, credentialId);
      toast.add({ type: "success", title: "Device Removed", description: "Biometric credential deleted." });
      await refreshCredentials();
      return true;
    } catch (err: any) {
      toast.add({ type: "error", title: "Error", description: "Failed to delete biometric credential." });
      return false;
    }
  };

  /**
   * Reusable confirmation method for gating sensitive CRM actions
   */
  const confirmWithBiometric = async (actionName: string = "Sensitive Action"): Promise<{ success: boolean; method: "webauthn" | "fallback" }> => {
    const hasCredentials = userCredentials.length > 0;

    // Fallback: If device has no biometric hardware OR user hasn't registered one, fall back to session confirmation
    if (!isSupported || !hasCredentials) {
      return { success: true, method: "fallback" };
    }

    try {
      // 1. Fetch authentication options
      const optRes = await fetch("/api/webauthn/authenticate/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.uid }),
      });

      const optData = await optRes.json();
      if (!optRes.ok || !optData.options) {
        throw new Error(optData.error || "Failed to initiate biometric challenge.");
      }

      // 2. Trigger browser WebAuthn fingerprint scan prompt
      const authenticationResponse = await startAuthentication({ optionsJSON: optData.options });

      // 3. Verify assertion with server
      const verifyRes = await fetch("/api/webauthn/authenticate/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authenticationResponse,
          userId: user?.uid,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.verified) {
        throw new Error(verifyData.error || "Biometric assertion verification failed.");
      }

      toast.add({
        type: "success",
        title: "Biometric Verified",
        description: `Fingerprint scan confirmed for ${actionName}.`,
      });

      return { success: true, method: "webauthn" };
    } catch (err: any) {
      console.error("Biometric confirmation failed:", err);
      const isCancelled = err?.name === "NotAllowedError" || err?.message?.includes("cancelled");
      toast.add({
        type: "error",
        title: "Biometric Verification Failed",
        description: isCancelled ? "Fingerprint verification scan was cancelled." : err?.message || "Biometric authentication failed.",
      });
      return { success: false, method: "webauthn" };
    }
  };

  return {
    isSupported,
    userCredentials,
    isLoadingCredentials,
    hasRegisteredCredentials: userCredentials.length > 0,
    registerBiometric,
    deleteBiometric,
    confirmWithBiometric,
  };
}
