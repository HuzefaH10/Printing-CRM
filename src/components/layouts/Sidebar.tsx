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
  Briefcase,
  Trash2,
  GripVertical
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

import { stockCategoryRepo } from "@/features/inventory/services/stock.repository";
import { StockCategory } from "@/features/inventory/models/stock";
import { ChevronRight, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

function SortableCategoryItem({ cat, pathname, onDelete }: { cat: StockCategory, pathname: string, onDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: cat.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center group/item relative">
      <button 
        {...attributes} 
        {...listeners}
        className="opacity-0 group-hover/item:opacity-100 absolute -left-2 p-1 text-sidebar-foreground/40 hover:text-sidebar-foreground transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-3 h-3" />
      </button>
      <Link
        href={`/inventory/stock/${cat.id}`}
        className={cn(
          "flex-1 block py-1.5 px-2 rounded-md text-xs transition-colors",
          pathname === `/inventory/stock/${cat.id}`
            ? "text-primary font-medium bg-primary/10"
            : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-white/5"
        )}
      >
        {cat.name}
      </Link>
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(cat.id!); }}
        className="opacity-0 group-hover/item:opacity-100 p-1 text-red-500 hover:bg-red-500/10 rounded transition-all ml-1"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function WarehouseNavItem({ item, pathname }: { item: any, pathname: string }) {
  const [isOpen, setIsOpen] = useState(pathname.startsWith("/inventory"));
  const [categories, setCategories] = useState<StockCategory[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  
  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    // Subscribe and sort by sortOrder locally
    const unsub = stockCategoryRepo.subscribe([], {}, (data) => {
      setCategories(data.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
    });
    return () => unsub();
  }, []);

  const isActive = pathname === "/inventory";

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    const slug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await stockCategoryRepo.create({
      name: newCatName,
      slug,
      columns: [],
      sortOrder: categories.length
    });
    setNewCatName("");
    setIsAdding(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex(c => c.id === active.id);
      const newIndex = categories.findIndex(c => c.id === over.id);
      const newOrder = arrayMove(categories, oldIndex, newIndex);
      
      // Optimistic update
      setCategories(newOrder);
      
      // Batch update sortOrders
      for (let i = 0; i < newOrder.length; i++) {
        await stockCategoryRepo.update(newOrder[i].id!, { sortOrder: i });
      }
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    await stockCategoryRepo.hardDelete(deletingId);
    setDeletingId(null);
  };

  return (
    <div>
      <div 
        className={cn(
          "flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer group",
          isActive 
            ? "bg-primary/[0.12] text-primary" 
            : "text-sidebar-foreground/60 hover:bg-white/[0.04] hover:text-sidebar-foreground/90"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <item.icon className={cn(
            "w-[18px] h-[18px] transition-colors duration-150 shrink-0", 
            isActive ? "text-primary" : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70"
          )} />
          {item.name}
        </div>
        <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", isOpen && "rotate-90")} />
      </div>
      
      {isOpen && (
        <div className="pl-9 pr-3 py-1 space-y-1">
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 py-1.5 px-2 w-full rounded-md text-xs text-primary/70 hover:text-primary hover:bg-primary/5 transition-colors mb-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Category
          </button>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={categories.map(c => c.id!)} strategy={verticalListSortingStrategy}>
              {categories.map(cat => (
                <SortableCategoryItem 
                  key={cat.id} 
                  cat={cat} 
                  pathname={pathname} 
                  onDelete={(id) => setDeletingId(id)} 
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Stock Category</DialogTitle>
            <DialogDescription>
              Create a new inventory category. You can define its flexible columns later.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="e.g. Paper, Toner, Machine Parts"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Category?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete Permanently</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
                  if (item.name === "Warehouse") {
                    return <WarehouseNavItem key={item.name} item={item} pathname={pathname} />;
                  }

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
