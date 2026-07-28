"use client";

import React, { useEffect, useState } from "react";
import { Contact } from "@/features/contacts/models/contact";
import { contactRepo } from "@/features/contacts/services/contact.repository";
import { ContactListTable } from "@/features/contacts/components/ContactListTable";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload, Users, HeartHandshake } from "lucide-react";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      const { data } = await contactRepo.list();
      setContacts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contact Intelligence</h2>
          <p className="text-muted-foreground">Manage your relationships, track influence, and build your network.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" /> Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add Contact
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{contacts.length}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Contacts</p>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
            <HeartHandshake className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {contacts.filter(c => c.healthScore?.overallHealth > 75).length}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Strong Relationships</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <ContactListTable contacts={contacts} isLoading={isLoading} />
      </div>
    </div>
  );
}
