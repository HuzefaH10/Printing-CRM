import React from "react";
import { OpportunityPlaybook } from "../../models/playbook";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  playbook: OpportunityPlaybook;
  isEditing?: boolean;
}

export function PlaybookSummarySection({ playbook, isEditing = false }: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Opportunity Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Business Objective</Label>
            {isEditing ? (
              <Textarea placeholder="What is the customer trying to achieve?" defaultValue={playbook.summary?.businessObjective} />
            ) : (
              <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border min-h-[60px]">
                {playbook.summary?.businessObjective || "No business objective defined yet."}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Why This Matters</Label>
            {isEditing ? (
              <Textarea placeholder="Why is this opportunity important?" defaultValue={playbook.summary?.whyThisMatters} />
            ) : (
              <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border min-h-[60px]">
                {playbook.summary?.whyThisMatters || "Not defined."}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Current Situation
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Customer Background</Label>
            {isEditing ? (
              <Textarea defaultValue={playbook.summary?.customerBackground} />
            ) : (
              <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border min-h-[60px]">
                {playbook.summary?.customerBackground || "Not defined."}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Business Challenges</Label>
            {isEditing ? (
              <Textarea defaultValue={playbook.summary?.businessChallenges} />
            ) : (
              <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border min-h-[60px]">
                {playbook.summary?.businessChallenges || "Not defined."}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Current Printing Supplier</Label>
            {isEditing ? (
              <Textarea defaultValue={playbook.summary?.currentSupplier} />
            ) : (
              <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border min-h-[60px]">
                {playbook.summary?.currentSupplier || "Not defined."}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Known Pain Points</Label>
            {isEditing ? (
              <Textarea defaultValue={playbook.summary?.knownPainPoints} />
            ) : (
              <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border min-h-[60px]">
                {playbook.summary?.knownPainPoints || "Not defined."}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
