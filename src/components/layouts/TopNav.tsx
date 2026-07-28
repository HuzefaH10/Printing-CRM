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
    <header className="h-[60px] border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
      <div className="flex items-center gap-4 flex-1">
        
        {/* Mobile Menu Trigger Placeholder */}
        <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
          <Menu className="w-5 h-5" />
        </Button>

        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-muted-foreground/60 hover:text-foreground transition-colors duration-150 text-sm">Home</BreadcrumbLink>
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
                      <BreadcrumbPage className="font-semibold text-foreground text-sm">{title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={href} className="text-muted-foreground/60 hover:text-foreground transition-colors duration-150 text-sm">{title}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </div>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          className="w-64 justify-between text-muted-foreground/60 bg-muted/20 hover:bg-muted/40 hidden lg:flex border-border/40 h-9 px-3 transition-colors duration-150" 
          onClick={() => {
            document.dispatchEvent(new CustomEvent("open-command-palette"));
          }}
        >
          <span className="flex items-center gap-2 text-sm">
            <Search className="w-3.5 h-3.5" />
            <span className="font-normal text-[13px]">Search OS...</span>
          </span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/40 bg-background/80 px-1.5 font-mono text-[10px] font-medium text-muted-foreground/50">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 transition-all duration-150 h-9 w-9"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_0_2px_var(--background)]" />
        </Button>
        
        <div className="pl-2 border-l border-border/30 ml-1">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
