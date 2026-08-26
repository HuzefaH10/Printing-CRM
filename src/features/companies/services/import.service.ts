import { ProspectImportRow, ImportPreviewRow, FieldDiff } from "../models/import";
import { ProspectService } from "@/services/prospect.service";
import { normalizeEmail, normalizePhone } from "../utils/excel.utils";
import { Prospect } from "@/types/prospect";
import { db } from "@/config/firebase";
import { writeBatch, doc, collection, serverTimestamp, setDoc } from "firebase/firestore";

export class ImportService {
  
  static async analyzeImportBatch(rows: ProspectImportRow[]): Promise<ImportPreviewRow[]> {
    const existingProspects = await ProspectService.getAllProspects();
    
    const previewRows: ImportPreviewRow[] = [];
    const seenReferenceIds = new Set<string>();

    rows.forEach((row, index) => {
      const rowId = index + 2; 
      const refId = row["Unique Reference ID"]?.trim();
      const normPhone = normalizePhone(row["Company Phone"] || row["Decision Maker Phone"]);
      const normEmail = normalizeEmail(row["Company Email"] || row["Decision Maker Email"]);
      const normName = row["Company Name"].toLowerCase().trim();

      if (refId && seenReferenceIds.has(refId)) {
        previewRows.push({
          rowId,
          status: "error",
          data: row,
          errors: [`Duplicate Unique Reference ID (${refId}) found in the same import file.`],
          selected: false
        });
        return;
      }
      if (refId) seenReferenceIds.add(refId);

      let matchedProspect: Prospect | undefined;

      if (refId) {
        matchedProspect = existingProspects.find(p => p.customFields?.referenceId === refId);
      }

      let isFuzzyMatch = false;
      if (!matchedProspect) {
        matchedProspect = existingProspects.find(p => {
          const cNormName = p.organizationName.toLowerCase().trim();
          const cNormPhone = normalizePhone(p.customFields?.companyPhone || p.decisionMakerPhone);
          const cNormEmail = normalizeEmail(p.customFields?.companyEmail || p.decisionMakerEmail);
          
          if (cNormName === normName && (cNormPhone === normPhone || cNormEmail === normEmail)) {
            return true;
          }
          return false;
        });
        if (matchedProspect) {
          isFuzzyMatch = true;
        }
      }

      if (matchedProspect) {
        if (isFuzzyMatch && !refId) {
          previewRows.push({
            rowId,
            status: "duplicate_warning",
            data: row,
            matchedCompanyId: matchedProspect.id,
            errors: [`Possible duplicate detected: '${matchedProspect.organizationName}'. Match based on Name + Phone/Email. Please review.`],
            selected: true,
          });
        } else {
          // Compute diffs
          const diffs: FieldDiff[] = [];
          
          if (row["Company Name"] && matchedProspect.organizationName !== row["Company Name"]) {
            diffs.push({ field: "Company Name", oldValue: matchedProspect.organizationName, newValue: row["Company Name"] });
          }
          if (row["Industry/Sector"] && matchedProspect.industry !== row["Industry/Sector"]) {
            diffs.push({ field: "Industry/Sector", oldValue: matchedProspect.industry || "", newValue: row["Industry/Sector"] });
          }
          if (row["Address/Area (Kuwait)"] && matchedProspect.location !== row["Address/Area (Kuwait)"]) {
            diffs.push({ field: "Address/Area (Kuwait)", oldValue: matchedProspect.location || "", newValue: row["Address/Area (Kuwait)"] });
          }
          if (row["About/Description"] && matchedProspect.description !== row["About/Description"]) {
            diffs.push({ field: "About/Description", oldValue: matchedProspect.description || "", newValue: row["About/Description"] });
          }
          if (row["Decision Maker Name"] && matchedProspect.decisionMakerName !== row["Decision Maker Name"]) {
            diffs.push({ field: "Decision Maker Name", oldValue: matchedProspect.decisionMakerName || "", newValue: row["Decision Maker Name"] });
          }
          if (row["Decision Maker Role"] && matchedProspect.decisionMakerRole !== row["Decision Maker Role"]) {
            diffs.push({ field: "Decision Maker Role", oldValue: matchedProspect.decisionMakerRole || "", newValue: row["Decision Maker Role"] });
          }
          if (row["Decision Maker Phone"] && matchedProspect.decisionMakerPhone !== row["Decision Maker Phone"]) {
            diffs.push({ field: "Decision Maker Phone", oldValue: matchedProspect.decisionMakerPhone || "", newValue: row["Decision Maker Phone"] });
          }
          if (row["Decision Maker Email"] && matchedProspect.decisionMakerEmail !== row["Decision Maker Email"]) {
            diffs.push({ field: "Decision Maker Email", oldValue: matchedProspect.decisionMakerEmail || "", newValue: row["Decision Maker Email"] });
          }
          if (row["Notes"] && matchedProspect.notes !== row["Notes"]) {
            diffs.push({ field: "Notes", oldValue: matchedProspect.notes || "", newValue: row["Notes"] });
          }
          
          const newFitScore = row["Fit Score (1-5)"];
          if (newFitScore !== undefined) {
            const oldRating = matchedProspect.rating?.length || 0;
            if (oldRating !== newFitScore) {
              diffs.push({ field: "Fit Score (1-5)", oldValue: oldRating || "", newValue: newFitScore });
            }
          }

          previewRows.push({
            rowId,
            status: "update",
            data: row,
            matchedCompanyId: matchedProspect.id,
            diffs,
            selected: diffs.length > 0, // Auto-select if there are changes
          });
        }
      } else {
        // New record
        previewRows.push({
          rowId,
          status: "new",
          data: row,
          selected: true,
        });
      }
    });

    return previewRows;
  }

