"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColumnDef, StockItem } from "../models/stock";
import { buildItemZodSchema } from "../utils/item-schema";
import { ReamsInput } from "./ReamsInput";
import { SizeSelectInput } from "./SizeSelectInput";
import { stockItemRepo } from "../services/stock.repository";

interface ItemFormModalProps {
  categoryId: string;
  columns: ColumnDef[];
  sheetsPerReam?: number;
  editingItem?: StockItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ItemFormModal({
  categoryId,
  columns,
  sheetsPerReam = 500,
  editingItem = null,
  open,
  onOpenChange,
  onSuccess
}: ItemFormModalProps) {
  const schema = buildItemZodSchema(columns);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<Record<string, any>>({
    resolver: zodResolver(schema),
    defaultValues: editingItem?.values || editingItem?.data || {}
  });

  useEffect(() => {
    if (open) {
      const initial: Record<string, any> = {};
      const currentValues = editingItem?.values || editingItem?.data || {};

      columns.forEach(col => {
        if (currentValues[col.id] !== undefined) {
          initial[col.id] = currentValues[col.id];
        } else if (col.defaultValue !== undefined) {
          initial[col.id] = col.defaultValue;
        } else {
          initial[col.id] = col.type === "quantity_reams" ? 0 : col.type === "number" ? 0 : "";
        }
      });

      reset(initial);
    }
  }, [open, editingItem, columns, reset]);

  const onSubmit = async (values: Record<string, any>) => {
    try {
      if (editingItem && editingItem.id) {
        await stockItemRepo.update(editingItem.id, {
          categoryId,
          values
        });
      } else {
        await stockItemRepo.create({
          categoryId,
          values
        } as any);
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to save inventory item:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <DialogTitle>{editingItem ? "Edit Inventory Item" : "Add Inventory Item"}</DialogTitle>
          <DialogDescription>
            Enter details according to category column definitions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-4">
          {columns.map((col) => (
            <div key={col.id} className="space-y-1.5">
              <Label className="text-sm font-semibold flex items-center justify-between">
                <span>
                  {col.label}
                  {col.required && <span className="text-destructive ml-1">*</span>}
                </span>
                {!col.showInTable && (
                  <span className="text-[10px] text-muted-foreground uppercase font-normal bg-muted px-1.5 py-0.5 rounded">
                    Hidden from table
                  </span>
                )}
              </Label>

              {col.type === "text" && (
                <Input
                  {...register(col.id)}
                  placeholder={`Enter ${col.label}...`}
                  className="h-9"
                />
              )}

              {col.type === "number" && (
                <div className="relative">
                  <Input
                    type="number"
                    step="any"
                    min={col.min}
                    max={col.max}
                    {...register(col.id, { valueAsNumber: true })}
                    placeholder={`Enter ${col.label}...`}
                    className="h-9 font-mono"
                  />
                  {col.unit && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                      {col.unit}
                    </span>
                  )}
                </div>
              )}

              {col.type === "select" && col.id === "size" && (
                <Controller
                  name={col.id}
                  control={control}
                  render={({ field }) => (
                    <SizeSelectInput
                      value={field.value}
                      onChange={field.onChange}
                      options={col.options}
                      allowCustomOption={col.allowCustomOption ?? true}
                    />
                  )}
                />
              )}

              {col.type === "select" && col.id !== "size" && (
                <Controller
                  name={col.id}
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={(val: string | null) => field.onChange(val || "")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={`Select ${col.label}...`} />
                      </SelectTrigger>
                      <SelectContent>
                        {(col.options || []).map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}

              {col.type === "quantity_reams" && (
                <Controller
                  name={col.id}
                  control={control}
                  render={({ field }) => (
                    <ReamsInput
                      value={field.value || 0}
                      onChange={field.onChange}
                      sheetsPerReam={sheetsPerReam}
                    />
                  )}
                />
              )}

              {errors[col.id] && (
                <p className="text-xs text-destructive mt-1">
                  {String(errors[col.id]?.message)}
                </p>
              )}
            </div>
          ))}

          <DialogFooter className="pt-4 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingItem ? "Update Item" : "Create Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
