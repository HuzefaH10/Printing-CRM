export interface OutreachSettings {
  senderName: string;
  senderEmail: string;
  phoneNumber: string;
  companyPressName: string;
  defaultPitchTemplate: string;
  defaultSignature: string;
  gmailUser?: string;
  gmailAppPassword?: string;
  resendApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  dailySentCount?: number;
  dailySentDate?: string;
}

export const DEFAULT_OUTREACH_SETTINGS: OutreachSettings = {
  senderName: "Huzefa Hasani",
  senderEmail: "outreach@printingpress.com",
  phoneNumber: "+965 9900 1234",
  companyPressName: "PrintCo Offset & Digital Press",
  defaultPitchTemplate: `Dear {contactName},

I am reaching out from {companyPressName} to explore potential commercial printing partnership opportunities with {companyName}.

We specialize in high-capacity Commercial Offset Printing for high-volume catalogs, corporate brochures, and publications, alongside our high-speed RISO 9050 Digital Duplicator capability designed for ultra-fast, cost-effective duplex printing and distribution.

We would welcome the opportunity to discuss how our printing services and competitive pricing can add value to your upcoming production requirements.

Best regards,`,
  defaultSignature: `Huzefa Hasani
Head of Corporate Partnerships & Sales
PrintCo Offset & Digital Press
Direct: +965 9900 1234
Email: outreach@printingpress.com
Web: https://printco-press.com`,
  gmailUser: "",
  gmailAppPassword: "",
  resendApiKey: "",
  dailySentCount: 0,
  dailySentDate: new Date().toISOString().split("T")[0],
};
