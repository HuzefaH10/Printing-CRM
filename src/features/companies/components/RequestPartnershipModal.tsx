"use client";

import React, { useEffect, useState } from "react";
import { Company } from "../models/company";
import { Contact } from "@/features/contacts/models/contact";
import { ContactService } from "@/features/contacts/services/contact.service";
import { OutreachSettingsService } from "@/features/settings/services/outreach-settings.service";
import { OutreachSettings, DEFAULT_OUTREACH_SETTINGS } from "@/features/settings/models/outreach-settings";
import { OutreachService } from "../services/outreach.service";
import { renderPartnershipEmailHtml } from "@/utils/email-template.utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { Loader2, Mail, Sparkles, X, Eye, Edit3, Send, CheckCircle } from "lucide-react";

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
  const [customMessage, setCustomMessage] = useState<string>("");
  const [settings, setSettings] = useState<OutreachSettings>(DEFAULT_OUTREACH_SETTINGS);
  const [isSending, setIsSending] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; name?: string; message?: string }>({});

  useEffect(() => {
    if (!isOpen) return;

    async function initModalData() {
      // 1. Fetch outreach settings
      const loadedSettings = await OutreachSettingsService.getSettings();
      setSettings(loadedSettings);

      // 2. Fetch company contacts
      try {
        const companyContacts = await ContactService.getContactsByCompanyId(company.id);
        setContacts(companyContacts);

        if (companyContacts.length > 0) {
          const primary = companyContacts[0];
          setSelectedContactId(primary.id);
          setRecipientEmail(primary.email || company.email || "");
          setContactName(`${primary.firstName} ${primary.lastName}`.trim());
        } else {
          setRecipientEmail(company.email || "");
          setContactName(company.name || "Valued Business Partner");
        }
      } catch (err) {
        setRecipientEmail(company.email || "");
        setContactName(company.name || "Valued Business Partner");
      }

      // 3. Pre-fill message template
      const targetName = contacts[0] ? `${contacts[0].firstName} ${contacts[0].lastName}` : company.name;
      const initialPitch = loadedSettings.defaultPitchTemplate
        .replace(/{contactName}/g, targetName)
        .replace(/{companyName}/g, company.name)
        .replace(/{companyPressName}/g, loadedSettings.companyPressName);
      
      setCustomMessage(initialPitch);
      setErrors({});
    }

    initModalData();
  }, [isOpen, company]);

  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId);
    if (contactId === "custom") return;

    const contact = contacts.find((c) => c.id === contactId);
    if (contact) {
      setRecipientEmail(contact.email || "");
      const fullName = `${contact.firstName} ${contact.lastName}`.trim();
      setContactName(fullName);

      // Re-populate template with selected contact's name
      const updatedPitch = settings.defaultPitchTemplate
        .replace(/{contactName}/g, fullName)
        .replace(/{companyName}/g, company.name)
        .replace(/{companyPressName}/g, settings.companyPressName);
      setCustomMessage(updatedPitch);
    }
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
      // Direct call to OutreachService or API route
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
      // Keep modal open with entered data intact as per Requirement 2
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  const subjectLine = `Partnership Opportunity — ${settings.companyPressName || "Printing Press"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
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
            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === "edit"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Message
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === "preview"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Live Preview
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === "edit" ? (
            <>
              {/* Recipient Selection & Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contacts.length > 0 && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="contactSelect" className="text-xs font-semibold uppercase text-muted-foreground">
                      Select Key Contact
                    </Label>
                    <select
                      id="contactSelect"
                      value={selectedContactId}
                      onChange={(e) => handleContactSelect(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {contacts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.firstName} {c.lastName} ({c.jobTitle || "No title"}) — {c.email || "No email"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="contactName" className="text-xs font-semibold uppercase text-muted-foreground">
                    Contact Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contactName"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. John Doe"
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="recipientEmail" className="text-xs font-semibold uppercase text-muted-foreground">
                    Recipient Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="e.g. jdoe@acme.com"
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
              </div>

              {/* Subject Display */}
              <div className="bg-muted/30 border rounded-lg p-3 text-sm">
                <span className="font-semibold text-muted-foreground mr-2">Subject:</span>
                <span className="font-medium text-foreground">{subjectLine}</span>
              </div>

              {/* Pitch Body Editor */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="customMessage" className="text-xs font-semibold uppercase text-muted-foreground">
                    Email Pitch Body <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-[11px] text-muted-foreground">Commercial Offset & RISO 9050 Digital pitch</span>
                </div>
                <textarea
                  id="customMessage"
                  rows={9}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring font-sans leading-relaxed"
                />
                {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
              </div>

              {/* Signature Preview */}
              <div className="bg-muted/20 border border-dashed rounded-lg p-3 text-xs space-y-1">
                <span className="font-semibold text-muted-foreground block mb-1">Attached Signature Block:</span>
                <pre className="font-sans text-muted-foreground whitespace-pre-wrap">{settings.defaultSignature}</pre>
              </div>
            </>
          ) : (
            /* Live Email Preview */
            <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
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

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
          <div className="text-xs text-muted-foreground">
            {activeTab === "edit" ? "Review pitch & signature before sending" : "Rendered live preview"}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} disabled={isSending}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isSending} className="gap-2">
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Email...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Partnership Request
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
