"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Contact } from "@/features/contacts/models/contact";
import { ContactService } from "@/features/contacts/services/contact.service";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  companyId: string;
}

export function ContactSummaryCard({ companyId }: Props) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadContacts();
  }, [companyId]);

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      const data = await ContactService.getContactsByCompanyId(companyId);
      setContacts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card border shadow-sm rounded-xl p-6">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
        <h3 className="font-semibold tracking-tight text-lg">Key Contacts</h3>
        <Button variant="ghost" size="sm" onClick={() => router.push("/contacts")}>View All</Button>
      </div>
      
      {isLoading ? (
        <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : contacts.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground border border-dashed rounded-md">
          No contacts associated with this company.
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.map(contact => (
            <div 
              key={contact.id} 
              onClick={() => router.push(`/contacts/${contact.id}`)}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border"
            >
              <Avatar className="w-10 h-10 mt-0.5">
                <AvatarImage src={contact.profilePhotoUrl} />
                <AvatarFallback>{contact.firstName.charAt(0)}{contact.lastName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm text-foreground flex items-center gap-2">
                  {contact.firstName} {contact.lastName}
                  {contact.priority === "VIP" && <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded-sm uppercase tracking-wider">VIP</span>}
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  {contact.relationshipProfile?.decisionAuthority || contact.jobTitle || "No Role"}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                  <span className="text-[11px] text-muted-foreground">{contact.email}</span>
                  <span className="text-[11px] text-muted-foreground">{contact.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
