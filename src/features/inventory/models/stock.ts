import { BaseModel } from "@/types/repository";

export type StockColumnType = 'text' | 'number' | 'dropdown' | 'fraction';

export interface StockColumn {
  id: string; // usually a slugified name like 'paper_type'
  name: string;
  type: StockColumnType;
  options?: string[]; // for dropdown
  width?: number; // pixel width for column
  required?: boolean;
}

export interface StockCategory extends BaseModel {
  name: string;
  slug: string;
  columns: StockColumn[];
  groupByColumn?: string; // e.g. 'paper_type' to group by
  sortByColumn?: string;
  icon?: string; // lucide icon name
}

export interface StockItem extends BaseModel {
  categoryId: string;
  data: Record<string, any>; // Flexible data
  lowStockThreshold?: number;
}
