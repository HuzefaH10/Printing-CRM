import { z } from "zod";

export const ProspectImportRowSchema = z.object({
  "Company Name": z.string().min(1, "Company Name is required"),
  "Industry/Sector": z.string().optional(),
  "Website": z.string().optional(),
  "Company Phone": z.string().optional(),
  "Company Email": z.string().optional(),
  "Address/Area (Kuwait)": z.string().optional(),
  "About/Description": z.string().optional(),
  "Source": z.string().optional(),
  "Decision Maker Name": z.string().optional(),
  "Decision Maker Role": z.string().optional(),
  "Decision Maker Phone": z.string().optional(),
  "Decision Maker Email": z.string().optional(),
  "Fit Score (1-5)": z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z.number().min(1).max(5).optional()
  ),
  "Notes": z.string().optional(),
  "Unique Reference ID": z.string().optional(),
});

export type ProspectImportRow = z.infer<typeof ProspectImportRowSchema>;

export type ImportRowStatus = "new" | "update" | "duplicate_warning" | "error";

export interface FieldDiff {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface ImportPreviewRow {
  rowId: number; // Row index from excel
  status: ImportRowStatus;
  data: ProspectImportRow;
  matchedCompanyId?: string;
  errors?: string[];
  diffs?: FieldDiff[];
  selected: boolean;
}

export interface ImportBatchLog {
  id: string;
  batchId: string;
  timestamp: Date;
  userId: string;
  totalRows: number;
  newRecords: number;
  updatedRecords: number;
  errors: number;
  isRolledBack: boolean;
}
