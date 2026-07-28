import React from "react";
import { PlaybookSuccessMetrics } from "../../models/playbook";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Activity, HeartHandshake, ShieldCheck } from "lucide-react";

interface Props {
  metrics: PlaybookSuccessMetrics;
}

export function PlaybookMetricsDashboard({ metrics }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/20 rounded-md">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Playbook Score</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black">{metrics.overallScore}</span>
            <span className="text-sm text-muted-foreground mb-1">/ 100</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${metrics.overallScore}%` }}></div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none border-dashed bg-muted/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-muted rounded-md">
              <Activity className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Readiness</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{metrics.readinessScore}</span>
            <span className="text-sm text-muted-foreground mb-1">/ 100</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${metrics.readinessScore}%` }}></div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none border-dashed bg-muted/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-muted rounded-md">
              <HeartHandshake className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Relationship</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{metrics.relationshipStrength}</span>
            <span className="text-sm text-muted-foreground mb-1">/ 100</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${metrics.relationshipStrength}%` }}></div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none border-dashed bg-muted/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-muted rounded-md">
              <ShieldCheck className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Competitive Pos.</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{metrics.competitivePosition}</span>
            <span className="text-sm text-muted-foreground mb-1">/ 100</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${metrics.competitivePosition}%` }}></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
