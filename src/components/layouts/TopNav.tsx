"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { UserMenu } from "./UserMenu";

export function TopNav() {
  const pathname = usePathname();

  // Basic breadcrumb generation based on path
  const pathSegments = pathname.split("/").filter(Boolean);

  return (
    <header className="h-[60px] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
      <div className="flex items-center gap-4 flex-1">
        
        {/* Mobile Menu Trigger Placeholder */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>

        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="hover:text-foreground transition-colors">Home</BreadcrumbLink>
            </BreadcrumbItem>
            {pathSegments.length > 0 && <BreadcrumbSeparator />}
            {pathSegments.map((segment, index) => {
              const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
              const isLast = index === pathSegments.length - 1;
              const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
              
              return (
                <div key={href} className="flex items-center gap-2">
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="font-semibold text-foreground">{title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={href} className="hover:text-foreground transition-colors">{title}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </div>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          className="w-64 justify-between text-muted-foreground shadow-sm bg-muted/40 hover:bg-muted/80 hidden lg:flex border-muted/50 h-9 px-3" 
          onClick={() => {
            // Trigger command palette (handled by OS keydown listener in GlobalCommandPalette)
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
          }}
        >
          <span className="flex items-center gap-2 text-sm">
            <Search className="w-4 h-4" />
            <span className="font-normal">Search OS...</span>
          </span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 shadow-sm">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground transition-colors h-9 w-9">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_0_2px_var(--background)]"></span>
        </Button>
        
        <div className="pl-2 border-l ml-1">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
