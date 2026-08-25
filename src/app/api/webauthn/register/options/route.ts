import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { WebAuthnService } from "@/features/auth/services/webauthn.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = body?.userId || req.headers.get("x-user-id") || "default_user";
    const userName = body?.userName || req.headers.get("x-user-email") || "user@printingpress.com";

    // Extract hostname for RP ID (e.g. localhost or printco-c34e4.firebaseapp.com)
    const hostHeader = req.headers.get("host") || "localhost";
    const rpID = hostHeader.split(":")[0];

    // Fetch existing user credentials so authenticator excludes them
    const existingCreds = await WebAuthnService.getUserCredentials(userId);

    const options = await generateRegistrationOptions({
      rpName: "Printing CRM Biometric Security",
      rpID,
      userID: new TextEncoder().encode(userId),
      userName,
      attestationType: "none",
      excludeCredentials: existingCreds.map((cred) => ({
        id: cred.id,
        transports: cred.transports,
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    });

    // Save challenge to Firestore for verification step
    await WebAuthnService.saveChallenge(userId, options.challenge);

    return NextResponse.json({ options });
  } catch (error: any) {
    console.error("WebAuthn register options error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate registration options" },
      { status: 400 }
    );
  }
}
