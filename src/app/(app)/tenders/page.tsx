"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Gavel,
  FileCheck,
  Building2,
  Clock,
  TrendingUp,
  AlertTriangle,
  Plus,
  Download,
  Calendar,
  CheckCircle2,
  Search,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function TenderCenterDashboard() {
  const router = useRouter();
  
  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tender Center</h2>
          <p className="text-muted-foreground">Manage RFQs, vendor registrations, and large enterprise bids.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" /> New Tender
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Gavel className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Tenders</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Closing This Week</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">45%</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Win Rate (YTD)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-red-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">2</p>
              <p className="text-xs text-red-600/80 uppercase tracking-wider font-semibold">Expiring Registrations</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="tenders" className="w-full">
            <TabsList className="mb-4 w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger 
                value="tenders" 
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-2"
              >
                Active Tenders
              </TabsTrigger>
              <TabsTrigger 
                value="registrations"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-2"
              >
                Vendor Registrations
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <TabsContent value="tenders" className="mt-0">
              <Card>
                <CardContent className="p-0">
                  <div className="p-12 text-center text-muted-foreground border-b border-dashed">
                    <Gavel className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <h3 className="font-medium text-foreground">Tenders Pipeline</h3>
                    <p className="text-sm mt-1">Listing of all active bids and RFQs.</p>
                  </div>
                  {/* Mock Tender Item for UI */}
                  <div 
                    className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer border-b last:border-0 transition-colors"
                    onClick={() => router.push("/tenders/TND-2608-001")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                        MoE
                      </div>
                      <div>
                        <p className="font-medium">National Textbook Printing Contract 2027</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center"><Building2 className="w-3 h-3 mr-1"/> Ministry of Education</span>
                          <span>•</span>
                          <span className="flex items-center text-amber-600 font-medium"><Clock className="w-3 h-3 mr-1"/> Closes in 4 days</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div className="hidden md:block">
                        <p className="font-medium">$1.2M</p>
                        <p className="text-xs text-muted-foreground">Est. Value</p>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">IN_PROGRESS</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="registrations" className="mt-0">
              <Card>
                <CardContent className="p-0">
                  <div className="p-12 text-center text-muted-foreground border-b border-dashed">
                    <FileCheck className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <h3 className="font-medium text-foreground">Vendor Registrations</h3>
                    <p className="text-sm mt-1">Track approvals and required compliance documents.</p>
                  </div>
                  {/* Mock Registration Item */}
                  <div className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer border-b last:border-0 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">National Bank - Approved Supplier</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center"><Calendar className="w-3 h-3 mr-1"/> Expires: Dec 31, 2026</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div className="hidden md:block">
                        <p className="font-medium text-emerald-600">100%</p>
                        <p className="text-xs text-muted-foreground">Compliance</p>
                      </div>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">APPROVED</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Pipeline Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">$3.4M</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                Across 12 active bids
              </p>
              
              <div className="mt-6 space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Government</span>
                    <span className="font-medium">60%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Corporate</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "30%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Banking</span>
                    <span className="font-medium">10%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: "10%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
