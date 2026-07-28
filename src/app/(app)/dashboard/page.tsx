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

/* ── Custom Recharts Tooltip ── */
interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#1a1a1a] px-4 py-3 shadow-2xl">
      <p className="text-xs font-medium text-white/50 mb-2">{label}</p>
      {payload.map((entry: TooltipPayloadEntry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-white/70 capitalize">{entry.name}:</span>
          <span className="font-semibold text-white tabular-nums">
            {entry.dataKey === "efficiency" || entry.dataKey === "waste"
              ? `${entry.value}%`
              : `${(entry.value / 1000).toFixed(0)}k KWD`}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8 pb-12 max-w-[1600px] mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold tracking-[-0.025em] text-foreground">
            Executive Command Center
          </h2>
          <p className="text-muted-foreground mt-1 text-[15px]">
            Real-time visibility across all business units.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64 hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Global Executive Search..."
              className="pl-9 bg-muted/30 border-border/40 h-9 text-sm placeholder:text-muted-foreground/60"
            />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 border-border/40 hover:bg-muted/60">
            <BellRing className="h-4 w-4" />
          </Button>
          <Button className="h-9 shadow-md shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" /> Quick Create
          </Button>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start bg-transparent border-b border-border/50 rounded-none h-auto p-0 pb-0 mb-6 flex-wrap gap-1">
          {[
            { value: "overview", icon: LayoutDashboard, label: "Executive Home" },
            { value: "sales", icon: Target, label: "Sales & Customers" },
            { value: "production", icon: Factory, label: "Production" },
            { value: "warehouse", icon: PackageSearch, label: "Warehouse" },
            { value: "finance", icon: DollarSign, label: "Finance" },
            { value: "tenders", icon: Gavel, label: "Tenders" },
            { value: "timeline", icon: Activity, label: "Timeline" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="
                rounded-lg rounded-b-none px-4 py-2.5 text-sm font-medium
                text-muted-foreground/80
                transition-all duration-200
                data-[state=active]:bg-primary/[0.12]
                data-[state=active]:text-primary
                data-[state=active]:shadow-[inset_0_-2px_0_0_var(--primary)]
                hover:text-foreground hover:bg-muted/40
                border-b-2 border-b-transparent
                data-[state=active]:border-b-primary
              "
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ══════ OVERVIEW TAB ══════ */}
        <TabsContent value="overview" className="mt-0 space-y-8">

          {/* ── Top KPI Row ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Health Score */}
            <div className="card-elevated rounded-xl p-5 cursor-pointer group hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-[0.08em] mb-2">
                    Health Score
                  </p>
                  <h3 className="text-4xl font-extrabold tabular-nums text-primary leading-none">
                    92
                    <span className="text-sm font-normal text-muted-foreground/50 ml-1">/ 100</span>
                  </h3>
                </div>
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-sm">
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold tabular-nums">+2 pts</span>
                <span className="text-muted-foreground/50 ml-1 text-xs">from last month</span>
              </div>
            </div>

            {/* Monthly Revenue */}
            <div className="card-elevated rounded-xl p-5 cursor-pointer group hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-[0.08em] mb-2">
                    Monthly Revenue
                  </p>
                  <h3 className="text-4xl font-extrabold tabular-nums text-foreground leading-none">
                    620k KWD
                  </h3>
                </div>
                <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-sm">
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold tabular-nums">+6.9%</span>
                <span className="text-muted-foreground/50 ml-1 text-xs">vs target (580k KWD)</span>
              </div>
            </div>

            {/* Active Pipeline */}
            <div className="card-elevated rounded-xl p-5 cursor-pointer group hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-[0.08em] mb-2">
                    Active Pipeline
                  </p>
                  <h3 className="text-4xl font-extrabold tabular-nums text-foreground leading-none">
                    2.4M KWD
                  </h3>
                </div>
                <div className="w-11 h-11 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-sm">
                <span className="text-muted-foreground/70 font-medium tabular-nums">18</span>
                <span className="text-muted-foreground/50 text-xs">Open Opportunities</span>
              </div>
            </div>

            {/* Production Delay */}
            <div className="card-elevated rounded-xl p-5 cursor-pointer group hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-[0.08em] mb-2">
                    Production Delay
                  </p>
                  <h3 className="text-4xl font-extrabold tabular-nums text-red-400 leading-none">
                    3 Jobs
                  </h3>
                </div>
                <div className="w-11 h-11 bg-red-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-sm">
                <ArrowDownRight className="w-4 h-4 text-red-400" />
                <span className="text-red-400 font-semibold">Critical</span>
                <span className="text-muted-foreground/50 ml-1 text-xs">requires attention</span>
              </div>
            </div>
          </div>

          {/* ── Charts Row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Revenue & Profit Trend */}
            <Card className="lg:col-span-2 card-elevated border-0 rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-1 px-6 pt-5">
                <div>
                  <CardTitle className="text-[15px] font-semibold text-foreground">Revenue & Profit Trend</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground/60 mt-0.5">YTD performance across all business units</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/50 hover:text-foreground">
                  <MoreVertical className="w-4 h-4"/>
                </Button>
              </CardHeader>
              <CardContent className="px-6 pb-5">
                <div className="h-[300px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25}/>
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }}
                        tickFormatter={(value) => `${value/1000}k`}
                        width={55}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: '#3b82f6', fill: '#1a1a1a' }} />
                      <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProf)" dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: '#10b981', fill: '#1a1a1a' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Alert Center */}
            <Card className="card-elevated border-0 rounded-xl flex flex-col">
              <CardHeader className="pb-1 px-6 pt-5">
                <CardTitle className="text-[15px] font-semibold text-foreground">Alert Center</CardTitle>
                <CardDescription className="text-xs text-muted-foreground/60 mt-0.5">Items requiring executive review</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3 overflow-y-auto px-6 pb-5 pt-3 scrollbar-thin">

                {/* Critical Alert */}
                <div className="p-3.5 bg-red-500/[0.06] border border-red-500/[0.12] border-l-4 border-l-red-500 rounded-lg flex gap-3 transition-colors duration-150 hover:bg-red-500/[0.1]">
                  <AlertTriangle className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-red-300">Cash Flow Warning</p>
                    <p className="text-xs text-red-400/70 mt-0.5 leading-relaxed">2 major clients are &gt;60 days overdue on 140k KWD.</p>
                  </div>
                </div>
                
                {/* Warning Alert */}
                <div className="p-3.5 bg-amber-500/[0.06] border border-amber-500/[0.12] border-l-4 border-l-amber-500 rounded-lg flex gap-3 transition-colors duration-150 hover:bg-amber-500/[0.1]">
                  <Clock className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-amber-300">ISO 9001 Expiring</p>
                    <p className="text-xs text-amber-400/70 mt-0.5 leading-relaxed">Quality cert expires in 14 days. Blocks 2 tenders.</p>
                  </div>
                </div>

                {/* Info Alert */}
                <div className="p-3.5 bg-blue-500/[0.06] border border-blue-500/[0.12] border-l-4 border-l-blue-500 rounded-lg flex gap-3 transition-colors duration-150 hover:bg-blue-500/[0.1]">
                  <Gavel className="w-4.5 h-4.5 text-blue-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-blue-300">Tender Submission</p>
                    <p className="text-xs text-blue-400/70 mt-0.5 leading-relaxed">Ministry of Ed bid requires CEO sign-off today.</p>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full mt-auto text-xs border-border/40 hover:bg-muted/40 h-8">
                  View All 12 Alerts
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* ── Bottom Charts Row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Production Efficiency */}
            <Card className="card-elevated border-0 rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-1 px-6 pt-5">
                <div>
                  <CardTitle className="text-[15px] font-semibold text-foreground">Production Efficiency</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground/60 mt-0.5">OEE and Waste Analysis this week</CardDescription>
                </div>
                <Badge variant="outline" className="bg-emerald-500/[0.08] text-emerald-400 border-emerald-500/20 text-[11px] font-medium">
                  Healthy
                </Badge>
              </CardHeader>
              <CardContent className="px-6 pb-5">
                <div className="h-[250px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productionData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} dy={10} />
                      <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Bar yAxisId="left" dataKey="efficiency" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={28} />
                      <Bar yAxisId="right" dataKey="waste" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={28} opacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Customer Distribution */}
            <Card className="card-elevated border-0 rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-1 px-6 pt-5">
                <div>
                  <CardTitle className="text-[15px] font-semibold text-foreground">Customer Distribution</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground/60 mt-0.5">Revenue by sector YTD</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/50 hover:text-foreground">
                  <MoreVertical className="w-4 h-4"/>
                </Button>
              </CardHeader>
              <CardContent className="flex items-center justify-center gap-8 px-6 pb-5">
                <div className="h-[220px] w-[220px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customerData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {customerData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3.5 min-w-0">
                  {customerData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-3 text-sm">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="font-medium text-foreground/80 truncate">{entry.name}</span>
                      <span className="text-muted-foreground/60 ml-auto tabular-nums font-medium">{entry.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Placeholder Tabs ── */}
        {[
          { value: "sales", icon: Target, title: "Sales Intelligence", desc: "Pipeline funnels, Win/Loss analysis, and Rep performance." },
          { value: "production", icon: Factory, title: "Production Intelligence", desc: "Machine utilization, Job bottlenecks, and Delivery performance." },
          { value: "warehouse", icon: PackageSearch, title: "Warehouse Intelligence", desc: "Dead stock, Turnover ratios, and Material consumption." },
          { value: "finance", icon: DollarSign, title: "Finance Intelligence", desc: "Cash collection efficiency, Overdue invoices, and Credit exposure." },
          { value: "tenders", icon: Gavel, title: "Tender Intelligence", desc: "Registration renewals, Win rate, and Award analysis." },
          { value: "timeline", icon: Activity, title: "Executive Timeline", desc: "Unified chronological feed of every significant action across the company." },
        ].map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <div className="card-elevated rounded-xl p-24 text-center">
              <tab.icon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/20" />
              <p className="font-semibold text-foreground mb-1">{tab.title}</p>
              <p className="text-muted-foreground/60 text-sm max-w-md mx-auto">{tab.desc}</p>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