  static async commitImportBatch(previewRows: ImportPreviewRow[], userId: string): Promise<void> {
    const batch = writeBatch(db);
    const now = new Date().toISOString();
    const batchId = `BATCH-${Date.now()}`;
    let numNew = 0;
    let numUpdated = 0;
    
    const rowsToProcess = previewRows.filter(r => r.selected && r.status !== "error");
    
    for (const preview of rowsToProcess) {
      const { data, matchedCompanyId, status } = preview;
      const refId = data["Unique Reference ID"] || `REF-${Math.floor(Math.random() * 1000000)}`;
      
      const fitScoreNum = data["Fit Score (1-5)"] || 3;
      const ratingStr = '*'.repeat(fitScoreNum);

      if (status === "new" || (status === "duplicate_warning" && !matchedCompanyId)) {
        // CREATE
        const docRef = doc(collection(db, "prospects"));
        const newProspect: Omit<Prospect, 'id'> = {
          organizationName: data["Company Name"],
          industry: data["Industry/Sector"] || "",
          description: data["About/Description"] || "",
          website: data["Website"] || "",
          location: data["Address/Area (Kuwait)"] || "",
          businessType: "",
          likelyPrintingRequirements: "",
          priority: "Medium",
          rating: ratingStr,
          status: "New",
          source: data["Source"] || "Excel Import",
          
          decisionMakerName: data["Decision Maker Name"] || "",
          decisionMakerRole: data["Decision Maker Role"] || "",
          decisionMakerEmail: data["Decision Maker Email"] || "",
          decisionMakerPhone: data["Decision Maker Phone"] || "",
          
          notes: data["Notes"] || "",
          
          customFields: {
            referenceId: refId,
            companyPhone: data["Company Phone"] || "",
            companyEmail: data["Company Email"] || "",
          },
          
          createdAt: now,
          updatedAt: now,
        };
        
        batch.set(docRef, newProspect);
        
        // Add Timeline Activity
        const activityRef = doc(collection(db, "activities"));
        batch.set(activityRef, {
          entityId: docRef.id,
          entityType: "Prospect",
          title: "Prospect Imported",
          description: `Imported via Excel batch ${batchId}`,
          timestamp: serverTimestamp(),
          userId,
          type: "system_import",
        });

        numNew++;

      } else if ((status === "update" || status === "duplicate_warning") && matchedCompanyId) {
        // UPDATE
        const prospectDocRef = doc(db, "prospects", matchedCompanyId);
        
        const updateData: any = {
          updatedAt: now,
        };
        
        if (data["Company Name"]) updateData.organizationName = data["Company Name"];
        if (data["Industry/Sector"]) updateData.industry = data["Industry/Sector"];
        if (data["About/Description"]) updateData.description = data["About/Description"];
        if (data["Website"]) updateData.website = data["Website"];
        if (data["Address/Area (Kuwait)"]) updateData.location = data["Address/Area (Kuwait)"];
        if (data["Decision Maker Name"]) updateData.decisionMakerName = data["Decision Maker Name"];
        if (data["Decision Maker Role"]) updateData.decisionMakerRole = data["Decision Maker Role"];
        if (data["Decision Maker Email"]) updateData.decisionMakerEmail = data["Decision Maker Email"];
        if (data["Decision Maker Phone"]) updateData.decisionMakerPhone = data["Decision Maker Phone"];
        if (data["Notes"]) updateData.notes = data["Notes"];
        if (data["Fit Score (1-5)"]) updateData.rating = ratingStr;
        
        updateData["customFields.referenceId"] = refId;
        if (data["Company Phone"]) updateData["customFields.companyPhone"] = data["Company Phone"];
        if (data["Company Email"]) updateData["customFields.companyEmail"] = data["Company Email"];

        batch.update(prospectDocRef, updateData);
        
        // Add Timeline Activity
        const activityRef = doc(collection(db, "activities"));
        batch.set(activityRef, {
          entityId: matchedCompanyId,
          entityType: "Prospect",
          title: "Prospect Updated",
          description: `Updated via Excel batch ${batchId}`,
          timestamp: serverTimestamp(),
          userId,
          type: "system_import",
        });
        
        numUpdated++;
      }
    }

    if (rowsToProcess.length > 0) {
      // Log the batch history
      const historyRef = doc(collection(db, "import_history"));
      batch.set(historyRef, {
        batchId,
        timestamp: serverTimestamp(),
        userId,
        totalRows: rowsToProcess.length,
        newRecords: numNew,
        updatedRecords: numUpdated,
        errors: previewRows.filter(r => r.status === "error").length,
        isRolledBack: false,
      });

      await batch.commit();
    }
  }
}
