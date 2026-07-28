import React from "react";

interface NotesContainerProps {
  entityId: string;
  entityType: string;
}

export function NotesContainer({ entityId, entityType }: NotesContainerProps) {
  return (
    <div className="bg-card border shadow-sm rounded-xl p-6">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
        <h3 className="font-semibold tracking-tight text-lg">Notes</h3>
        <button className="text-sm font-medium text-primary hover:underline">Add Note</button>
      </div>
      
      <div className="text-sm text-muted-foreground py-8 text-center border border-dashed rounded-lg">
        No notes have been added to this {entityType} yet.
      </div>
    </div>
  );
}
