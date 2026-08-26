import { OutreachSettings } from "@/features/settings/models/outreach-settings";

export interface SendEmailPayload {
  to: string;
  recipientName: string;
  subject: string;
  body: string;
  signature: string;
  settings: OutreachSettings;
}

/**
 * Render structured HTML email for printing press partnership outreach
 */
export function renderPartnershipEmailHtml(payload: SendEmailPayload): string {
  const formattedBody = payload.body.replace(/\n/g, "<br/>");
  const formattedSignature = payload.signature.replace(/\n/g, "<br/>");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0f172a; color: #ffffff; padding: 24px; text-align: left; }
    .header h2 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.02em; }
    .header p { margin: 4px 0 0 0; font-size: 13px; color: #94a3b8; }
    .content { padding: 28px 24px; font-size: 15px; color: #334155; }
    .highlight-box { background: #f1f5f9; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 4px; }
    .highlight-title { font-weight: 600; color: #0f172a; margin-bottom: 6px; font-size: 14px; }
    .highlight-list { margin: 0; padding-left: 20px; font-size: 13px; color: #475569; }
    .cta-container { margin: 28px 0 20px 0; text-align: left; }
    .cta-button { background-color: #2563eb; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block; }
    .footer { border-top: 1px solid #e2e8f0; padding: 20px 24px; background: #fafafa; font-size: 13px; color: #64748b; }
    .signature { margin-top: 16px; font-size: 13px; color: #475569; line-height: 1.5; border-left: 2px solid #cbd5e1; padding-left: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>${payload.settings.companyPressName || "Printing Press Partnerships"}</h2>
      <p>Commercial Offset & High-Speed Digital Production Capabilities</p>
    </div>
    <div class="content">
      <div>${formattedBody}</div>

      <div class="highlight-box">
        <div class="highlight-title">Our Production Highlights & Capabilities:</div>
        <ul class="highlight-list">
          <li><strong>Commercial Offset Printing:</strong> High-volume catalogs, corporate brochures, and publications with precise color fidelity.</li>
          <li><strong>RISO 9050 Digital Duplicator:</strong> Ultra-fast 150ppm duplex digital duplicator for rapid, economical volume runs.</li>
          <li><strong>Full In-House Finishing:</strong> Die-cutting, foil stamping, spot UV, perfect binding, and custom packaging assembly.</li>
        </ul>
      </div>

      <div class="cta-container">
        <a href="mailto:${payload.settings.senderEmail}?subject=Re: ${encodeURIComponent(payload.subject)}" class="cta-button">Reply to Discuss Partnership</a>
      </div>
    </div>
    <div class="footer">
      <div>Sent by ${payload.settings.senderName} (${payload.settings.senderEmail})</div>
      <div class="signature">
        ${formattedSignature}
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
