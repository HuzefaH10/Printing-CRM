"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
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
  const { setTheme, theme } = useTheme();

  // Basic breadcrumb generation based on path
  const pathSegments = pathname.split("/").filter(Boolean);

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            {pathSegments.length > 0 && <BreadcrumbSeparator />}
            {pathSegments.map((segment, index) => {
              const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
              const isLast = index === pathSegments.length - 1;
              const title = segment.charAt(0).toUpperCase() + segment.slice(1);
              
              return (
                <div key={href} className="flex items-center gap-2">
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={href}>{title}</BreadcrumbLink>
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
        <Button variant="outline" className="w-64 justify-start text-muted-foreground shadow-sm bg-muted/50 hidden md:flex" onClick={() => {
            // Placeholder for Command Palette Trigger
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
        }}>
          <Search className="w-4 h-4 mr-2" />
          Search everything...
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        <Button variant="ghost" size="icon" className="relative mr-2">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive border-2 border-background"></span>
        </Button>
        
        <UserMenu />
      </div>
    </header>
  );
}
