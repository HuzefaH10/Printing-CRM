"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ActivityType } from "../models/activity";

interface ActivityGlobalCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: ActivityType;
}

export function ActivityGlobalCreateModal({ isOpen, onClose, defaultType = "TASK" }: ActivityGlobalCreateModalProps) {
  const [type, setType] = useState<ActivityType>(defaultType);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    // In a real application, this would call ActivityService.createActivity
    console.log("Saving Activity:", { type, title, description });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
          <DialogDescription>
            Record a meeting, call, task, or note.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Type</Label>
            <select 
              className="col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as ActivityType)}
            >
              <option value="TASK">Task</option>
              <option value="MEETING">Meeting</option>
              <option value="CALL">Call</option>
              <option value="EMAIL">Email</option>
              <option value="VISIT">Visit</option>
              <option value="FOLLOW_UP">Follow-up</option>
              <option value="NOTE">Note</option>
            </select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input 
              id="title" 
              className="col-span-3" 
              placeholder="e.g., Discuss quarterly pricing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="desc" className="text-right mt-3">Notes</Label>
            <Textarea 
              id="desc" 
              className="col-span-3 h-24" 
              placeholder="Details about the interaction..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          {/* We would dynamically render payload-specific fields here based on `type` */}
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Activity</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
