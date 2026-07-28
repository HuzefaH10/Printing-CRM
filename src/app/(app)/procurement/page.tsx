"use client";

import React, { useState } from "react";
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
  ShoppingCart,
  FileText,
  Truck,
  Building2,
  TrendingUp,
  AlertCircle,
  Plus,
  Download,
  Clock,
  ShieldCheck,
  Search,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ProcurementDashboardPage() {
  const router = useRouter();
  
  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Procurement & Suppliers</h2>
          <p className="text-muted-foreground">Manage vendor relationships, purchase requests, and inbound supply chain.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" /> New Request
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Open Requests</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Pending Approval</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">8</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">In Transit</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-red-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">2</p>
              <p className="text-xs text-red-600/80 uppercase tracking-wider font-semibold">Delayed Deliveries</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="requests" className="w-full">
            <TabsList className="mb-4 w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger 
                value="requests" 
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-2"
              >
                Purchase Requests
              </TabsTrigger>
              <TabsTrigger 
                value="orders"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-2"
              >
                Purchase Orders
              </TabsTrigger>
              <TabsTrigger 
                value="suppliers"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-2"
              >
                Supplier Directory
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

            <TabsContent value="requests" className="mt-0">
              <Card>
                <CardContent className="p-0">
                  <div className="p-12 text-center text-muted-foreground border-b border-dashed">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <h3 className="font-medium text-foreground">Purchase Requests Table</h3>
                    <p className="text-sm mt-1">Listing of all internal PRs requiring approval.</p>
                  </div>
                  {/* Mock Request Item for UI */}
                  <div className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer border-b last:border-0 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                        PR
                      </div>
                      <div>
                        <p className="font-medium">PR-2408-001 <span className="font-normal text-muted-foreground ml-2">Production Shortage: Gloss Art 150GSM</span></p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center"><Building2 className="w-3 h-3 mr-1"/> Production Dept</span>
                          <span>•</span>
                          <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> Required: Aug 20, 2026</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div className="hidden md:block">
                        <p className="font-medium">$1,250.00</p>
                        <p className="text-xs text-muted-foreground">Est. Budget</p>
                      </div>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">MANAGER_APPROVAL</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="mt-0">
              <Card>
                <CardContent className="p-0">
                  <div className="p-12 text-center text-muted-foreground border-b border-dashed">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <h3 className="font-medium text-foreground">Purchase Orders Table</h3>
                    <p className="text-sm mt-1">Listing of all active and historical POs sent to suppliers.</p>
                  </div>
                  {/* Mock PO Item */}
                  <div className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer border-b last:border-0 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                        PO
                      </div>
                      <div>
                        <p className="font-medium">PO-2408-045 <span className="font-normal text-muted-foreground ml-2">Paper Supply Co.</span></p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> Expected: Tomorrow</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div className="hidden md:block">
                        <p className="font-medium">$4,500.00</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">IN TRANSIT</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="suppliers" className="mt-0">
              <Card>
                <CardContent className="p-0">
                  <div className="p-12 text-center text-muted-foreground border-b border-dashed">
                    <Building2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <h3 className="font-medium text-foreground">Supplier Directory</h3>
                    <p className="text-sm mt-1">Companies marked as isSupplier = true.</p>
                  </div>
                  {/* Mock Supplier Item */}
                  <div 
                    className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer border-b last:border-0 transition-colors"
                    onClick={() => router.push("/procurement/suppliers/mock-supplier-id")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center font-bold text-muted-foreground">
                        PS
                      </div>
                      <div>
                        <p className="font-medium">Paper Supply Co.</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Badge variant="secondary" className="text-[10px] h-4">Paper Mills</Badge>
                          <span>•</span>
                          <span>Net 30</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div className="hidden md:block text-right">
                        <div className="flex items-center justify-end text-emerald-600 gap-1 text-sm font-medium">
                          <ShieldCheck className="w-4 h-4" /> 98%
                        </div>
                        <p className="text-xs text-muted-foreground">Score</p>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
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
                <TrendingUp className="w-4 h-4 text-primary" /> Monthly Spend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">$124,500</p>
              <p className="text-sm text-emerald-600 flex items-center gap-1 mt-1 font-medium">
                <TrendingUp className="w-3 h-3" /> 12% vs last month
              </p>
              
              <div className="mt-6 space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Paper & Card</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Inks & Coatings</span>
                    <span className="font-medium">20%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "20%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Packaging</span>
                    <span className="font-medium">10%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: "10%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Top Suppliers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Paper Supply Co.</p>
                  <p className="text-xs text-muted-foreground">Paper Mills</p>
                </div>
                <Badge variant="secondary">$45k / mo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Ink Masters Ltd.</p>
                  <p className="text-xs text-muted-foreground">Ink Suppliers</p>
                </div>
                <Badge variant="secondary">$18k / mo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Global Packaging</p>
                  <p className="text-xs text-muted-foreground">Packaging</p>
                </div>
                <Badge variant="secondary">$12k / mo</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
