"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  FileText,
  CreditCard,
  PieChart,
  TrendingUp,
  AlertTriangle,
  Plus,
  Download,
  Calendar,
  History,
  Activity,
  Settings,
  AlertCircle,
  Briefcase
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function FinanceDashboardPage() {
  
  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Finance & Receivables</h2>
          <p className="text-muted-foreground">Manage invoices, cash flow, credit risk, and collections.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" /> New Invoice
          </Button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">$142,500</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Outstanding Receivables</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">$68,200</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Collected MTD</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">42 Days</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Avg. Collection Period</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-red-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">$18,400</p>
              <p className="text-xs text-red-600/80 uppercase tracking-wider font-semibold">Overdue Invoices</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Interface */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto bg-transparent border-b rounded-none w-full justify-start p-0">
          <TabsTrigger value="overview" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-2">Overview</TabsTrigger>
          <TabsTrigger value="invoices" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-2">Invoices</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-2">Payments</TabsTrigger>
          <TabsTrigger value="receivables" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-2">Receivables Aging</TabsTrigger>
          <TabsTrigger value="credit" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-2">Credit Control</TabsTrigger>
          <TabsTrigger value="collections" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-2">Collections</TabsTrigger>
          <TabsTrigger value="profitability" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-2">Profitability</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-2">Analytics</TabsTrigger>
          <TabsTrigger value="timeline" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-2">Timeline</TabsTrigger>
          <TabsTrigger value="settings" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-2">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">Invoices Due Today</CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs h-7">View All</Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-4 border-b flex items-center justify-between hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">INV-2608-012</p>
                        <p className="text-xs text-muted-foreground">Acme Corp</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$12,500</p>
                      <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700">ISSUED</Badge>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">INV-2607-099</p>
                        <p className="text-xs text-muted-foreground">Globex Inc.</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">$8,200</p>
                      <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200">14 DAYS LATE</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">Recent Payments</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-4 border-b flex items-center justify-between hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">TechCorp Holdings</p>
                        <p className="text-xs text-muted-foreground">Bank Transfer • Ref: TR-991</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-emerald-600">+$4,100</p>
                      <p className="text-xs text-muted-foreground">Today, 10:45 AM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-primary" /> Monthly Profit Margin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">34.2%</p>
                  <p className="text-sm text-emerald-600 flex items-center gap-1 mt-1 font-medium">
                    <TrendingUp className="w-3 h-3" /> +2.1% vs last month
                  </p>
                  
                  <div className="mt-6 space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Gross Revenue</span>
                        <span className="font-medium">$214,000</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">COGS</span>
                        <span className="font-medium text-red-500">-$140,808</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm font-bold">
                        <span>Gross Profit</span>
                        <span className="text-emerald-600">$73,192</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" /> High Risk Accounts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Wayne Enterprises</p>
                      <p className="text-xs text-muted-foreground">Over 60 days past due</p>
                    </div>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">HOLD</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab Placeholders */}
        <TabsContent value="invoices">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><FileText className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Comprehensive invoice ledger and creation workflow.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="payments">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><DollarSign className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Payment recording and reconciliation.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="receivables">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Aging reports (30, 60, 90+ days) and outstanding balances.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="credit">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><CreditCard className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Customer credit limit utilization and holds.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="collections">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Collection queues, call logs, and promise-to-pay tracking.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="profitability">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Job-level and customer-level profitability analysis.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="analytics">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><PieChart className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Financial trend charts and reporting.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="timeline">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><History className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Universal timeline showing all financial events.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><Settings className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Tax rates, default payment terms, and currency settings.</p></CardContent></Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
