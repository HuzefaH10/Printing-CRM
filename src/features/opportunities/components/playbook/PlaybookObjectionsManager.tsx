import React from "react";
import { OpportunityPlaybook } from "../../models/playbook";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, ChevronRight } from "lucide-react";

interface Props {
  playbook: OpportunityPlaybook;
}

export function PlaybookObjectionsManager({ playbook }: Props) {
  const objections = playbook.expectedObjections || [];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          Expected Objections
        </CardTitle>
        <CardDescription>
          Pre-planned responses to anticipated pushback.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {objections.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground border border-dashed rounded-md">
            No expected objections defined.
          </div>
        )}
        {objections.map((obj) => (
          <div key={obj.id} className="border rounded-md overflow-hidden">
            <div className="bg-muted/50 p-3 border-b flex justify-between items-center">
              <span className="text-sm font-semibold text-foreground">
                "{obj.objection}"
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-background px-2 py-1 rounded shadow-sm border">
                {obj.category}
              </span>
            </div>
            <div className="p-3 bg-card text-sm text-muted-foreground flex gap-2 items-start">
              <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p>{obj.recommendedResponse}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
