"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  ArrowLeft,
  Gavel,
  FileText,
  Clock,
  Building2,
  AlertTriangle,
  Upload,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Activity,
  Calculator,
  Calendar,
  Send,
  Award,
  BarChart,
  Settings,
  ClipboardList
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TenderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/tenders")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">National Textbook Printing Contract 2027</h2>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">IN_PROGRESS</Badge>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">HIGH_PRIORITY</Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Building2 className="w-4 h-4" /> Ministry of Education (TND-2608-001)
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">Duplicate</Button>
          <Button variant="default"><Send className="w-4 h-4 mr-2" /> Submit Bid</Button>
          <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Est. Contract Value</p>
              <p className="text-xl font-bold mt-1">$1,200,000</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Award className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Closing Date</p>
              <p className="text-xl font-bold mt-1 text-amber-600">4 Days</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Compliance</p>
              <p className="text-xl font-bold mt-1">8/12 Docs</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
              <FileText className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Est. Margin</p>
              <p className="text-xl font-bold mt-1">28%</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
              <BarChart className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-max justify-start border-b rounded-none h-auto p-0 bg-transparent mb-4 flex-nowrap">
            <TabsTrigger value="overview" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"><Gavel className="w-4 h-4 mr-2"/> Overview</TabsTrigger>
            <TabsTrigger value="requirements" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"><ClipboardList className="w-4 h-4 mr-2"/> Requirements</TabsTrigger>
            <TabsTrigger value="documents" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"><FileText className="w-4 h-4 mr-2"/> Documents</TabsTrigger>
            <TabsTrigger value="eligibility" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"><CheckCircle2 className="w-4 h-4 mr-2"/> Eligibility</TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"><Calendar className="w-4 h-4 mr-2"/> Timeline</TabsTrigger>
            <TabsTrigger value="activities" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"><Activity className="w-4 h-4 mr-2"/> Activities</TabsTrigger>
            <TabsTrigger value="quotations" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"><Calculator className="w-4 h-4 mr-2"/> Quotations</TabsTrigger>
            <TabsTrigger value="submission" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"><Send className="w-4 h-4 mr-2"/> Submission</TabsTrigger>
            <TabsTrigger value="evaluation" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"><FileText className="w-4 h-4 mr-2"/> Evaluation</TabsTrigger>
            <TabsTrigger value="award" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"><Award className="w-4 h-4 mr-2"/> Award</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"><BarChart className="w-4 h-4 mr-2"/> Analytics</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"><Settings className="w-4 h-4 mr-2"/> Settings</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tender Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-sm">Printing, binding, and national distribution of 5.2 million textbooks for the 2027 academic year. Requires FSC certified paper and high-speed web offset capacity.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Tender Type</p>
                      <p className="font-medium">Open Tender</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Category</p>
                      <p className="font-medium">Textbooks & Manuals</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Publication Date</p>
                      <p className="font-medium">July 15, 2026</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Submission Method</p>
                      <p className="font-medium">Government e-Portal + Physical Sample</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Critical Deadlines</CardTitle>
                  <Button variant="outline" size="sm"><Calendar className="w-4 h-4 mr-2"/> Add to Calendar</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500"></div>
                    <div className="flex-1">
                      <p className="font-medium">Clarification Questions Due</p>
                      <p className="text-sm text-muted-foreground">July 25, 2026 - Completed</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <div className="flex-1">
                      <p className="font-medium">Bid Submission Deadline</p>
                      <p className="text-sm font-bold text-blue-600">August 5, 2026 @ 14:00 GST</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-2 h-2 rounded-full bg-muted-foreground"></div>
                    <div className="flex-1">
                      <p className="font-medium">Commercial Opening</p>
                      <p className="text-sm text-muted-foreground">August 10, 2026</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" /> Document Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm">Trade License</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">VERIFIED</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm">ISO 9001 Certificate</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">VERIFIED</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm">Bid Bond (5%)</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px]">Upload</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm">FSC Chain of Custody</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px]">Upload</Button>
                  </div>
                  <Button className="w-full mt-2" variant="outline" size="sm">View All Documents</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Placeholders for remaining tabs */}
        <TabsContent value="requirements">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Detailed scope of work and technical specifications.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="documents">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><FileText className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Centralized document management for this tender.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="eligibility">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Eligibility requirements matrix and validation.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="timeline">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Chronological history of all bid events.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="activities">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><Activity className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Tasks, calls, and emails related to this tender.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="quotations">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><Calculator className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Linked quotation revisions estimating cost and profit.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="submission">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><Send className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Final submission package, portal receipts, and courier tracking.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="evaluation">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><Gavel className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Tracking technical scores, clarifications, and commercial ranking.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="award">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><Award className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Post-award analysis, contract details, and win/loss debriefing.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="analytics">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><BarChart className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Profitability simulations and competitive intelligence.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><Settings className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Tender configurations and team access control.</p></CardContent></Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
