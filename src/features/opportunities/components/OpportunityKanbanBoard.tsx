"use client";

import React, { useState } from "react";
import { Opportunity, OpportunityStatus } from "../models/opportunity";
import { formatCurrency } from "@/utils/currency";
import { useRouter } from "next/navigation";
import {
  DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragStartEvent, DragEndEvent, defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { OpportunityService } from "../services/opportunity.service";
import { JobService } from "@/features/jobs/services/job.service";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArtworkStatus } from "@/features/jobs/models/job";

const COLUMNS: { id: OpportunityStatus; title: string; color: string }[] = [
  { id: "Lead", title: "Lead", color: "bg-slate-500/10 text-slate-600" },
  { id: "Scoping", title: "Scoping", color: "bg-blue-500/10 text-blue-600" },
  { id: "Quoted", title: "Quoted", color: "bg-purple-500/10 text-purple-600" },
  { id: "Negotiation", title: "Negotiation", color: "bg-orange-500/10 text-orange-600" },
  { id: "Won", title: "Won", color: "bg-emerald-500/10 text-emerald-600" },
  { id: "Lost", title: "Lost", color: "bg-red-500/10 text-red-600" },
];

function SortableOpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: opportunity.id, data: { type: "Opportunity", opportunity } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => router.push(`/opportunities/${opportunity.id}`)}
      className={`bg-card border p-3 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors ${
        isDragging ? "opacity-30" : "opacity-100"
      }`}
    >
      <h4 className="font-medium text-sm mb-1">{opportunity.title}</h4>
      <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{opportunity.organizationId}</p>
      
      <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t">
        <span className="font-semibold text-foreground">
          {formatCurrency(opportunity.quotedValue || opportunity.estimatedCost || 0)}
        </span>
        {opportunity.expectedCloseDate && (
          <span className="text-muted-foreground">
            {new Date(opportunity.expectedCloseDate as string).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({ column, opportunities }: { column: typeof COLUMNS[0], opportunities: Opportunity[] }) {
  const { setNodeRef } = useSortable({ id: column.id, data: { type: "Column", column } });

  return (
    <div className="flex flex-col min-w-[300px] w-[300px] h-full bg-muted/40 rounded-xl border">
      <div className="p-3 flex items-center justify-between border-b bg-background/50 rounded-t-xl">
        <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${column.color}`}>
          {column.title}
        </div>
        <span className="text-xs font-medium text-muted-foreground bg-background border px-1.5 py-0.5 rounded-md shadow-sm">
          {opportunities.length}
        </span>
      </div>
      <div ref={setNodeRef} className="flex-1 p-2 overflow-y-auto flex flex-col gap-2 min-h-[150px]">
        <SortableContext items={opportunities.map((o) => o.id)} strategy={verticalListSortingStrategy}>
          {opportunities.map((opp) => (
            <SortableOpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export function OpportunityKanbanBoard({ opportunities }: { opportunities: Opportunity[] }) {
  const { user } = useAuth();
  const [activeOpportunity, setActiveOpportunity] = useState<Opportunity | null>(null);
  
  // Job Creation Modal State
  const [conversionOppId, setConversionOppId] = useState<string | null>(null);
  const [deliveryDeadline, setDeliveryDeadline] = useState("");
  const [artworkStatus, setArtworkStatus] = useState<ArtworkStatus>("Pending");
  const [isConverting, setIsConverting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === "Opportunity") {
      setActiveOpportunity(active.data.current.opportunity);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveOpportunity(null);
    const { active, over } = event;
    if (!over) return;

    const oppId = active.id as string;
    const activeData = active.data.current;
    
    let newStatus: OpportunityStatus | null = null;
    if (over.data.current?.type === "Column") newStatus = over.id as OpportunityStatus;
    else if (over.data.current?.type === "Opportunity") newStatus = (over.data.current.opportunity as Opportunity).status;

    if (newStatus && activeData?.opportunity.status !== newStatus) {
      if (newStatus === "Won") {
        // Open Job Conversion Modal instead of direct confirm
        setConversionOppId(oppId);
        return;
      }
      
      try {
        await OpportunityService.updateStatus(oppId, newStatus, user?.uid || 'unknown');
      } catch (err) {
        console.error("Failed to update status", err);
        alert("Failed to update status");
      }
    }
  };

  const handleConvertConfirm = async () => {
    if (!conversionOppId || !deliveryDeadline) return;
    setIsConverting(true);
    try {
      await JobService.createJobFromOpportunity(conversionOppId, user?.uid || 'unknown', deliveryDeadline, artworkStatus);
      setConversionOppId(null);
    } catch (e) {
      console.error(e);
      alert("Failed to create job");
    } finally {
      setIsConverting(false);
    }
  };

  const handleConvertDecline = async () => {
    if (!conversionOppId) return;
    setIsConverting(true);
    try {
      await OpportunityService.updateStatus(conversionOppId, "Won", user?.uid || 'unknown');
      setConversionOppId(null);
    } catch (e) {
      console.error(e);
      alert("Failed to update opportunity");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 p-4 h-full overflow-x-auto items-start">
          {COLUMNS.map((col) => (
            <KanbanColumn key={col.id} column={col} opportunities={opportunities.filter((o) => o.status === col.id)} />
          ))}
        </div>
        <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } }) }}>
          {activeOpportunity ? (
            <div className="bg-card border p-3 rounded-lg shadow-xl opacity-80 cursor-grabbing rotate-2 w-[280px]">
               <h4 className="font-medium text-sm mb-1">{activeOpportunity.title}</h4>
               <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{activeOpportunity.organizationId}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Job Conversion Modal */}
      <Dialog open={!!conversionOppId} onOpenChange={(open) => !open && setConversionOppId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Job from this Opportunity?</DialogTitle>
            <DialogDescription>
              Marking this as Won. You can immediately create a Production Job, or skip it for now.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 my-4">
            <div className="space-y-2">
              <Label>Delivery Deadline</Label>
              <Input type="date" value={deliveryDeadline} onChange={e => setDeliveryDeadline(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Artwork Status</Label>
              <Select value={artworkStatus} onValueChange={(val: string | null) => val && setArtworkStatus(val as ArtworkStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setConversionOppId(null)}>Cancel</Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={handleConvertDecline} disabled={isConverting}>Mark Won (No Job)</Button>
              <Button onClick={handleConvertConfirm} disabled={isConverting || !deliveryDeadline}>Create Job</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
