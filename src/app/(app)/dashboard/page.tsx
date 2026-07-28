"use client";

import React from "react";
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
  LayoutDashboard,
  TrendingUp,
  Target,
  Factory,
  PackageSearch,
  DollarSign,
  Gavel,
  BookOpen,
  BellRing,
  Activity,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  Settings,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";

// Mock Data for Charts
const revenueData = [
  { month: "Jan", revenue: 420000, profit: 98000 },
  { month: "Feb", revenue: 450000, profit: 105000 },
  { month: "Mar", revenue: 510000, profit: 122000 },
  { month: "Apr", revenue: 490000, profit: 115000 },
  { month: "May", revenue: 580000, profit: 140000 },
  { month: "Jun", revenue: 620000, profit: 155000 },
];

const productionData = [
  { day: "Mon", efficiency: 82, waste: 4 },
  { day: "Tue", efficiency: 88, waste: 3 },
  { day: "Wed", efficiency: 91, waste: 2 },
  { day: "Thu", efficiency: 85, waste: 4 },
  { day: "Fri", efficiency: 94, waste: 2 },
];

const customerData = [
  { name: "Government", value: 45 },
  { name: "Corporate", value: 30 },
  { name: "Education", value: 15 },
  { name: "Other", value: 10 },
];
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#64748b"];

export default function DashboardPage() {
  return (
    <div className="space-y-6 pb-12 max-w-[1600px] mx-auto">
      {/* Global Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Executive Command Center</h2>
          <p className="text-muted-foreground">Real-time visibility across all business units.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64 hidden lg:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Global Executive Search..." className="pl-8 bg-background" />
          </div>
          <Button variant="outline" size="icon">
            <BellRing className="h-4 w-4" />
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Quick Create
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-max justify-start border-b rounded-none h-auto p-0 bg-transparent mb-4 flex-nowrap">
            <TabsTrigger value="overview" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"><LayoutDashboard className="w-4 h-4 mr-2"/> Executive Home</TabsTrigger>
            <TabsTrigger value="sales" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"><Target className="w-4 h-4 mr-2"/> Sales & Customers</TabsTrigger>
            <TabsTrigger value="production" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"><Factory className="w-4 h-4 mr-2"/> Production</TabsTrigger>
            <TabsTrigger value="warehouse" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"><PackageSearch className="w-4 h-4 mr-2"/> Warehouse</TabsTrigger>
            <TabsTrigger value="finance" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"><DollarSign className="w-4 h-4 mr-2"/> Finance</TabsTrigger>
            <TabsTrigger value="tenders" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"><Gavel className="w-4 h-4 mr-2"/> Tenders</TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"><Activity className="w-4 h-4 mr-2"/> Timeline</TabsTrigger>
          </TabsList>
        </div>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="mt-0 space-y-6">
          {/* Top KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer group shadow-sm">
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Health Score</p>
                    <h3 className="text-3xl font-bold text-primary flex items-end gap-2">
                      92 <span className="text-sm font-normal text-muted-foreground pb-1">/ 100</span>
                    </h3>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpRight className="w-4 h-4 text-emerald-500 mr-1" />
                  <span className="text-emerald-500 font-medium">+2 pts</span>
                  <span className="text-muted-foreground ml-2">from last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:border-primary/50 transition-colors cursor-pointer group shadow-sm">
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Monthly Revenue</p>
                    <h3 className="text-3xl font-bold flex items-end gap-2">
                      $620k
                    </h3>
                  </div>
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpRight className="w-4 h-4 text-emerald-500 mr-1" />
                  <span className="text-emerald-500 font-medium">+6.9%</span>
                  <span className="text-muted-foreground ml-2">vs target ($580k)</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-colors cursor-pointer group shadow-sm">
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Active Pipeline</p>
                    <h3 className="text-3xl font-bold flex items-end gap-2">
                      $2.4M
                    </h3>
                  </div>
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-muted-foreground font-medium">18</span>
                  <span className="text-muted-foreground ml-1">Open Opportunities</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-colors cursor-pointer group shadow-sm">
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Production Delay</p>
                    <h3 className="text-3xl font-bold text-red-600 flex items-end gap-2">
                      3 Jobs
                    </h3>
                  </div>
                  <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-red-500 font-medium">Critical</span>
                  <span className="text-muted-foreground ml-2">requires attention</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base font-semibold">Revenue & Profit Trend</CardTitle>
                  <CardDescription>YTD performance across all business units</CardDescription>
                </div>
                <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4"/></Button>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={(value) => `$${value/1000}k`} />
                      <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                      <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProf)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Alert Center</CardTitle>
                <CardDescription>Items requiring executive review</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3 overflow-y-auto">
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">Cash Flow Warning</p>
                    <p className="text-xs text-red-600/80 mt-1">2 major clients are &gt;60 days overdue on $140k.</p>
                  </div>
                </div>
                
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-3">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-700">ISO 9001 Expiring</p>
                    <p className="text-xs text-amber-600/80 mt-1">Quality cert expires in 14 days. Blocks 2 tenders.</p>
                  </div>
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-3">
                  <Gavel className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-700">Tender Submission</p>
                    <p className="text-xs text-blue-600/80 mt-1">Ministry of Ed bid requires CEO sign-off today.</p>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full mt-auto text-xs">View All 12 Alerts</Button>
              </CardContent>
            </Card>
          </div>

          {/* Activity / Department Drill Down */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base font-semibold">Production Efficiency</CardTitle>
                  <CardDescription>OEE and Waste Analysis this week</CardDescription>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700">Healthy</Badge>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productionData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
                      <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} />
                      <Bar yAxisId="left" dataKey="efficiency" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                      <Bar yAxisId="right" dataKey="waste" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base font-semibold">Customer Distribution</CardTitle>
                  <CardDescription>Revenue by sector YTD</CardDescription>
                </div>
                <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4"/></Button>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <div className="h-[250px] w-full max-w-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customerData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {customerData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius: '8px'}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {customerData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="font-medium">{entry.name}</span>
                      <span className="text-muted-foreground ml-auto">{entry.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Placeholders for deep dive tabs */}
        <TabsContent value="sales">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><Target className="w-12 h-12 mx-auto mb-4 opacity-20" /><p className="font-medium text-foreground mb-1">Sales Intelligence</p><p>Pipeline funnels, Win/Loss analysis, and Rep performance.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="production">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><Factory className="w-12 h-12 mx-auto mb-4 opacity-20" /><p className="font-medium text-foreground mb-1">Production Intelligence</p><p>Machine utilization, Job bottlenecks, and Delivery performance.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="warehouse">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><PackageSearch className="w-12 h-12 mx-auto mb-4 opacity-20" /><p className="font-medium text-foreground mb-1">Warehouse Intelligence</p><p>Dead stock, Turnover ratios, and Material consumption.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="finance">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><DollarSign className="w-12 h-12 mx-auto mb-4 opacity-20" /><p className="font-medium text-foreground mb-1">Finance Intelligence</p><p>Cash collection efficiency, Overdue invoices, and Credit exposure.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="tenders">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><Gavel className="w-12 h-12 mx-auto mb-4 opacity-20" /><p className="font-medium text-foreground mb-1">Tender Intelligence</p><p>Registration renewals, Win rate, and Award analysis.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="timeline">
          <Card><CardContent className="p-24 text-center text-muted-foreground"><Activity className="w-12 h-12 mx-auto mb-4 opacity-20" /><p className="font-medium text-foreground mb-1">Executive Timeline</p><p>Unified chronological feed of every significant action across the company.</p></CardContent></Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
