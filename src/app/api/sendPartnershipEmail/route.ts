import { NextResponse } from "next/server";
import { OutreachService } from "@/features/companies/services/outreach.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Firebase HTTPS Callable sends data inside `{ data: { companyId, contactEmail, contactName, customMessage } }`
    const payload = body?.data ? body.data : body;
    const userRole = req.headers.get("x-user-role") || body?.userRole || "Owner"; // Default to Sales/Owner in app context
    const userId = req.headers.get("x-user-id") || body?.userId || "system_user";

    const result = await OutreachService.sendPartnershipEmail(payload, {
      uid: userId,
      role: userRole as any,
    });

    // Return Firebase Callable format `{ data: result }`
    return NextResponse.json({ data: result });
  } catch (error: any) {
    console.error("sendPartnershipEmail API error:", error);
    return NextResponse.json(
      {
        error: {
          message: error?.message || "Failed to send partnership email.",
          status: "INVALID_ARGUMENT",
        },
      },
      { status: 400 }
    );
  }
}
