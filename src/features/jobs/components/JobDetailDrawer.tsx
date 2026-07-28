"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Job, JobStatus, ArtworkStatus } from "../models/job";
import { jobRepo } from "../services/job.repository";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface JobDetailDrawerProps {
  jobId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JOB_STAGES: JobStatus[] = ["Prepress", "Proofing", "Production", "Finishing", "Delivery", "Invoiced", "Completed"];

export function JobDetailDrawer({ jobId, open, onOpenChange }: JobDetailDrawerProps) {
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actualDeliveryDate, setActualDeliveryDate] = useState("");

  useEffect(() => {
    if (!jobId || !open) {
      setJob(null);
      return;
    }
    
    setIsLoading(true);
    const unsubscribe = jobRepo.subscribeToDocument(
      jobId, 
      (data) => {
        setJob(data);
        setIsLoading(false);
      },
      console.error
    );

    return () => unsubscribe();
  }, [jobId, open]);

  const handleUpdate = async (updates: Partial<Job>) => {
    if (!jobId) return;
    setIsUpdating(true);
    try {
      await jobRepo.update(jobId, updates, user?.uid || 'unknown');
    } catch (e) {
      console.error("Failed to update job", e);
      alert("Failed to update job");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!actualDeliveryDate) {
      alert("Please enter the actual delivery date");
      return;
    }
    await handleUpdate({
      status: "Completed",
      actualDeliveryDate
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Job Details {job ? `- ${job.jobNumber}` : ''}</DialogTitle>
          <DialogDescription>
            {job ? `Client: ${job.organizationId}` : 'Loading...'}
          </DialogDescription>
        </DialogHeader>

        {isLoading || !job ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-8 mt-2">
            
            {/* Status Stepper */}
            <div className="bg-muted/30 p-4 rounded-xl border">
              <Label className="mb-3 block font-semibold">Production Pipeline</Label>
              <div className="flex gap-2 flex-wrap">
                {JOB_STAGES.map(stage => {
                  const isActive = job.status === stage;
                  const isPast = JOB_STAGES.indexOf(stage) < JOB_STAGES.indexOf(job.status);
                  
                  return (
                    <Button
                      key={stage}
                      variant={isActive ? "default" : isPast ? "secondary" : "outline"}
                      size="sm"
                      className={`text-xs ${isPast ? 'opacity-70' : ''}`}
                      disabled={isUpdating}
                      onClick={() => handleUpdate({ status: stage })}
                    >
                      {stage}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Left Col - Core info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Artwork Status</Label>
                  <Select 
                    value={job.artworkStatus} 
                    onValueChange={(val: string | null) => val && handleUpdate({ artworkStatus: val as ArtworkStatus })}
                    disabled={isUpdating}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Received">Received</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Delivery Deadline</Label>
                  <Input 
                    type="date" 
                    value={typeof job.deliveryDeadline === 'string' ? job.deliveryDeadline.split('T')[0] : ''} 
                    onChange={e => handleUpdate({ deliveryDeadline: e.target.value })}
                    disabled={isUpdating}
                  />
                </div>

                {job.status === "Completed" ? (
                  <div className="space-y-2 bg-emerald-500/10 p-3 rounded-md border border-emerald-500/30">
                    <Label className="text-emerald-700 dark:text-emerald-400">Actual Delivery Date</Label>
                    <Input 
                      type="date"
                      value={typeof job.actualDeliveryDate === 'string' ? job.actualDeliveryDate.split('T')[0] : ''} 
                      onChange={e => handleUpdate({ actualDeliveryDate: e.target.value })}
                      disabled={isUpdating}
                    />
                  </div>
                ) : (
                  <div className="bg-muted/30 p-3 rounded-md border border-dashed space-y-2 mt-4">
                    <Label className="text-xs">Mark as Completed</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="date" 
                        value={actualDeliveryDate}
                        onChange={e => setActualDeliveryDate(e.target.value)}
                        placeholder="Actual Delivery"
                      />
                      <Button size="sm" onClick={handleMarkCompleted} disabled={isUpdating}>Complete</Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Col - Specs */}
              <div className="bg-muted/10 p-4 rounded-xl border">
                <Label className="mb-4 block font-semibold border-b pb-2">Specifications</Label>
                <div className="space-y-3">
                  {Object.entries(job.specifications || {}).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-xs uppercase text-muted-foreground">{key}</Label>
                      <Input 
                        value={value as string} 
                        onChange={e => {
                          const newSpecs = { ...job.specifications, [key]: e.target.value };
                          handleUpdate({ specifications: newSpecs });
                        }}
                        disabled={isUpdating}
                      />
                    </div>
                  ))}
                  {(!job.specifications || Object.keys(job.specifications).length === 0) && (
                    <p className="text-sm text-muted-foreground">No specifications provided.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
