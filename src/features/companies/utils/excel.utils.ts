import * as XLSX from "xlsx";
import { ProspectImportRow, ProspectImportRowSchema } from "../models/import";
import { Prospect } from "@/types/prospect";

export const EXCEL_COLUMNS = [
  "Company Name",
  "Industry/Sector",
  "Website",
  "Company Phone",
  "Company Email",
  "Address/Area (Kuwait)",
  "About/Description",
  "Source",
  "Decision Maker Name",
  "Decision Maker Role",
  "Decision Maker Phone",
  "Decision Maker Email",
  "Fit Score (1-5)",
  "Notes",
  "Unique Reference ID",
];

export function generateTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([EXCEL_COLUMNS]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Prospects");
  
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = "Prospects_Import_Template.xlsx";
  a.click();
  
  URL.revokeObjectURL(url);
}

export function exportToExcel(prospects: Prospect[]) {
  const rows = prospects.map(p => {
    const fitScore = p.rating ? p.rating.length : "";

    return [
      p.organizationName,
      p.industry || "",
      p.website || "",
      p.customFields?.companyPhone || p.decisionMakerPhone || "", // Fallback
      p.customFields?.companyEmail || p.decisionMakerEmail || "", // Fallback
      p.location || "",
      p.description || "",
      p.source || "",
      p.decisionMakerName || "",
      p.decisionMakerRole || "",
      p.decisionMakerPhone || "",
      p.decisionMakerEmail || "",
      fitScore,
      p.notes || "",
      p.customFields?.referenceId || "", // Unique Reference ID
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([EXCEL_COLUMNS, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Current Prospects");
  
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `Prospects_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
  a.click();
  
  URL.revokeObjectURL(url);
}

export async function parseExcel(file: File): Promise<{ rawRows: ProspectImportRow[], errors: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        
        const rawRows: ProspectImportRow[] = [];
        const errors: string[] = [];
        
        rawJson.forEach((row, index) => {
          const parsed = ProspectImportRowSchema.safeParse(row);
          if (parsed.success) {
            rawRows.push(parsed.data);
          } else {
            const rowNumber = index + 2; 
            errors.push(`Row ${rowNumber}: ${parsed.error.issues.map(i => i.message).join(", ")}`);
          }
        });
        
        resolve({ rawRows, errors });
      } catch (err: any) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

export function normalizePhone(phone?: string): string {
  if (!phone) return "";
  return phone.replace(/[\s\-\(\)\+]/g, "").trim();
}

export function normalizeEmail(email?: string): string {
  if (!email) return "";
  return email.toLowerCase().trim();
}
