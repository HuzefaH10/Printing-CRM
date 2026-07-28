"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Building2,
  ShoppingCart,
  FileText,
  Truck,
  TrendingUp,
  History,
  Activity,
  Award,
  Paperclip,
  Settings,
  Mail,
  Phone,
  Globe,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PackageSearch
} from "lucide-react";

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  // Mock data since we're using a unified Company model where isSupplier = true
  const supplierName = "Paper Supply Co.";

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/procurement")}
          className="-ml-3"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" /> New Request
          </Button>
          <Button variant="outline" size="sm">
            <ShoppingCart className="w-4 h-4 mr-2" /> New PO
          </Button>
          <Button variant="secondary" size="sm">
            <Settings className="w-4 h-4 mr-2" /> Settings
          </Button>
        </div>
      </div>

      {/* Supplier Profile Card */}
      <div className="bg-card rounded-lg border shadow-sm p-6 flex flex-col md:flex-row gap-6 justify-between items-start">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {supplierName}
              </h1>
              <Badge variant="secondary">Paper Mills</Badge>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Preferred
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" /> orders@papersupply.co
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" /> +1 (555) 123-4567
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4" /> www.papersupply.co
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> Seattle, WA
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-right shrink-0">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              Score
            </p>
            <p className="text-2xl font-bold text-emerald-600">98%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              Lead Time
            </p>
            <p className="text-2xl font-bold">5d</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              Open POs
            </p>
            <p className="text-2xl font-bold text-blue-600">3</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              YTD Spend
            </p>
            <p className="text-2xl font-bold">$142k</p>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="purchase_orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="requests">Purchase Requests</TabsTrigger>
          <TabsTrigger value="price_history">Price History</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Items</TabsTrigger>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Supplier Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Vendor Code</span>
                      <span className="text-sm">VEN-00124</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Tax Number</span>
                      <span className="text-sm">US-882194</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Supplier Type</span>
                      <span className="text-sm">MANUFACTURER</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Credit Limit</span>
                      <span className="text-sm">$50,000.00</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Payment Terms</span>
                      <span className="text-sm">Net 30</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Primary Contact</span>
                      <span className="text-sm">Sarah Jenkins</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Procurement Activity</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-4 border-b flex items-center justify-between hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Goods Received: GRN-2408-012</p>
                        <p className="text-xs text-muted-foreground">Today at 10:30 AM</p>
                      </div>
                    </div>
                    <Badge variant="outline">Completed</Badge>
                  </div>
                  <div className="p-4 flex items-center justify-between hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                        <ShoppingCart className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">PO Created: PO-2408-045</p>
                        <p className="text-xs text-muted-foreground">Yesterday at 3:15 PM</p>
                      </div>
                    </div>
                    <Badge variant="outline">In Transit</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Performance Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">On-Time Delivery</span>
                      <span className="font-medium">96%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: "96%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Quality Rating</span>
                      <span className="font-medium">99%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: "99%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Price Competitiveness</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm flex gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      Defect rate increased by 0.5% in the last 30 days.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab Placeholders */}
        <TabsContent value="purchase_orders">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Purchase Orders list will appear here.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="requests">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><FileText className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Internal Purchase Requests linked to this supplier.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="price_history">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Historical pricing and trends across all purchased items.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="inventory">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><PackageSearch className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Inventory items supplied by this vendor.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="deliveries">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><Truck className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Goods Receipt Notes and delivery tracking.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="timeline">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><History className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Universal Activity Engine Timeline integration.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="activities">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><Activity className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Tasks, calls, and meetings log.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="performance">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><Award className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Detailed vendor scorecards and performance metrics.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="documents">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><FileText className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Contracts, NDAs, and SLAs.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="attachments">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><Paperclip className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>General file attachments.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="analytics">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Spend analysis and savings opportunities.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><Settings className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Supplier configuration and API integrations.</p></CardContent></Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
