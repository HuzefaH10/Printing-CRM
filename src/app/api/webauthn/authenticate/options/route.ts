import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { WebAuthnService } from "@/features/auth/services/webauthn.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = body?.userId || req.headers.get("x-user-id") || "default_user";

    const hostHeader = req.headers.get("host") || "localhost";
    const rpID = hostHeader.split(":")[0];

    const userCreds = await WebAuthnService.getUserCredentials(userId);
    if (userCreds.length === 0) {
      return NextResponse.json(
        { error: "No registered biometric credentials found for this user." },
        { status: 400 }
      );
    }

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: userCreds.map((cred) => ({
        id: cred.id,
        transports: cred.transports,
      })),
      userVerification: "preferred",
    });

    // Save challenge
    await WebAuthnService.saveChallenge(userId, options.challenge);

    return NextResponse.json({ options });
  } catch (error: any) {
    console.error("WebAuthn authenticate options error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate authentication options" },
      { status: 400 }
    );
  }
}
