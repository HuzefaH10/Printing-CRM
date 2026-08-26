import { Resend } from "resend";
import nodemailer from "nodemailer";
import { OutreachSettings } from "@/features/settings/models/outreach-settings";
import { SendEmailPayload, renderPartnershipEmailHtml } from "@/utils/email-template.utils";

export class EmailService {
  /**
   * Main send email execution using Gmail SMTP transport (or Resend API / standard Nodemailer SMTP fallback)
   */
  static async sendPartnershipEmail(payload: SendEmailPayload): Promise<{ success: boolean; messageId?: string; provider: string }> {
    const htmlContent = renderPartnershipEmailHtml(payload);
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
