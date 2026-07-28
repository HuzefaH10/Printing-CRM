/**
 * Base Export Infrastructure
 */

export interface ExportColumn<T> {
  header: string;
  accessor: (item: T) => string | number | boolean | null | undefined;
}

export class Exporter {
  /**
   * Generates a CSV string from an array of objects
   */
  static generateCsv<T>(data: T[], columns: ExportColumn<T>[]): string {
    if (data.length === 0) return "";

    const headers = columns.map(c => `"${c.header.replace(/"/g, '""')}"`).join(",");
    
    const rows = data.map(item => {
      return columns.map(c => {
        const value = c.accessor(item);
        if (value === null || value === undefined) return '""';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(",");
    });

    return [headers, ...rows].join("\n");
  }

  /**
   * Triggers a browser download of the CSV data
   */
  static downloadCsv(csvContent: string, filename: string) {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
