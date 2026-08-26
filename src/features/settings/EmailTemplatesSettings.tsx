"use client";

import { useEffect, useState } from "react";
import { EmailTemplateService } from "./services/email-template.service";
import { EmailTemplate, EMAIL_TEMPLATE_PLACEHOLDERS } from "./models/email-template";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Plus, Edit2, MailOpen, Eye } from "lucide-react";

export function EmailTemplatesSettings() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      await EmailTemplateService.seedTemplatesIfNeeded();
      const data = await EmailTemplateService.getAllTemplates();
      setTemplates(data);
    } catch (error) {
      console.error(error);
      toast.add({ type: "error", title: "Error", description: "Failed to load templates." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (template: EmailTemplate) => {
    try {
      const newStatus = !template.isActive;
      setTemplates(prev => prev.map(t => t.id === template.id ? { ...t, isActive: newStatus } : t));
      await EmailTemplateService.updateTemplate(template.id, { isActive: newStatus });
      toast.add({ type: "success", title: "Updated", description: `${template.sectorTag} template is now ${newStatus ? 'active' : 'inactive'}.` });
    } catch (err) {
      toast.add({ type: "error", title: "Error", description: "Failed to update template status." });
      loadTemplates();
    }
  };

  const handleSaveEdit = async () => {
    if (!editingTemplate) return;
    setIsSaving(true);
    try {
      await EmailTemplateService.updateTemplate(editingTemplate.id, {
        subject: editingTemplate.subject,
        bodyTemplate: editingTemplate.bodyTemplate,
      });
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? editingTemplate : t));
      setEditingTemplate(null);
      toast.add({ type: "success", title: "Saved", description: "Template updated successfully." });
    } catch (err) {
      toast.add({ type: "error", title: "Error", description: "Failed to save template." });
    } finally {
      setIsSaving(false);
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    if (!editingTemplate) return;
    // Simple append for now, a real implementation might insert at cursor
    setEditingTemplate({
      ...editingTemplate,
      bodyTemplate: editingTemplate.bodyTemplate + ` ${placeholder}`
    });
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h3 className="text-lg font-medium">Email Templates</h3>
        <p className="text-sm text-muted-foreground">
          Manage outreach templates tailored to specific industries. The system auto-selects these during "Request Partnership".
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(template => (
          <Card key={template.id} className={!template.isActive ? "opacity-60" : ""}>
            <CardHeader className="pb-3 flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <MailOpen className="w-4 h-4 text-primary" />
                  {template.sectorTag} {template.sectorTag === "Generic" && "(Fallback)"}
                </CardTitle>
                <CardDescription className="line-clamp-1 mt-1" title={template.subject}>
                  {template.subject}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={template.isActive} 
                  onCheckedChange={() => handleToggleActive(template)}
                  id={`toggle-${template.id}`}
                />
                <Label htmlFor={`toggle-${template.id}`} className="text-xs text-muted-foreground cursor-pointer">Active</Label>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground line-clamp-3 mb-4">
                {template.bodyTemplate}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="w-full" onClick={() => setEditingTemplate(template)}>
                  <Edit2 className="w-4 h-4 mr-2" /> Edit Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Template: {editingTemplate?.sectorTag}</DialogTitle>
            <DialogDescription>
              Use placeholders to dynamically inject company and contact data.
            </DialogDescription>
          </DialogHeader>

          {editingTemplate && (
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label>Subject Line</Label>
                <Input 
                  value={editingTemplate.subject} 
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label>Email Body</Label>
                  <div className="flex flex-wrap gap-1 max-w-[60%] justify-end">
                    {EMAIL_TEMPLATE_PLACEHOLDERS.map(p => (
                      <button 
                        key={p}
                        onClick={() => insertPlaceholder(p)}
                        className="text-[10px] px-1.5 py-0.5 bg-muted border rounded hover:bg-muted/80 text-muted-foreground"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={12}
                  className="w-full rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring font-sans leading-relaxed"
                  value={editingTemplate.bodyTemplate}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, bodyTemplate: e.target.value })}
                />
              </div>

              <div className="bg-muted/30 p-3 rounded-lg border text-xs text-muted-foreground space-y-2">
                <p className="font-semibold flex items-center gap-1"><Eye className="w-4 h-4" /> Live Preview Data Mapping:</p>
                <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                  <div>{'{{companyName}} -> "Acme Corp"'}</div>
                  <div>{'{{contactName}} -> "John Doe"'}</div>
                  <div>{'{{decisionMakerRole}} -> "Procurement"'}</div>
                  <div>{'{{companyLogoOrName}} -> "Your Press"'}</div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
