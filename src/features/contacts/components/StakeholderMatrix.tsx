import React from "react";
import { Contact } from "../models/contact";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Crosshair } from "lucide-react";

interface Props {
  contact: Contact;
}

export function StakeholderMatrix({ contact }: Props) {
  // We plot Influence (Y axis) vs Relationship Strength (X axis)
  const influence = contact.relationshipProfile?.influenceScore || 0;
  const relationship = contact.relationshipProfile?.relationshipStrength || 0;

  // Matrix categories
  let category = "Unknown";
  let description = "Not enough data to categorize.";
  let bgColor = "bg-muted";
  
  if (influence > 50 && relationship > 50) {
    category = "Champion";
    description = "High influence, strong relationship. They can advocate for you.";
    bgColor = "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
  } else if (influence > 50 && relationship <= 50) {
    category = "Blocker / Risk";
    description = "High influence, weak relationship. Needs immediate attention.";
    bgColor = "bg-red-500/10 text-red-700 border-red-500/20";
  } else if (influence <= 50 && relationship > 50) {
    category = "Supporter";
    description = "Low influence, strong relationship. Good for info gathering.";
    bgColor = "bg-blue-500/10 text-blue-700 border-blue-500/20";
  } else {
    category = "Observer";
    description = "Low influence, weak relationship. Monitor but deprioritize.";
    bgColor = "bg-slate-500/10 text-slate-700 border-slate-500/20";
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-primary" />
          Stakeholder Mapping
        </CardTitle>
        <CardDescription>
          Influence vs. Relationship Strength
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className={`p-4 rounded-lg border ${bgColor}`}>
          <h4 className="font-bold text-lg mb-1">{category}</h4>
          <p className="text-sm">{description}</p>
        </div>

        {/* Visual Matrix Map */}
        <div className="relative w-full aspect-square max-w-[250px] mx-auto border-2 border-muted bg-muted/5 rounded-md">
          {/* Grid lines */}
          <div className="absolute top-1/2 left-0 w-full border-t-2 border-muted border-dashed"></div>
          <div className="absolute top-0 left-1/2 h-full border-l-2 border-muted border-dashed"></div>
          
          {/* Labels */}
          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase text-muted-foreground bg-background px-1">High Influence</span>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase text-muted-foreground bg-background px-1">Low Influence</span>
          <span className="absolute top-1/2 left-2 -translate-y-1/2 text-[10px] font-bold uppercase text-muted-foreground bg-background px-1 -rotate-90 origin-center whitespace-nowrap">Weak Rel.</span>
          <span className="absolute top-1/2 right-2 -translate-y-1/2 text-[10px] font-bold uppercase text-muted-foreground bg-background px-1 rotate-90 origin-center whitespace-nowrap">Strong Rel.</span>
          
          {/* Data Point */}
          <div 
            className="absolute w-4 h-4 bg-primary rounded-full shadow-lg border-2 border-background z-10 transition-all duration-500"
            style={{ 
              bottom: `${influence}%`, 
              left: `${relationship}%`,
              transform: 'translate(-50%, 50%)'
            }}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap">
              You
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
