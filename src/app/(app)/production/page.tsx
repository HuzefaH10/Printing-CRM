"use client";

import React, { useEffect, useState } from "react";
import { ProductionJob } from "@/features/production/models/job";
import { productionRepo } from "@/features/production/services/production.repository";
import { ProductionJobListTable } from "@/features/production/components/ProductionJobListTable";
import { Button } from "@/components/ui/button";
import { Plus, Download, Printer, Factory, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProductionPage() {
  const [jobs, setJobs] = useState<ProductionJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const { data } = await productionRepo.list();
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeJobs = jobs.filter(j => j.status !== "Delivered" && j.status !== "Cancelled" && j.status !== "Completed");
  const delayedJobs = activeJobs.filter(j => j.status === "Delayed" || (j.dueDate && new Date(j.dueDate).getTime() < new Date().getTime()));
  const prepressJobs = activeJobs.filter(j => j.status === "Waiting" || j.status === "In Prepress");
  const productionJobs = activeJobs.filter(j => j.status === "In Printing" || j.status === "In Finishing" || j.status === "In Quality Control");
  const dispatchJobs = activeJobs.filter(j => j.status === "Ready for Dispatch");

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Production & Jobs</h2>
          <p className="text-muted-foreground">Manage your factory floor, track jobs, and ensure on-time delivery.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" /> Create Job
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Factory className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{activeJobs.length}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Jobs</p>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
            <Printer className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{prepressJobs.length}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Prepress</p>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{productionJobs.length}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">In Production</p>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{dispatchJobs.length}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Dispatch</p>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4 shadow-sm flex items-center gap-4 border-l-4 border-l-red-500">
          <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{delayedJobs.length}</p>
            <p className="text-xs text-red-600/80 uppercase tracking-wider font-semibold">Delayed</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <ProductionJobListTable jobs={activeJobs} isLoading={isLoading} />
      </div>
    </div>
  );
}
