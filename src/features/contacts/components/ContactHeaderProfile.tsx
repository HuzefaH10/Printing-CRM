import React from "react";
import { Contact } from "../models/contact";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Building2, Link, CheckCircle2, ShieldAlert } from "lucide-react";
import { formatRelativeTime } from "@/utils/date";

interface Props {
  contact: Contact;
}

export function ContactHeaderProfile({ contact }: Props) {
  const getHealthColor = (score: number) => {
    if (score > 75) return "text-emerald-500 bg-emerald-500/10";
    if (score > 40) return "text-blue-500 bg-blue-500/10";
    return "text-amber-500 bg-amber-500/10";
  };

  const healthColorClass = getHealthColor(contact.healthScore?.overallHealth || 0);

  return (
    <Card className="overflow-hidden border-none shadow-md">
      <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent w-full"></div>
      <CardContent className="relative pt-0 sm:pt-0">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 sm:-mt-16 mb-4">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-card border-4 border-background flex items-center justify-center text-4xl font-bold text-primary shadow-sm overflow-hidden shrink-0">
            {contact.profilePhotoUrl ? (
              <img src={contact.profilePhotoUrl} alt={contact.firstName} className="w-full h-full object-cover" />
            ) : (
              <span>{contact.firstName.charAt(0)}{contact.lastName.charAt(0)}</span>
            )}
          </div>
          
          <div className="flex-1 pb-2 space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {contact.firstName} {contact.lastName}
              </h1>
              {contact.priority === "VIP" && (
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white uppercase text-[10px] tracking-wider px-2 py-0.5">VIP</Badge>
              )}
            </div>
            
            <p className="text-lg text-muted-foreground font-medium flex items-center gap-2">
              {contact.jobTitle || "No Title"} 
              <span className="text-muted/30">|</span> 
              <Building2 className="w-4 h-4 text-primary/70" />
              <span className="text-primary hover:underline cursor-pointer">Company Link</span>
            </p>
          </div>

          <div className="flex gap-2 sm:pb-2 w-full sm:w-auto">
            <Button size="sm" className="flex-1 sm:flex-none">
              <Mail className="w-4 h-4 mr-2" /> Email
            </Button>
            <Button size="sm" variant="outline" className="flex-1 sm:flex-none">
              <Phone className="w-4 h-4 mr-2" /> Call
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Contact Details</h3>
            {contact.email && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </div>
                <a href={`mailto:${contact.email}`} className="hover:underline truncate">{contact.email}</a>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                </div>
                <a href={`tel:${contact.phone}`} className="hover:underline">{contact.phone}</a>
              </div>
            )}
            {contact.city && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                </div>
                <span>{contact.city}{contact.country ? `, ${contact.country}` : ''}</span>
              </div>
            )}
            {contact.linkedin && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Link className="w-4 h-4 text-muted-foreground" />
                </div>
                <a href={contact.linkedin} target="_blank" rel="noreferrer" className="hover:underline text-blue-600 truncate">{contact.linkedin}</a>
              </div>
            )}
          </div>

          <div className="space-y-4 md:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Relationship Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border bg-card shadow-sm">
                <p className="text-xs text-muted-foreground font-medium mb-1">Health Score</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black">{contact.healthScore?.overallHealth || 0}</span>
                </div>
                <div className={`mt-2 h-1.5 w-full rounded-full overflow-hidden ${healthColorClass.split(' ')[1]}`}>
                  <div className={`h-full rounded-full bg-current ${healthColorClass.split(' ')[0]}`} style={{ width: `${contact.healthScore?.overallHealth || 0}%` }}></div>
                </div>
              </div>

              <div className="p-4 rounded-xl border bg-card shadow-sm">
                <p className="text-xs text-muted-foreground font-medium mb-1">Authority</p>
                <p className="font-semibold mt-1">{contact.relationshipProfile?.decisionAuthority || "Unknown"}</p>
                <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider">Role Type</p>
              </div>

              <div className="p-4 rounded-xl border bg-card shadow-sm">
                <p className="text-xs text-muted-foreground font-medium mb-1">Last Contact</p>
                <p className="font-semibold mt-1 text-sm">
                  {contact.relationshipProfile?.lastContactDate ? formatRelativeTime(contact.relationshipProfile.lastContactDate) : "Never"}
                </p>
                <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-600 font-medium uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" /> Logged
                </div>
              </div>
              
              <div className="p-4 rounded-xl border bg-card shadow-sm bg-primary/5 border-primary/20">
                <p className="text-xs text-primary font-medium mb-1">Next Follow-up</p>
                <p className="font-semibold mt-1 text-sm text-primary">
                  {contact.relationshipProfile?.nextFollowUp ? formatRelativeTime(contact.relationshipProfile.nextFollowUp) : "Not Scheduled"}
                </p>
                {!contact.relationshipProfile?.nextFollowUp && (
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-amber-600 font-medium uppercase tracking-wider">
                    <ShieldAlert className="w-3 h-3" /> Needs Action
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
