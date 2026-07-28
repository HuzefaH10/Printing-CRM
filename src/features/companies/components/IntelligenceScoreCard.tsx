import React from "react";
import { IntelligenceScore } from "../models/company";

interface IntelligenceScoreCardProps {
  score: IntelligenceScore;
}

export function IntelligenceScoreCard({ score }: IntelligenceScoreCardProps) {
  const getScoreColor = (val: number) => {
    if (val > 80) return "text-emerald-500";
    if (val > 50) return "text-emerald-400";
    if (val > 30) return "text-amber-500";
    return "text-destructive";
  };

  const getScoreBg = (val: number) => {
    if (val > 80) return "bg-emerald-500";
    if (val > 50) return "bg-emerald-400";
    if (val > 30) return "bg-amber-500";
    return "bg-destructive";
  };

  return (
    <div className="bg-card border shadow-sm rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold tracking-tight text-lg">Intelligence Score</h3>
      </div>
      
      <div className="flex items-center justify-center mb-8">
        <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-[8px] border-muted">
          {/* A simple visual ring for now */}
          <div className="absolute inset-0 rounded-full border-[8px] border-transparent" style={{ borderTopColor: 'currentColor' }} />
          <div className="text-center">
            <span className={`text-4xl font-bold tracking-tighter ${getScoreColor(score.overallScore)}`}>
              {score.overallScore}
            </span>
            <span className="block text-[10px] uppercase font-semibold text-muted-foreground mt-1">Overall</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <ScoreBar label="Relationship" value={score.relationshipScore} colorClass={getScoreBg(score.relationshipScore)} />
        <ScoreBar label="Potential" value={score.potentialScore} colorClass={getScoreBg(score.potentialScore)} />
        <ScoreBar label="Opportunity" value={score.opportunityScore} colorClass={getScoreBg(score.opportunityScore)} />
        <ScoreBar label="Engagement" value={score.engagementScore} colorClass={getScoreBg(score.engagementScore)} />
        <ScoreBar label="Urgency" value={score.urgencyScore} colorClass={getScoreBg(score.urgencyScore)} />
      </div>
    </div>
  );
}

function ScoreBar({ label, value, colorClass }: { label: string, value: number, colorClass: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className="text-xs font-bold text-muted-foreground">{value}</span>
      </div>
      <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
