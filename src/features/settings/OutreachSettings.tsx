"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { OutreachSettingsService } from "./services/outreach-settings.service";
import { DEFAULT_OUTREACH_SETTINGS, type OutreachSettings } from "./models/outreach-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { Loader2, Mail, Sparkles, Building2, Phone, User, ShieldAlert, CheckCircle2, Info } from "lucide-react";

const outreachSchema = z.object({
  senderName: z.string().min(2, "Sender name is required"),
  senderEmail: z.string().email("Invalid sender email address"),
  phoneNumber: z.string().min(5, "Phone number is required"),
  companyPressName: z.string().min(2, "Company / Press name is required"),
  defaultPitchTemplate: z.string().min(20, "Default pitch template must be at least 20 characters"),
  defaultSignature: z.string().min(10, "Default signature is required"),
  gmailUser: z.string().email("Invalid Gmail address").or(z.literal("")).optional(),
  gmailAppPassword: z.string().optional(),
  resendApiKey: z.string().optional(),
});

type OutreachFormValues = z.infer<typeof outreachSchema>;

export function OutreachSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [rawSettings, setRawSettings] = useState<OutreachSettings>(DEFAULT_OUTREACH_SETTINGS);

  const form = useForm<OutreachFormValues>({
    resolver: zodResolver(outreachSchema),
    defaultValues: DEFAULT_OUTREACH_SETTINGS,
  });

  const watchSenderEmail = form.watch("senderEmail");
  const watchGmailUser = form.watch("gmailUser");

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const settings = await OutreachSettingsService.getSettings();
        setRawSettings(settings);
        form.reset({
          senderName: settings.senderName,
          senderEmail: settings.senderEmail,
          phoneNumber: settings.phoneNumber,
          companyPressName: settings.companyPressName,
          defaultPitchTemplate: settings.defaultPitchTemplate,
          defaultSignature: settings.defaultSignature,
          gmailUser: settings.gmailUser || "",
          gmailAppPassword: settings.gmailAppPassword || "",
          resendApiKey: settings.resendApiKey || "",
        });
      } catch (err) {
        console.error("Failed to load outreach settings", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [form]);

  const onSubmit = async (data: OutreachFormValues) => {
    setIsSaving(true);
    try {
      const updated = await OutreachSettingsService.updateSettings(data);
      setRawSettings(updated);
      toast.add({
        type: "success",
        title: "Outreach Settings Saved",
        description: "Your partnership email defaults, Gmail SMTP, and signatures have been updated successfully.",
      });
      form.reset(data);
    } catch (error: any) {
      toast.add({
        type: "error",
        title: "Failed to Save",
        description: error?.message || "An error occurred while saving outreach settings.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeSendingFrom = watchGmailUser || watchSenderEmail || "outreach@printingpress.com";
  const todaySentCount = rawSettings.dailySentCount || 0;
  const isApproachingLimit = todaySentCount >= 400;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Outreach Settings
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Configure sender defaults, Gmail SMTP credentials, commercial pitch templates, and email signatures used by the Request Partnership tool.
        </p>
      </div>

      {/* Sending From Indicator */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Outreach Transport Address</div>
            <div className="text-sm font-bold text-foreground">
              Sending from: <span className="text-primary">{activeSendingFrom}</span>
            </div>
          </div>
        </div>

        <div className="text-right text-xs text-muted-foreground">
          <div>Gmail Daily Limit: <strong>~500 / day</strong></div>
          <div>Sent Today: <strong>{todaySentCount} / 500</strong></div>
        </div>
      </div>

      {/* Soft Warning Banner if approaching 500 limit */}
      {isApproachingLimit && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 text-amber-600 dark:text-amber-400 text-sm">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Soft Warning: Approaching Gmail Daily Limit</div>
            <div className="text-xs mt-0.5 opacity-90">
              You have sent <strong>{todaySentCount} of ~500</strong> emails allowed by Gmail SMTP today. Consider pacing remaining outreach messages to prevent temporary quota throttling.
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-border"></div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Gmail SMTP Transport Configuration */}
        <div className="bg-card border rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
              <Mail className="w-4 h-4 text-rose-500" />
              Gmail SMTP Transport Credentials
            </h4>
            <span className="text-xs bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded font-medium border border-rose-500/20">
              Recommended Provider
            </span>
          </div>

          <div className="bg-muted/40 border rounded-lg p-3.5 text-xs text-muted-foreground space-y-1.5">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Info className="w-4 h-4 text-blue-500" />
              Secure Secret Management:
            </div>
            <p>
              For production deployments, store <code className="bg-background px-1 py-0.5 rounded font-mono">GMAIL_USER</code> and <code className="bg-background px-1 py-0.5 rounded font-mono">GMAIL_APP_PASSWORD</code> in Firebase Functions config/secrets (<code className="bg-background px-1 py-0.5 rounded font-mono">firebase functions:secrets:set GMAIL_USER</code>). Never expose your real Google account password.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-2">
              <Label htmlFor="gmailUser">Gmail Address (GMAIL_USER)</Label>
              <Input
                id="gmailUser"
                type="email"
                placeholder="e.g. yourname@gmail.com"
                {...form.register("gmailUser")}
              />
              {form.formState.errors.gmailUser && (
                <p className="text-xs text-destructive">{form.formState.errors.gmailUser.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gmailAppPassword">16-char App Password (GMAIL_APP_PASSWORD)</Label>
              <Input
                id="gmailAppPassword"
                type="password"
                placeholder="xxxx xxxx xxxx xxxx"
                {...form.register("gmailAppPassword")}
              />
              <p className="text-[11px] text-muted-foreground">
                Generate in Google Account &gt; Security &gt; 2-Step Verification &gt; App Passwords.
              </p>
            </div>
          </div>
        </div>

        {/* Sender Identity Card */}
        <div className="bg-card border rounded-xl p-5 space-y-4 shadow-sm">
          <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            Sender Identity & Contact Info
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="senderName">Sender Name</Label>
              <Input id="senderName" placeholder="e.g. Huzefa Hasani" {...form.register("senderName")} />
              {form.formState.errors.senderName && (
                <p className="text-xs text-destructive">{form.formState.errors.senderName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="senderEmail">Reply-To Email Address</Label>
              <Input id="senderEmail" type="email" placeholder="e.g. outreach@printingpress.com" {...form.register("senderEmail")} />
              {form.formState.errors.senderEmail && (
                <p className="text-xs text-destructive">{form.formState.errors.senderEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" placeholder="e.g. +965 9900 1234" {...form.register("phoneNumber")} />
              {form.formState.errors.phoneNumber && (
                <p className="text-xs text-destructive">{form.formState.errors.phoneNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyPressName">Company / Printing Press Name</Label>
              <Input id="companyPressName" placeholder="e.g. PrintCo Offset & Digital Press" {...form.register("companyPressName")} />
              {form.formState.errors.companyPressName && (
                <p className="text-xs text-destructive">{form.formState.errors.companyPressName.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Pitch Template & Capabilities */}
        <div className="bg-card border rounded-xl p-5 space-y-4 shadow-sm">
          <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            Default Pitch Template & Commercial Capabilities
          </h4>
          <p className="text-xs text-muted-foreground">
            Available dynamic placeholders: <code className="bg-muted px-1 py-0.5 rounded text-[11px]">{`{contactName}`}</code>, <code className="bg-muted px-1 py-0.5 rounded text-[11px]">{`{companyName}`}</code>, <code className="bg-muted px-1 py-0.5 rounded text-[11px]">{`{companyPressName}`}</code>.
          </p>

          <div className="space-y-2">
            <Label htmlFor="defaultPitchTemplate">Default Pitch Body</Label>
            <textarea
              id="defaultPitchTemplate"
              rows={8}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono leading-relaxed"
              {...form.register("defaultPitchTemplate")}
            />
            {form.formState.errors.defaultPitchTemplate && (
              <p className="text-xs text-destructive">{form.formState.errors.defaultPitchTemplate.message}</p>
            )}
          </div>
        </div>

        {/* Signature Block */}
        <div className="bg-card border rounded-xl p-5 space-y-4 shadow-sm">
          <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            Default Email Signature Block
          </h4>
          <div className="space-y-2">
            <Label htmlFor="defaultSignature">Signature Text / Footer</Label>
            <textarea
              id="defaultSignature"
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
              {...form.register("defaultSignature")}
            />
            {form.formState.errors.defaultSignature && (
              <p className="text-xs text-destructive">{form.formState.errors.defaultSignature.message}</p>
            )}
          </div>
        </div>

        {/* Secondary API Credentials */}
        <div className="bg-card border rounded-xl p-5 space-y-4 shadow-sm">
          <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Alternative Dispatch Credentials (Resend API Key)
          </h4>
          <div className="space-y-2">
            <Label htmlFor="resendApiKey">Resend API Key (Secondary Fallback)</Label>
            <Input
              id="resendApiKey"
              type="password"
              placeholder="re_123456789..."
              {...form.register("resendApiKey")}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" disabled={isSaving || !form.formState.isDirty}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Outreach Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
