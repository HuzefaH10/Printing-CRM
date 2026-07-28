import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ContactSummary {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  avatarUrl?: string;
}

export function ContactSummaryCard() {
  // Placeholder data as per instructions
  const contacts: ContactSummary[] = [
    { id: "1", name: "Sarah Jenkins", role: "Procurement Manager", department: "Procurement", email: "sarah@example.com", phone: "+1 234 567 8900" },
    { id: "2", name: "David Chen", role: "Marketing Director", department: "Marketing", email: "david@example.com", phone: "+1 234 567 8901" }
  ];

  return (
    <div className="bg-card border shadow-sm rounded-xl p-6">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
        <h3 className="font-semibold tracking-tight text-lg">Key Contacts</h3>
      </div>
      
      <div className="space-y-4">
        {contacts.map(contact => (
          <div key={contact.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border">
            <Avatar className="w-10 h-10 mt-0.5">
              <AvatarImage src={contact.avatarUrl} />
              <AvatarFallback>{contact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm text-foreground">{contact.name}</div>
              <div className="text-xs text-muted-foreground mb-1">{contact.role}</div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                <span className="text-[11px] text-muted-foreground">{contact.email}</span>
                <span className="text-[11px] text-muted-foreground">{contact.phone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
