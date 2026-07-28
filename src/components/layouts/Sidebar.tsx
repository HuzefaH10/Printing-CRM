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
  // For a fully resizable sidebar, you'd use framer-motion and react-use-measure, but we will stick to collapsible groups for now.

  return (
    <aside className="w-[260px] flex-shrink-0 border-r bg-card/50 backdrop-blur-xl h-full flex flex-col transition-all duration-300">
      {/* Workspace Switcher Placeholder */}
      <div className="p-4 border-b h-[60px] flex items-center cursor-pointer hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3 w-full">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-primary-foreground text-sm font-bold">OS</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <h1 className="font-semibold text-sm truncate">Acme Print Co.</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Enterprise</p>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        <nav className="space-y-6 px-3">
          {NAV_GROUPS.map((group) => (
            <div key={group.group}>
              <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
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
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group",
                        isActive 
                          ? "bg-primary/10 text-primary shadow-sm" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className={cn(
                        "w-4 h-4 transition-colors", 
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
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

      {/* Footer / Settings */}
      <div className="p-4 border-t bg-card/50">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group",
            pathname.startsWith("/settings") 
              ? "bg-primary/10 text-primary shadow-sm" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings className={cn(
            "w-4 h-4 transition-colors", 
            pathname.startsWith("/settings") ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          )} />
          System Settings
        </Link>
      </div>
    </aside>
  );
}
