"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, DatabaseZap, Upload, FileDown, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ImportService } from "@/features/companies/services/import.service";
import { parseExcel, generateTemplate } from "@/features/companies/utils/excel.utils";
import { ImportPreviewRow } from "@/features/companies/models/import";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export function ImportProspectsButton({ onComplete }: { onComplete: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // 1: Upload, 2: Preview
  
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpen = () => {
    setIsOpen(true);
    setStep(1);
    setPreviewRows([]);
  };

  const handleClose = () => {
    if (!isProcessing) setIsOpen(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const { rawRows, errors } = await parseExcel(file);
      
      if (errors.length > 0) {
        alert("Errors found during initial parsing:\n" + errors.join("\n"));
        // Still proceed with valid rows
      }

      if (rawRows.length > 0) {
        const analyzed = await ImportService.analyzeImportBatch(rawRows);
        setPreviewRows(analyzed);
        setStep(2);
      } else {
        alert("No valid data rows found in the file.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to parse file: " + err.message);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleToggleRowSelection = (rowId: number) => {
    setPreviewRows(prev => prev.map(r => 
      r.rowId === rowId ? { ...r, selected: !r.selected } : r
    ));
  };

  const handleConfirmImport = async () => {
    setIsProcessing(true);
    try {
      // Use a hardcoded "SYSTEM" or currently logged in user ID if available
      await ImportService.commitImportBatch(previewRows, "SYSTEM");
      alert("Import completed successfully!");
      setIsOpen(false);
      onComplete();
    } catch (err: any) {
      console.error(err);
      alert("Failed to commit import: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedCount = previewRows.filter(r => r.selected).length;
  const newCount = previewRows.filter(r => r.status === "new" && r.selected).length;
  const updateCount = previewRows.filter(r => r.status === "update" && r.selected).length;
  const warningCount = previewRows.filter(r => r.status === "duplicate_warning").length;
  const errorCount = previewRows.filter(r => r.status === "error").length;

  return (
    <>
      <Button onClick={handleOpen} className="gap-2" variant="default">
        <DatabaseZap className="w-4 h-4" />
        Import Prospects
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Import Prospects</DialogTitle>
            <DialogDescription>
              {step === 1 
                ? "Upload an Excel file to import prospects into the CRM."
                : "Review the data before importing. Uncheck any rows you want to skip."
              }
            </DialogDescription>
          </DialogHeader>

          {step === 1 && (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-lg bg-muted/20 space-y-4">
              <Upload className="w-12 h-12 text-muted-foreground" />
              <div className="text-center">
                <p className="text-lg font-medium text-foreground">Upload your Excel file</p>
                <p className="text-sm text-muted-foreground mt-1">Make sure you use the standard template.</p>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <Button variant="outline" onClick={() => generateTemplate()} className="gap-2">
                  <FileDown className="w-4 h-4" /> Download Template
                </Button>
                <Button onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Select .xlsx File
                </Button>
                <input 
                  type="file" 
                  accept=".xlsx" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex gap-4 mb-4">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  {newCount} New
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {updateCount} Updates
                </Badge>
                {warningCount > 0 && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {warningCount} Warnings
                  </Badge>
                )}
                {errorCount > 0 && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    {errorCount} Errors
                  </Badge>
                )}
              </div>

              <ScrollArea className="flex-1 border rounded-md">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 w-10">Inc</th>
                      <th className="px-4 py-3 w-20">Row</th>
                      <th className="px-4 py-3 w-28">Status</th>
                      <th className="px-4 py-3">Company Name</th>
                      <th className="px-4 py-3">Details / Diffs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {previewRows.map((row) => (
                      <tr key={row.rowId} className={!row.selected ? "opacity-50 bg-muted/50" : ""}>
                        <td className="px-4 py-3">
                          <Checkbox 
                            checked={row.selected}
                            disabled={row.status === "error"}
                            onCheckedChange={() => handleToggleRowSelection(row.rowId)}
                          />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{row.rowId}</td>
                        <td className="px-4 py-3">
                          {row.status === "new" && <Badge className="bg-emerald-500 hover:bg-emerald-600">New</Badge>}
                          {row.status === "update" && <Badge className="bg-blue-500 hover:bg-blue-600">Update</Badge>}
                          {row.status === "duplicate_warning" && <Badge variant="outline" className="text-amber-500 border-amber-500">Warning</Badge>}
                          {row.status === "error" && <Badge variant="destructive">Error</Badge>}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {row.data["Company Name"]}
                        </td>
                        <td className="px-4 py-3">
                          {row.status === "error" && (
                            <div className="text-red-500 flex items-start gap-1">
                              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                              <span>{row.errors?.join(", ")}</span>
                            </div>
                          )}
                          {row.status === "duplicate_warning" && (
                            <div className="text-amber-600 flex items-start gap-1 mb-2">
                              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                              <span>{row.errors?.join(", ")}</span>
                            </div>
                          )}
                          {(row.status === "update" || row.status === "duplicate_warning") && row.diffs && row.diffs.length > 0 && (
                            <div className="space-y-1 mt-1">
                              {row.diffs.map((diff, i) => (
                                <div key={i} className="flex items-center text-xs gap-2">
                                  <span className="font-medium text-muted-foreground min-w-[120px]">{diff.field}:</span>
                                  <span className="text-red-500 line-through max-w-[150px] truncate">{diff.oldValue || "(empty)"}</span>
                                  <ArrowRight className="w-3 h-3 text-muted-foreground mx-1" />
                                  <span className="text-emerald-500 font-medium max-w-[150px] truncate">{diff.newValue || "(empty)"}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {row.status === "new" && (
                            <div className="text-xs text-muted-foreground">
                              {row.data["Unique Reference ID"] ? `ID: ${row.data["Unique Reference ID"]}` : "Will auto-generate ID"}
                              {row.data["Decision Maker Name"] ? ` • Contact: ${row.data["Decision Maker Name"]}` : ""}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={handleClose} disabled={isProcessing}>Cancel</Button>
            {step === 2 && (
              <Button onClick={handleConfirmImport} disabled={isProcessing || selectedCount === 0}>
                {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Confirm Import ({selectedCount} rows)
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
