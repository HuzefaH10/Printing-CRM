import { Timestamp } from "firebase/firestore";

export interface BaseModel {
  id: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  createdBy?: string;
  updatedBy?: string;
  
  // Soft delete support
  isDeleted?: boolean;
  deletedAt?: Timestamp | Date | null;
  deletedBy?: string | null;
}

export type CreatePayload<T> = Omit<T, "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "isDeleted" | "deletedAt" | "deletedBy">;
export type UpdatePayload<T> = Partial<Omit<T, "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy">>;

export type SortDirection = "asc" | "desc";

export interface QueryOptions {
  limit?: number;
  orderBy?: string;
  orderDirection?: SortDirection;
  startAfter?: any;
  includeDeleted?: boolean; // If true, fetches soft-deleted items too
}

export interface FilterCondition {
  field: string;
  operator: "==" | "!=" | "<" | "<=" | ">" | ">=" | "array-contains" | "in" | "not-in" | "array-contains-any";
  value: any;
}
