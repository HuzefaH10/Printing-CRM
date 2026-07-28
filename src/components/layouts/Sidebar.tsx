"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  UserPlus, 
  Target, 
  FileText, 
  Factory, 
  PackageSearch, 
  BookOpen, 
  Gavel, 
  Files, 
  BarChart3, 
  CalendarDays, 
  CheckSquare, 
  Settings,
  Activity,
  ShoppingCart,
  DollarSign,
  ChevronDown,
  Briefcase
} from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

const NAV_GROUPS = [
  {
    group: "Overview",
    items: [
      { name: "Command Center", href: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    group: "Sales & CRM",
    items: [
      { name: "Prospects", href: "/sales/prospects", icon: Target },
      { name: "Companies", href: "/companies", icon: Building2 },
      { name: "Contacts", href: "/contacts", icon: Users },
      { name: "Leads", href: "/leads", icon: UserPlus },
      { name: "Opportunities", href: "/opportunities", icon: Target },
      { name: "Quotations", href: "/quotations", icon: FileText },
    ]
  },
  {
    group: "Operations",
    items: [
      { name: "Production", href: "/production", icon: Factory },
      { name: "Warehouse", href: "/inventory", icon: PackageSearch },
      { name: "Procurement", href: "/procurement", icon: ShoppingCart },
    ]
  },
  {
    group: "Finance",
    items: [
      { name: "Accounting", href: "/finance", icon: DollarSign },
    ]
  },
  {
    group: "Business Intelligence",
    items: [
      { name: "Tender Center", href: "/tenders", icon: Gavel },
      { name: "Knowledge Vault", href: "/knowledge", icon: BookOpen },
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
    ]
  },
  {
    group: "Workspace",
    items: [
      { name: "Activities", href: "/activities", icon: Activity },
      { name: "Calendar", href: "/calendar", icon: CalendarDays },
      { name: "Tasks", href: "/tasks", icon: CheckSquare },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] flex-shrink-0 border-r border-sidebar-border bg-sidebar h-full flex flex-col">
      {/* ── Workspace Switcher ── */}
      <div className="px-4 py-3 border-b border-sidebar-border h-[60px] flex items-center cursor-pointer hover:bg-white/[0.03] transition-colors duration-150">
        <div className="flex items-center gap-3 w-full">
          <div className="w-9 h-9 rounded-xl bg-primary/90 flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
            <span className="text-primary-foreground text-sm font-bold">OS</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <h1 className="font-semibold text-sm text-sidebar-foreground truncate leading-tight">Acme Print Co.</h1>
            <p className="text-[10px] text-sidebar-foreground/40 uppercase tracking-[0.12em] mt-0.5">Enterprise</p>
          </div>
          <ChevronDown className="w-4 h-4 text-sidebar-foreground/30 shrink-0" />
        </div>
      </div>

      {/* ── Navigation ── */}
      <div className="flex-1 overflow-y-auto py-5 scrollbar-thin">
        <nav className="space-y-6 px-3">
          {NAV_GROUPS.map((group) => (
            <div key={group.group}>
              <h4 className="px-3 text-[10px] font-semibold text-sidebar-foreground/35 uppercase tracking-[0.1em] mb-2">
                {group.group}
              </h4>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname.startsWith(item.href) && item.href !== "/" || (item.href === "/" && pathname === "/");
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group",
                        isActive 
                          ? "bg-primary/[0.12] text-primary" 
                          : "text-sidebar-foreground/60 hover:bg-white/[0.04] hover:text-sidebar-foreground/90"
                      )}
                    >
                      <item.icon className={cn(
                        "w-[18px] h-[18px] transition-colors duration-150 shrink-0", 
                        isActive ? "text-primary" : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70"
                      )} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* ── Footer / Settings ── */}
      <div className="p-3 border-t border-sidebar-border">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group",
            pathname.startsWith("/settings") 
              ? "bg-primary/[0.12] text-primary" 
              : "text-sidebar-foreground/60 hover:bg-white/[0.04] hover:text-sidebar-foreground/90"
          )}
        >
          <Settings className={cn(
            "w-[18px] h-[18px] transition-colors duration-150", 
            pathname.startsWith("/settings") ? "text-primary" : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70"
          )} />
          System Settings
        </Link>
      </div>
    </aside>
  );
}
