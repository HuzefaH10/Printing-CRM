/**
 * Base Import Infrastructure
 */

export interface ImportColumnMapping {
  csvHeader: string;
  fieldKey: string;
  required: boolean;
  transform?: (value: string) => any;
}

export interface ImportResult<T> {
  success: T[];
  errors: { row: number; data: any; reason: string }[];
}

export class CsvImporter<T> {
  private mappings: ImportColumnMapping[];

  constructor(mappings: ImportColumnMapping[]) {
    this.mappings = mappings;
  }

  /**
   * Process parsed CSV data (e.g., from PapaParse) against the mappings
   */
  process(parsedRows: any[]): ImportResult<T> {
    const result: ImportResult<T> = { success: [], errors: [] };

    parsedRows.forEach((row, index) => {
      try {
        const entity: any = {};
        let hasError = false;

        for (const mapping of this.mappings) {
          const rawValue = row[mapping.csvHeader];

          if (mapping.required && (rawValue === undefined || rawValue === null || rawValue === "")) {
            result.errors.push({ row: index + 2, data: row, reason: `Missing required field: ${mapping.csvHeader}` });
            hasError = true;
            break;
          }

          if (rawValue !== undefined) {
            entity[mapping.fieldKey] = mapping.transform ? mapping.transform(rawValue) : rawValue;
          }
        }

        if (!hasError) {
          result.success.push(entity as T);
        }
      } catch (err: any) {
        result.errors.push({ row: index + 2, data: row, reason: err.message || "Unknown processing error" });
      }
    });

    return result;
  }
}
