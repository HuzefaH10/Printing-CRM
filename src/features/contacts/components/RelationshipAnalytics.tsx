import React from "react";
import { Contact } from "../models/contact";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, MessageCircle, Clock, Heart } from "lucide-react";

interface Props {
  contact: Contact;
}

export function RelationshipAnalytics({ contact }: Props) {
  const profile = contact.relationshipProfile;
  const health = contact.healthScore;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Relationship Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/30 p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Frequency</span>
            </div>
            <p className="font-medium text-sm">{profile?.communicationFrequency || "Unknown"}</p>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avg Reply</span>
            </div>
            <p className="font-medium text-sm">{profile?.averageReplyTime || "Unknown"}</p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground">Trust Score</span>
              <span className="font-bold">{health?.trustScore || 0}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${health?.trustScore || 0}%` }}></div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground">Engagement</span>
              <span className="font-bold">{health?.engagementScore || 0}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${health?.engagementScore || 0}%` }}></div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground">Responsiveness</span>
              <span className="font-bold">{health?.responseScore || 0}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${health?.responseScore || 0}%` }}></div>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
