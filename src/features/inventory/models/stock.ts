import { z } from "zod";
import { BaseModel } from "@/types/repository";

export type StockColumnType = 'text' | 'number' | 'select' | 'quantity_reams';

export const columnDefSchema = z.object({
  id: z.string().min(1, "Column ID is required"),
  label: z.string().min(1, "Column label is required"),
  type: z.enum(["text", "number", "select", "quantity_reams"]),
  required: z.boolean().default(false),
  unit: z.string().optional(),
  options: z.array(z.string()).optional(),
  allowCustomOption: z.boolean().optional(),
  defaultValue: z.union([z.string(), z.number()]).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  showInTable: z.boolean().default(true),
  order: z.number().default(0),
});

export type ColumnDef = z.infer<typeof columnDefSchema>;

// Backwards-compatible alias for StockColumn
export type StockColumn = ColumnDef;

export interface StockCategory extends BaseModel {
  name: string;
  slug: string;
  columns: ColumnDef[];
  sheetsPerReam?: number; // default 500, configurable per category
  groupByColumn?: string;
  sortByColumn?: string;
  icon?: string;
  sortOrder?: number;
}

export type CustomSizeValue = { w: number; h: number };

export interface StockItem extends BaseModel {
  categoryId: string;
  values?: Record<string, any>;
  data?: Record<string, any>;
  lowStockThreshold?: number;
}
