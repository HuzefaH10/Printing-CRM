import { collection, doc, getDocs, setDoc, updateDoc, query, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { EmailTemplate, EmailTemplateSector } from "../models/email-template";

const COLLECTION_NAME = "email_templates";

export class EmailTemplateService {
  static async getAllTemplates(): Promise<EmailTemplate[]> {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmailTemplate));
  }

  static async updateTemplate(id: string, data: Partial<EmailTemplate>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  static async seedTemplatesIfNeeded(): Promise<void> {
    const existing = await this.getAllTemplates();
    if (existing.length > 0) return; // Already seeded

    const SEED_DATA: Omit<EmailTemplate, "id" | "createdAt" | "updatedAt">[] = [
      {
        sectorTag: "Publishing",
        subject: "Partnership Opportunity: Premium Book & Editorial Printing for {{companyName}}",
        bodyTemplate: "Hi {{contactName}},\n\nI hope this email finds you well.\n\nI'm reaching out from {{companyLogoOrName}} because we specialize in high-quality commercial offset printing tailored specifically for publishers and editorial houses like {{companyName}}.\n\nWe offer a wide range of binding options (perfect, hardcover, saddle-stitch), premium paper stocks, and rapid turnaround times for both small and large print runs to ensure your titles hit the shelves on time. Our specialized RISO 9050 digital duplicators also allow us to handle rapid, cost-effective short runs.\n\nI'd love to schedule a quick call to discuss your upcoming catalog and how we can support your production workflow. Are you available for a brief chat next Tuesday?\n\nBest regards,\n\n{{senderName}}\n{{senderPhone}}\n{{senderEmail}}\n{{companyLogoOrName}}",
        isActive: true,
      },
      {
        sectorTag: "Education",
        subject: "Streamlining Printing for {{companyName}}'s Academic Needs",
        bodyTemplate: "Dear {{contactName}},\n\nAs the {{decisionMakerRole}} at {{companyName}}, ensuring that your students and faculty have access to high-quality printed materials on time is critical.\n\nAt {{companyLogoOrName}}, we partner with educational institutions to handle everything from course materials and secure exam paper printing to premium prospectuses and brochures. We offer bulk pricing tailored for academic cycles and strict quality control to ensure every material reflects the prestige of {{companyName}}.\n\nCould we arrange a brief meeting to discuss your printing requirements for the upcoming term? I'm confident we can offer competitive rates without compromising on quality.\n\nKind regards,\n\n{{senderName}}\n{{senderPhone}}\n{{senderEmail}}\n{{companyLogoOrName}}",
        isActive: true,
      },
      {
        sectorTag: "Government",
        subject: "Vendor Registration & Printing Services for {{companyName}}",
        bodyTemplate: "Dear {{contactName}},\n\nI am writing to you on behalf of {{companyLogoOrName}} to introduce our comprehensive commercial printing capabilities.\n\nWe understand that {{companyName}} requires strict compliance, absolute confidentiality, and reliable delivery. We are fully equipped to handle large-scale government tenders, official documentation, and public-facing informational campaigns. Our facility operates with both high-capacity commercial offset presses and rapid digital duplicators to meet any scale or timeline.\n\nWe would appreciate the opportunity to register as an approved vendor for {{companyName}} and discuss how we can reliably fulfill your future printing tenders.\n\nSincerely,\n\n{{senderName}}\n{{senderPhone}}\n{{senderEmail}}\n{{companyLogoOrName}}",
        isActive: true,
      },
      {
        sectorTag: "Corporate",
        subject: "Elevating {{companyName}}'s Corporate Branding & Print Collateral",
        bodyTemplate: "Hi {{contactName}},\n\nMaintaining a sharp, consistent brand image is crucial for {{companyName}}.\n\nAt {{companyLogoOrName}}, we specialize in producing premium corporate collateral—from business cards and letterheads to high-end marketing brochures and annual reports. Our commercial offset capabilities guarantee perfect color matching for your brand, while our rapid digital presses handle quick-turnaround internal materials.\n\nI would love to send over some samples of our recent corporate work, or schedule a quick call to discuss how we can become your reliable print partner.\n\nBest,\n\n{{senderName}}\n{{senderPhone}}\n{{senderEmail}}\n{{companyLogoOrName}}",
        isActive: true,
      },
      {
        sectorTag: "Healthcare",
        subject: "Reliable Printing Solutions for {{companyName}}",
        bodyTemplate: "Dear {{contactName}},\n\nIn the healthcare sector, precision and reliability are paramount. \n\n{{companyLogoOrName}} provides comprehensive printing services tailored for medical institutions like {{companyName}}. Whether you need patient intake forms, informational booklets, prescription pads, or compliance-sensitive materials, we ensure accurate reproduction and reliable delivery schedules to keep your operations running smoothly.\n\nI'd welcome the chance to discuss your current print procurement process and how we can offer streamlined, cost-effective solutions for your facilities.\n\nBest regards,\n\n{{senderName}}\n{{senderPhone}}\n{{senderEmail}}\n{{companyLogoOrName}}",
        isActive: true,
      },
      {
        sectorTag: "NGO",
        subject: "Cost-Effective Print Partnerships for {{companyName}}",
        bodyTemplate: "Hi {{contactName}},\n\nI'm reaching out because I greatly admire the work {{companyName}} is doing in the community.\n\nAt {{companyLogoOrName}}, we frequently partner with non-profits, religious institutions, and cultural organizations to help them maximize their impact while staying within budget. We provide high-quality, cost-effective printing for event flyers, informational brochures, newsletters, and donation drives.\n\nOur RISO 9050 digital duplicators are particularly effective for rapidly producing high-volume community materials at a fraction of standard costs.\n\nI'd love to connect and see how we can support your next campaign.\n\nWarmly,\n\n{{senderName}}\n{{senderPhone}}\n{{senderEmail}}\n{{companyLogoOrName}}",
        isActive: true,
      },
      {
        sectorTag: "Retail",
        subject: "High-Impact Retail Printing & Packaging for {{companyName}}",
        bodyTemplate: "Hi {{contactName}},\n\nIn retail and hospitality, the physical materials your customers interact with define their experience.\n\nAt {{companyLogoOrName}}, we help brands like {{companyName}} stand out. We specialize in vibrant, high-quality printing for promotional materials, point-of-sale displays, premium menus, and custom packaging. Our offset printing guarantees that your brand colors pop, helping you drive sales and customer engagement.\n\nDo you have a few minutes next week to discuss your upcoming seasonal campaigns and how we can provide the print collateral to support them?\n\nCheers,\n\n{{senderName}}\n{{senderPhone}}\n{{senderEmail}}\n{{companyLogoOrName}}",
        isActive: true,
      },
      {
        sectorTag: "Generic",
        subject: "Partnership Opportunity — {{companyLogoOrName}}",
        bodyTemplate: "Hi {{contactName}},\n\nI hope you're having a great week.\n\nI'm reaching out from {{companyLogoOrName}} to introduce our commercial printing services. We help companies like {{companyName}} streamline their print procurement by offering high-quality offset printing for large runs, alongside rapid RISO 9050 digital duplication for quick, cost-effective jobs.\n\nWhether you need marketing collateral, operational forms, or specialized custom prints, we pride ourselves on exceptional quality and reliable delivery.\n\nI would love to connect briefly to learn more about your print needs and see if we'd be a good fit as a vendor.\n\nBest regards,\n\n{{senderName}}\n{{senderPhone}}\n{{senderEmail}}\n{{companyLogoOrName}}",
        isActive: true,
      }
    ];

    const batchPromises = SEED_DATA.map(template => {
      const docRef = doc(collection(db, COLLECTION_NAME));
      return setDoc(docRef, {
        ...template,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    await Promise.all(batchPromises);
  }

  static getBestMatchTemplate(industry: string, templates: EmailTemplate[]): EmailTemplate | null {
    if (!templates.length) return null;
    
    const activeTemplates = templates.filter(t => t.isActive);
    if (!activeTemplates.length) return null;

    const ind = (industry || "").toLowerCase();
    
    // 1. Exact or close tag match
    let match = activeTemplates.find(t => ind.includes(t.sectorTag.toLowerCase()));
    
    // 2. Keyword matching
    if (!match) {
      if (ind.includes("school") || ind.includes("university") || ind.includes("college") || ind.includes("academy")) {
        match = activeTemplates.find(t => t.sectorTag === "Education");
      } else if (ind.includes("ministry") || ind.includes("public sector") || ind.includes("municipality")) {
        match = activeTemplates.find(t => t.sectorTag === "Government");
      } else if (ind.includes("agency") || ind.includes("bank") || ind.includes("finance") || ind.includes("corporate")) {
        match = activeTemplates.find(t => t.sectorTag === "Corporate");
      } else if (ind.includes("hospital") || ind.includes("clinic") || ind.includes("medical") || ind.includes("pharma")) {
        match = activeTemplates.find(t => t.sectorTag === "Healthcare");
      } else if (ind.includes("charity") || ind.includes("church") || ind.includes("mosque") || ind.includes("museum")) {
        match = activeTemplates.find(t => t.sectorTag === "NGO");
      } else if (ind.includes("restaurant") || ind.includes("hotel") || ind.includes("shop") || ind.includes("store")) {
        match = activeTemplates.find(t => t.sectorTag === "Retail");
      } else if (ind.includes("book") || ind.includes("press") || ind.includes("magazine") || ind.includes("author")) {
        match = activeTemplates.find(t => t.sectorTag === "Publishing");
      }
    }

    // 3. Fallback
    if (!match) {
      match = activeTemplates.find(t => t.sectorTag === "Generic");
    }
    
    // Ultimate fallback if "Generic" is inactive
    return match || activeTemplates[0];
  }

  static parseTemplate(template: string, data: Record<string, string>): string {
    let parsed = template;
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      parsed = parsed.replace(regex, value || "");
    }
    return parsed;
  }
}
