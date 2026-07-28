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
  Settings 
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Activities", href: "/activities", icon: CalendarDays },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Leads", href: "/leads", icon: UserPlus },
  { name: "Opportunities", href: "/opportunities", icon: Target },
  { name: "Quotations", href: "/quotations", icon: FileText },
  { name: "Production", href: "/production", icon: Factory },
  { name: "Inventory", href: "/inventory", icon: PackageSearch },
  { name: "Knowledge", href: "/knowledge", icon: BookOpen },
  { name: "Tender Center", href: "/tenders", icon: Gavel },
  { name: "Documents", href: "/documents", icon: Files },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-card h-full flex flex-col">
      <div className="p-6 border-b h-16 flex items-center">
        <h1 className="font-bold text-lg tracking-tight flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">OS</span>
          </div>
          Printing OS
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        <nav className="space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
