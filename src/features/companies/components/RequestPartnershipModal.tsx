"use client";

import React, { useEffect, useState } from "react";
import { Company } from "../models/company";
import { Contact } from "@/features/contacts/models/contact";
import { ContactService } from "@/features/contacts/services/contact.service";
import { OutreachSettingsService } from "@/features/settings/services/outreach-settings.service";
import { OutreachSettings, DEFAULT_OUTREACH_SETTINGS } from "@/features/settings/models/outreach-settings";
import { EmailTemplateService } from "@/features/settings/services/email-template.service";
import { EmailTemplate } from "@/features/settings/models/email-template";
import { renderPartnershipEmailHtml } from "@/utils/email-template.utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { Loader2, Sparkles, X, Eye, Edit3, Send, AlertCircle, Mail } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface RequestPartnershipModalProps {
  company: Company;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RequestPartnershipModal({
  company,
  isOpen,
  onClose,
  onSuccess,
}: RequestPartnershipModalProps) {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  
  const [recipientEmail, setRecipientEmail] = useState<string>("");
  const [contactName, setContactName] = useState<string>("");
  const [contactRole, setContactRole] = useState<string>("");
  
  const [subjectLine, setSubjectLine] = useState<string>("");
  const [customMessage, setCustomMessage] = useState<string>("");
  
  const [settings, setSettings] = useState<OutreachSettings>(DEFAULT_OUTREACH_SETTINGS);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [isEdited, setIsEdited] = useState(false);
  
  const [isSending, setIsSending] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; name?: string; message?: string }>({});

  const applyTemplate = (template: EmailTemplate, data: Record<string, string>) => {
    setSubjectLine(EmailTemplateService.parseTemplate(template.subject, data));
    setCustomMessage(EmailTemplateService.parseTemplate(template.bodyTemplate, data));
    setIsEdited(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    async function initModalData() {
      // 1. Fetch settings and templates
      const [loadedSettings, loadedTemplates] = await Promise.all([
        OutreachSettingsService.getSettings(),
        EmailTemplateService.getAllTemplates()
      ]);
      setSettings(loadedSettings);
      setTemplates(loadedTemplates);

      // 2. Fetch contacts
      let initialContactName = company.name || "Valued Business Partner";
      let initialEmail = company.email || "";
      let initialRole = "Procurement Manager";
      
      try {
        const companyContacts = await ContactService.getContactsByCompanyId(company.id);
        setContacts(companyContacts);

        if (companyContacts.length > 0) {
          const primary = companyContacts[0];
          setSelectedContactId(primary.id);
          initialEmail = primary.email || company.email || "";
          initialContactName = `${primary.firstName} ${primary.lastName}`.trim();
          initialRole = primary.jobTitle || "Procurement Manager";
        }
      } catch (err) {
        // Fallbacks already set
      }

      setRecipientEmail(initialEmail);
      setContactName(initialContactName);
      setContactRole(initialRole);

      // 3. Auto-select template
      const bestMatch = EmailTemplateService.getBestMatchTemplate(company.industry, loadedTemplates);
      if (bestMatch) {
        setSelectedTemplateId(bestMatch.id);
        applyTemplate(bestMatch, {
          companyName: company.name,
          contactName: initialContactName,
          decisionMakerRole: initialRole,
          senderName: loadedSettings.senderName,
          senderPhone: loadedSettings.phoneNumber,
          senderEmail: loadedSettings.senderEmail,
          companyLogoOrName: loadedSettings.companyPressName,
        });
      }
      setErrors({});
      setIsEdited(false);
    }

    initModalData();
  }, [isOpen, company]);

  const handleTemplateChange = (templateId: string | null) => {
    if (!templateId) return;
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    if (isEdited) {
      if (!confirm("You have manually edited the email body. Switching templates will overwrite your changes. Continue?")) {
        return; // Revert selection conceptually, but Select component already updated visually.
      }
    }

    setSelectedTemplateId(template.id);
    applyTemplate(template, {
      companyName: company.name,
      contactName,
      decisionMakerRole: contactRole,
      senderName: settings.senderName,
      senderPhone: settings.phoneNumber,
      senderEmail: settings.senderEmail,
      companyLogoOrName: settings.companyPressName,
    });
  };

  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId);
    if (contactId === "custom") return;

    const contact = contacts.find((c) => c.id === contactId);
    if (contact) {
      const email = contact.email || "";
      const fullName = `${contact.firstName} ${contact.lastName}`.trim();
      const role = contact.jobTitle || "Procurement Manager";
      
      setRecipientEmail(email);
      setContactName(fullName);
      setContactRole(role);

      // Re-apply current template
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template && !isEdited) {
        applyTemplate(template, {
          companyName: company.name,
          contactName: fullName,
          decisionMakerRole: role,
          senderName: settings.senderName,
          senderPhone: settings.phoneNumber,
          senderEmail: settings.senderEmail,
          companyLogoOrName: settings.companyPressName,
        });
      }
    }
  };

  const handleBodyEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomMessage(e.target.value);
    setIsEdited(true);
  };
  
  const handleSubjectEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubjectLine(e.target.value);
    setIsEdited(true);
  };

  const validate = (): boolean => {
    const errs: { email?: string; name?: string; message?: string } = {};

    if (!recipientEmail || !/^\S+@\S+\.\S+$/.test(recipientEmail)) {
      errs.email = "A valid recipient email address is required.";
    }
    if (!contactName.trim()) {
      errs.name = "Contact name is required.";
    }
    if (!customMessage || customMessage.trim().length < 20) {
      errs.message = "Message body must be at least 20 characters long.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSend = async () => {
    if (!validate()) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/sendPartnershipEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": profile?.uid || "system",
          "x-user-role": profile?.role || "Sales",
        },
        body: JSON.stringify({
          companyId: company.id,
          contactEmail: recipientEmail.trim(),
          contactName: contactName.trim(),
          subject: subjectLine.trim(),
          customMessage: customMessage.trim(),
        }),
      });

      const resData = await response.json();

      if (!response.ok || resData.error) {
        throw new Error(resData.error?.message || "Failed to dispatch email.");
      }

      toast.add({
        type: "success",
        title: "Partnership Request Sent!",
        description: `Email sent to ${recipientEmail} for ${company.name}.`,
      });

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Failed to send partnership email:", err);
      toast.add({
        type: "error",
        title: "Send Failed",
        description: err?.message || "Could not send partnership email. Your message contents remain intact.",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">Request Partnership</h2>
              <p className="text-xs text-muted-foreground">Outreach to {company.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === "edit" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Message
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === "preview" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Live Preview
              </button>
            </div>

            <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === "edit" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column: Recipient & Template Config */}
              <div className="md:col-span-1 space-y-5">
                <div className="space-y-3 bg-muted/20 p-4 rounded-xl border">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Recipient Details
                  </h3>
                  
                  {contacts.length > 0 && (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Select Contact</Label>
                      <select
                        value={selectedContactId}
                        onChange={(e) => handleContactSelect(e.target.value)}
                        className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        {contacts.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.firstName} {c.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Name <span className="text-destructive">*</span></Label>
                    <Input className="h-8 text-xs" value={contactName} onChange={(e) => setContactName(e.target.value)} />
                    {errors.name && <p className="text-[10px] text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Email <span className="text-destructive">*</span></Label>
                    <Input className="h-8 text-xs" type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
                    {errors.email && <p className="text-[10px] text-destructive">{errors.email}</p>}
                  </div>
                </div>

                <div className="space-y-3 bg-primary/5 p-4 rounded-xl border border-primary/10">
                  <h3 className="text-sm font-semibold text-primary">Template Override</h3>
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Select Template</Label>
                    <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                      <SelectTrigger className="h-8 text-xs bg-background">
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(t => (
                          <SelectItem key={t.id} value={t.id}>
                            {selectedTemplateId === t.id && !isEdited ? "Auto-selected: " : ""}{t.sectorTag}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="text-[10px] text-muted-foreground flex items-start gap-1">
                    <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                    <p>Templates are auto-selected based on the company's industry ({company.industry || "None"}). Changing this will overwrite your message.</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Email Editor */}
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Subject Line</Label>
                  <Input 
                    value={subjectLine} 
                    onChange={handleSubjectEdit}
                    className="font-medium bg-muted/10 border-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">Email Pitch Body <span className="text-destructive">*</span></Label>
                    {isEdited && <Badge variant="secondary" className="text-[10px] h-5">Edited</Badge>}
                  </div>
                  <textarea
                    rows={12}
                    value={customMessage}
                    onChange={handleBodyEdit}
                    className="w-full rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring font-sans leading-relaxed"
                  />
                  {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                </div>
                
                <div className="bg-muted/20 border border-dashed rounded-lg p-3 text-xs space-y-1">
                  <span className="font-semibold text-muted-foreground block mb-1">Attached Signature Block:</span>
                  <pre className="font-sans text-muted-foreground whitespace-pre-wrap">{settings.defaultSignature}</pre>
                </div>
              </div>
            </div>
          ) : (
            /* Live Email Preview */
            <div className="border rounded-xl bg-card overflow-hidden shadow-sm max-w-2xl mx-auto">
              <div className="bg-slate-950 text-white p-4">
                <div className="text-xs text-slate-400 mb-1">TO: {recipientEmail || "(No recipient specified)"}</div>
                <div className="text-xs text-slate-400 mb-2">FROM: {settings.senderName} &lt;{settings.senderEmail}&gt;</div>
                <div className="font-semibold text-base text-white">{subjectLine}</div>
              </div>
              <div
                className="p-6 text-sm text-slate-800 space-y-4 bg-white"
                dangerouslySetInnerHTML={{
                  __html: renderPartnershipEmailHtml({
                    to: recipientEmail,
                    recipientName: contactName,
                    subject: subjectLine,
                    body: customMessage,
                    signature: settings.defaultSignature,
                    settings,
                  }),
                }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
          <div className="text-xs text-muted-foreground">
            {isEdited ? "Manual edits applied" : "Using selected template"}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} disabled={isSending}>Cancel</Button>
            <Button onClick={handleSend} disabled={isSending} className="gap-2">
              {isSending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4" /> Send Request</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
