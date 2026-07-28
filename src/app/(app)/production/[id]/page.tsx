"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProductionJob } from "@/features/production/models/job";
import { ProductionService } from "@/features/production/services/production.service";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Download, Printer, Copy, AlertTriangle, FileText, Factory, Calendar, CheckSquare, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { JobStagesTracker } from "@/features/production/components/JobStagesTracker";

export default function ProductionJobPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [job, setJob] = useState<ProductionJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadJob();
  }, [id]);

  const loadJob = async () => {
    setIsLoading(true);
    try {
      const data = await ProductionService.getJobById(id);
      setJob(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!job) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-xl font-bold mb-2">Job Not Found</h2>
        <Button onClick={() => router.push("/production")}>Back to Dashboard</Button>
      </div>
    );
  }

  const isUrgent = job.dueDate && new Date(job.dueDate).getTime() < new Date().getTime() + (48 * 60 * 60 * 1000);

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <Button variant="ghost" size="sm" onClick={() => router.push("/production")} className="-ml-3">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm"><Printer className="w-4 h-4 mr-2" /> Job Ticket</Button>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Delivery Note</Button>
          <Button variant="outline" size="sm"><Copy className="w-4 h-4 mr-2" /> Duplicate</Button>
          <Button size="sm" variant="secondary"><Settings className="w-4 h-4 mr-2" /> Settings</Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm p-6 flex flex-col md:flex-row gap-6 justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{job.jobNumber}</h1>
            <Badge variant="outline" className="text-sm">{job.status}</Badge>
            {job.priority === "Rush" && <Badge variant="destructive">RUSH</Badge>}
          </div>
          <p className="text-lg text-muted-foreground">{job.jobName}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Deadline</p>
          <div className="flex items-center justify-end gap-2">
            {isUrgent && <AlertTriangle className="w-5 h-5 text-red-500" />}
            <p className={`text-2xl font-bold ${isUrgent ? 'text-red-600' : ''}`}>
              {job.dueDate ? new Date(job.dueDate).toLocaleDateString() : 'Not Set'}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="stages" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products & Artwork</TabsTrigger>
          <TabsTrigger value="stages">Production Stages</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="qc">Quality Control</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground py-24">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Job Overview details go here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground py-24">
              <p>Products and Artwork Management editor goes here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stages">
          <JobStagesTracker job={job} />
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground py-24">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Production Schedule integration placeholder.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="qc">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground py-24">
              <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Quality Control Inspection checklists go here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="delivery">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground py-24">
              <Factory className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Delivery logistics tracking and Proof of Delivery goes here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground py-24">
              <p>Activity Engine Integration placeholder.</p>
              <p className="text-xs mt-2">The Universal Activity Engine will render a timeline tracking every step of this production job.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
