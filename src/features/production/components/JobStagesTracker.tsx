import React, { useState } from "react";
import { ProductionJob } from "../models/job";
import { ProductionService } from "../services/production.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock, GripVertical, Settings2, Play, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  job: ProductionJob;
}

export function JobStagesTracker({ job }: Props) {
  const [stages, setStages] = useState(job.stages?.sort((a, b) => a.order - b.order) || []);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAdvance = async (stageId: string) => {
    setIsUpdating(true);
    try {
      // In a real app we'd grab the current user ID
      await ProductionService.advanceStage(job.id, stageId, "system-user");
      // Update local state optimistic
      setStages(prev => prev.map(s => s.id === stageId ? { ...s, status: "Completed", completedAt: new Date().toISOString() } : s));
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStageColor = (status: string) => {
    switch (status) {
      case "Completed": return "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";
      case "In Progress": return "text-blue-600 bg-blue-500/10 border-blue-500/20";
      case "Delayed": return "text-red-600 bg-red-500/10 border-red-500/20";
      case "Skipped": return "text-slate-600 bg-slate-500/10 border-slate-500/20";
      default: return "text-muted-foreground bg-muted/50 border-border";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold tracking-tight">Production Workflow</h3>
        <Button variant="outline" size="sm">
          <Settings2 className="w-4 h-4 mr-2" /> Customize Workflow
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {stages.map((stage, idx) => {
              const isNext = stage.status === "Pending" && (idx === 0 || stages[idx - 1].status === "Completed" || stages[idx - 1].status === "Skipped");
              
              return (
                <div key={stage.id} className={`p-4 flex items-center gap-4 transition-colors ${stage.status === "Completed" ? 'bg-muted/30' : isNext ? 'bg-primary/5' : ''}`}>
                  <GripVertical className="w-5 h-5 text-muted-foreground/30 cursor-grab shrink-0" />
                  
                  <div className="shrink-0 flex flex-col items-center justify-center w-8">
                    {stage.status === "Completed" ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : stage.status === "In Progress" ? (
                      <Clock className="w-6 h-6 text-blue-500" />
                    ) : stage.status === "Delayed" ? (
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    ) : isNext ? (
                      <Circle className="w-6 h-6 text-primary" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground/30" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`font-semibold ${stage.status === "Completed" ? 'text-muted-foreground line-through' : ''}`}>
                      {stage.name}
                    </h4>
                    {stage.completedAt && (
                      <p className="text-xs text-muted-foreground">
                        Completed: {new Date(stage.completedAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <Badge variant="outline" className={`${getStageColor(stage.status)} shadow-none`}>
                      {stage.status}
                    </Badge>
                    
                    {isNext && (
                      <Button size="sm" onClick={() => handleAdvance(stage.id)} disabled={isUpdating}>
                        {isUpdating ? "Saving..." : <><Play className="w-3 h-3 mr-2" /> Start Stage</>}
                      </Button>
                    )}
                    {stage.status === "In Progress" && (
                      <Button size="sm" variant="default" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleAdvance(stage.id)} disabled={isUpdating}>
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Complete
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
