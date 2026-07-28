import React from "react";
import { OpportunityPlaybook, PlaybookStep } from "../../models/playbook";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { formatRelativeTime } from "@/utils/date";
import { Flag, PlayCircle, CheckCircle2, Clock } from "lucide-react";

interface Props {
  playbook: OpportunityPlaybook;
  onStepChange?: (stepId: string, updates: Partial<PlaybookStep>) => void;
}

export function PlaybookStrategyChecklist({ playbook, onStepChange }: Props) {
  const steps = playbook.winStrategySteps || [];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Flag className="w-5 h-5 text-primary" />
          Win Strategy
        </CardTitle>
        <CardDescription>
          Step-by-step checklist to win this opportunity.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y border-t">
          {steps.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No strategy steps defined yet.
            </div>
          )}
          {steps.map((step) => (
            <div 
              key={step.id} 
              className={`p-4 flex gap-4 transition-colors hover:bg-muted/30 ${step.status === 'COMPLETED' ? 'opacity-60 bg-muted/10' : ''}`}
            >
              <div className="pt-1">
                <Checkbox 
                  checked={step.status === 'COMPLETED'} 
                  onCheckedChange={(checked) => {
                    if (onStepChange) {
                      onStepChange(step.id, { 
                        status: checked ? 'COMPLETED' : 'PENDING',
                        completedAt: checked ? new Date().toISOString() : undefined
                      });
                    }
                  }}
                />
              </div>
              <div className="flex-1 space-y-1">
                <p className={`text-sm font-medium ${step.status === 'COMPLETED' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {step.title}
                </p>
                {step.notes && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{step.notes}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-[11px] font-medium text-muted-foreground">
                  {step.priority === 'HIGH' && <span className="text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-sm">High Priority</span>}
                  {step.dueDate && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due {formatRelativeTime(step.dueDate)}</span>}
                  
                  {step.status === 'IN_PROGRESS' && <span className="flex items-center gap-1 text-blue-500"><PlayCircle className="w-3 h-3" /> In Progress</span>}
                  {step.status === 'COMPLETED' && <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 className="w-3 h-3" /> Done</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
