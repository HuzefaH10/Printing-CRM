import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";

export type { AuthenticatorTransportFuture };

export interface WebAuthnCredential {
  id: string; // Base64URL encoded credential ID
  publicKey: string; // Base64URL encoded public key
  counter: number;
  transports?: AuthenticatorTransportFuture[];
  deviceLabel: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface UserWebAuthnSession {
  currentChallenge?: string;
  updatedAt: string;
}
