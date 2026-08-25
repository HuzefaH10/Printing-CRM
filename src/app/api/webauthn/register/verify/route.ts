import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { WebAuthnService } from "@/features/auth/services/webauthn.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { registrationResponse, userId, deviceLabel } = body;

    if (!registrationResponse || !userId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const hostHeader = req.headers.get("host") || "localhost";
    const rpID = hostHeader.split(":")[0];
    const origin = req.headers.get("origin") || `http://${hostHeader}`;

    // Get active challenge
    const expectedChallenge = await WebAuthnService.getChallenge(userId);
    if (!expectedChallenge) {
      return NextResponse.json({ error: "Challenge expired or invalid. Please try registering again." }, { status: 400 });
    }

    const verification = await verifyRegistrationResponse({
      response: registrationResponse,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credential } = verification.registrationInfo;

      // Save credential to Firestore under user's profile
      await WebAuthnService.saveCredential(userId, {
        id: credential.id,
        publicKey: Buffer.from(credential.publicKey).toString("base64url"),
        counter: credential.counter,
        transports: registrationResponse.response.transports || [],
        deviceLabel: deviceLabel || "Fingerprint / Biometric Device",
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false, error: "Verification failed" }, { status: 400 });
  } catch (error: any) {
    console.error("WebAuthn register verify error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to verify registration response" },
      { status: 400 }
    );
  }
}
