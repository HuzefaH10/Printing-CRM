import React from "react";
import { Activity, CallPayload, EmailPayload, MeetingPayload, TaskPayload, VisitPayload } from "../models/activity";
import { formatRelativeTime } from "@/utils/date";
import { 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  CheckSquare, 
  ArrowRightCircle, 
  MoreHorizontal, 
  MessageSquare,
  FileText
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ActivityCardProps {
  activity: Activity;
  isCompact?: boolean;
}

export function ActivityCard({ activity, isCompact = false }: ActivityCardProps) {
  const getIcon = () => {
    switch (activity.type) {
      case "CALL": return <Phone className="w-4 h-4 text-blue-500" />;
      case "EMAIL": return <Mail className="w-4 h-4 text-emerald-500" />;
      case "MEETING": return <Calendar className="w-4 h-4 text-purple-500" />;
      case "VISIT": return <MapPin className="w-4 h-4 text-orange-500" />;
      case "TASK": return <CheckSquare className="w-4 h-4 text-amber-500" />;
      case "FOLLOW_UP": return <ArrowRightCircle className="w-4 h-4 text-rose-500" />;
      case "NOTE": return <FileText className="w-4 h-4 text-gray-500" />;
      default: return <MessageSquare className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const renderPayloadPreview = () => {
    if (!activity.payload) return null;

    if (activity.type === "CALL") {
      const p = activity.payload as CallPayload;
      return <div className="text-xs text-muted-foreground mt-1">{p.direction} • {p.result} • {p.durationMinutes}m</div>;
    }
    if (activity.type === "EMAIL") {
      const p = activity.payload as EmailPayload;
      return <div className="text-xs text-muted-foreground mt-1">Subj: {p.subject}</div>;
    }
    if (activity.type === "MEETING") {
      const p = activity.payload as MeetingPayload;
      return <div className="text-xs text-muted-foreground mt-1">{p.meetingMode} • {p.location || "No location"}</div>;
    }
    if (activity.type === "VISIT") {
      const p = activity.payload as VisitPayload;
      return <div className="text-xs text-muted-foreground mt-1">{p.visitType} Visit</div>;
    }
    if (activity.type === "TASK") {
      const p = activity.payload as TaskPayload;
      return p.isRecurring ? <div className="text-xs text-muted-foreground mt-1">Recurring Task</div> : null;
    }
    return null;
  };

  return (
    <div className={cn(
      "group bg-card border rounded-xl shadow-sm transition-all hover:shadow-md",
      isCompact ? "p-3" : "p-4 sm:p-5"
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-2 rounded-full bg-muted/50 border shadow-sm">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm tracking-tight text-foreground">{activity.title}</h4>
              <StatusBadge status={activity.status} />
              {activity.priority === "URGENT" || activity.priority === "HIGH" ? (
                <span className="text-[10px] uppercase font-bold text-red-500 px-1.5 py-0.5 bg-red-500/10 rounded">
                  {activity.priority}
                </span>
              ) : null}
            </div>
            
            {!isCompact && activity.shortDescription && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {activity.shortDescription}
              </p>
            )}

            {renderPayloadPreview()}
            
            <div className="flex items-center gap-4 mt-3">
              {activity.dueDate && (
                <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                  Due: {formatRelativeTime(activity.dueDate)}
                </span>
              )}
              {activity.relatedCompanyId && (
                <span className="text-[11px] font-medium text-blue-500 hover:underline cursor-pointer">
                  Company ID: {activity.relatedCompanyId.substring(0,6)}...
                </span>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-muted focus:opacity-100 outline-none">
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Mark Completed</DropdownMenuItem>
            <DropdownMenuItem>Reschedule</DropdownMenuItem>
            <DropdownMenuItem>Edit Activity</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
