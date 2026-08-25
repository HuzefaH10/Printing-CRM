import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { WebAuthnService } from "@/features/auth/services/webauthn.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { authenticationResponse, userId } = body;

    if (!authenticationResponse || !userId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const hostHeader = req.headers.get("host") || "localhost";
    const rpID = hostHeader.split(":")[0];
    const origin = req.headers.get("origin") || `http://${hostHeader}`;

    // Get expected challenge
    const expectedChallenge = await WebAuthnService.getChallenge(userId);
    if (!expectedChallenge) {
      return NextResponse.json({ error: "Biometric challenge expired or invalid." }, { status: 400 });
    }

    // Get matching credential
    const userCreds = await WebAuthnService.getUserCredentials(userId);
    const credential = userCreds.find((c) => c.id === authenticationResponse.id);

    if (!credential) {
      return NextResponse.json({ error: "Matching biometric credential not found." }, { status: 400 });
    }

    // Decode stored base64url public key
    const publicKeyBuffer = Buffer.from(credential.publicKey, "base64url");

    const verification = await verifyAuthenticationResponse({
      response: authenticationResponse,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: credential.id,
        publicKey: new Uint8Array(publicKeyBuffer),
        counter: credential.counter,
        transports: credential.transports,
      },
    });

    if (verification.verified && verification.authenticationInfo) {
      // Update counter
      await WebAuthnService.updateCredentialCounter(
        userId,
        credential.id,
        verification.authenticationInfo.newCounter
      );

      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false, error: "Biometric assertion verification failed" }, { status: 400 });
  } catch (error: any) {
    console.error("WebAuthn authenticate verify error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to verify biometric assertion" },
      { status: 400 }
    );
  }
}
