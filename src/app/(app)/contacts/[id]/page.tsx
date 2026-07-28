"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Contact } from "@/features/contacts/models/contact";
import { ContactService } from "@/features/contacts/services/contact.service";
import { ContactHeaderProfile } from "@/features/contacts/components/ContactHeaderProfile";
import { StakeholderMatrix } from "@/features/contacts/components/StakeholderMatrix";
import { RelationshipAnalytics } from "@/features/contacts/components/RelationshipAnalytics";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadContact();
  }, [id]);

  const loadContact = async () => {
    setIsLoading(true);
    try {
      const data = await ContactService.getContactById(id);
      setContact(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!contact) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-xl font-bold mb-2">Contact Not Found</h2>
        <Button onClick={() => router.push("/contacts")}>Back to Directory</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => router.push("/contacts")} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
      </Button>

      <ContactHeaderProfile contact={contact} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <StakeholderMatrix contact={contact} />
              <RelationshipAnalytics contact={contact} />
            </div>
            
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Personal Preferences</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block mb-1">Communication Style</span>
                      <span className="font-medium">{contact.preferences?.communicationStyle || "Unknown"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Best Time to Contact</span>
                      <span className="font-medium">{contact.preferences?.bestTimeToContact || "Unknown"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Favorite Beverage</span>
                      <span className="font-medium">{contact.preferences?.favoriteBeverage || "Unknown"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Meeting Preferences</span>
                      <span className="font-medium">{contact.preferences?.meetingPreferences || "Unknown"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center text-muted-foreground py-12">
                  <Building2 className="w-8 h-8 mx-auto mb-4 opacity-20" />
                  <p>Company Integration goes here.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <p>Activity Engine Integration placeholder.</p>
              <p className="text-xs mt-2">The Universal Activity Engine will render a timeline specifically filtered for this contact.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <p>Opportunities Placeholder.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
