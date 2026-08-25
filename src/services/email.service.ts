import { Resend } from "resend";
import nodemailer from "nodemailer";
import { OutreachSettings } from "@/features/settings/models/outreach-settings";

export interface SendEmailPayload {
  to: string;
  recipientName: string;
  subject: string;
  body: string;
  signature: string;
  settings: OutreachSettings;
}

export class EmailService {
  /**
   * Render structured HTML email for printing press partnership outreach
   */
  static renderPartnershipEmailHtml(payload: SendEmailPayload): string {
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

  /**
   * Main send email execution using Gmail SMTP transport (or Resend API / standard Nodemailer SMTP fallback)
   */
  static async sendPartnershipEmail(payload: SendEmailPayload): Promise<{ success: boolean; messageId?: string; provider: string }> {
    const htmlContent = this.renderPartnershipEmailHtml(payload);
    const textContent = `${payload.body}\n\n---\n${payload.signature}`;

    // Priority 1: Gmail SMTP via Nodemailer
    const gmailUser = process.env.GMAIL_USER || payload.settings.gmailUser;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD || payload.settings.gmailAppPassword;

    if (gmailUser && gmailAppPassword) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: gmailUser,
            pass: gmailAppPassword,
          },
        });

        const info = await transporter.sendMail({
          from: `"${payload.settings.senderName}" <${gmailUser}>`,
          to: payload.to,
          subject: payload.subject,
          text: textContent,
          html: htmlContent,
          replyTo: payload.settings.senderEmail || gmailUser,
        });

        return { success: true, messageId: info.messageId, provider: "gmail-smtp" };
      } catch (err: any) {
        console.warn("Gmail SMTP delivery failed, trying secondary providers:", err);
      }
    }

    // Priority 2: Resend SDK
    const resendApiKey = payload.settings.resendApiKey || process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const fromEmail = payload.settings.senderEmail.includes("@") && !payload.settings.senderEmail.includes("@printingpress.com")
          ? payload.settings.senderEmail
          : "onboarding@resend.dev";

        const { data, error } = await resend.emails.send({
          from: `${payload.settings.senderName} <${fromEmail}>`,
          to: [payload.to],
          subject: payload.subject,
          html: htmlContent,
          text: textContent,
          replyTo: payload.settings.senderEmail,
        });

        if (error) {
          console.warn("Resend API returned error, attempting fallback:", error);
        } else if (data?.id) {
          return { success: true, messageId: data.id, provider: "resend" };
        }
      } catch (err) {
        console.warn("Resend SDK throw, falling back to custom SMTP:", err);
      }
    }

    // Priority 3: Custom Nodemailer SMTP / Ethereal Test Transport
    try {
      let transporter: nodemailer.Transporter;

      if (payload.settings.smtpHost && payload.settings.smtpUser) {
        transporter = nodemailer.createTransport({
          host: payload.settings.smtpHost,
          port: payload.settings.smtpPort || 587,
          secure: payload.settings.smtpPort === 465,
          auth: {
            user: payload.settings.smtpUser,
            pass: payload.settings.smtpPass,
          },
        });
      } else if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      } else {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      }

      const info = await transporter.sendMail({
        from: `"${payload.settings.senderName}" <${payload.settings.senderEmail}>`,
        to: payload.to,
        subject: payload.subject,
        text: textContent,
        html: htmlContent,
      });

      return { success: true, messageId: info.messageId, provider: "nodemailer" };
    } catch (err: any) {
      console.error("Nodemailer SMTP failed:", err);
      throw new Error(`Email delivery failed: ${err?.message || "Unable to send email via configured provider."}`);
    }
  }
}
