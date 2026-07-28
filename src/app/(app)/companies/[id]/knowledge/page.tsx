"use client";

import React from "react";
import { useParams } from "next/navigation";
import { NotesContainer } from "@/features/core/notes/NotesContainer";

export default function CompanyKnowledgePage() {
  const params = useParams();
  const id = params?.id as string;
  
  if (!id) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight mb-2">Knowledge Vault</h2>
          <p className="text-sm text-muted-foreground">Store notes, documents, certificates, and critical knowledge for this company.</p>
        </div>
        
        {/* We use the universal Notes system built previously */}
        <NotesContainer entityId={id} entityType="company" />
      </div>
      
      <div className="space-y-6">
        <div className="bg-card border shadow-sm rounded-xl p-6">
          <h3 className="font-semibold tracking-tight text-lg mb-4 border-b border-border pb-4">Attachments</h3>
          <p className="text-sm text-muted-foreground mb-4">No attachments uploaded yet.</p>
          <button className="w-full py-2 border border-dashed rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors">
            Upload Document
          </button>
        </div>
      </div>
    </div>
  );
}
