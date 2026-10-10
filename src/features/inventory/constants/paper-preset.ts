import { ColumnDef } from "../models/stock";

export const COMMON_GSM_SUGGESTIONS = [
  70, 80, 90, 100, 115, 130, 150, 170, 200, 250, 300, 350
];

export const PAPER_PRESET_COLUMNS: ColumnDef[] = [
  {
    id: "type",
    label: "Paper Type",
    type: "select",
    required: true,
    options: [
      "Woodfree/Offset",
      "Art Gloss",
      "Art Matt",
      "Bond",
      "Card/Board",
      "NCR",
      "Kraft",
      "Newsprint"
    ],
    allowCustomOption: true,
    showInTable: true,
    order: 1
  },
  {
    id: "gsm",
    label: "GSM",
    type: "number",
    required: true,
    unit: "gsm",
    min: 40,
    max: 500,
    showInTable: true,
    order: 2
  },
  {
    id: "size",
    label: "Size",
    type: "select",
    required: true,
    options: [
      "A5",
      "A4",
      "A3",
      "SRA3",
      "70x100",
      "64x90",
      "61x86"
    ],
    allowCustomOption: true,
    showInTable: true,
    order: 3
  },
  {
    id: "reams",
    label: "Quantity (Reams)",
    type: "quantity_reams",
    required: true,
    unit: "reams",
    showInTable: true,
    order: 4
  }
];

/**
 * Merges the paper preset columns into existing columns by ID.
 * Never duplicates or overwrites existing columns.
 */
export function mergePaperPreset(existingColumns: ColumnDef[] = []): ColumnDef[] {
  const existingMap = new Map(existingColumns.map(c => [c.id, c]));
  const updated = [...existingColumns];

  let maxOrder = existingColumns.reduce((max, c) => Math.max(max, c.order || 0), 0);

  for (const presetCol of PAPER_PRESET_COLUMNS) {
    if (!existingMap.has(presetCol.id)) {
      maxOrder += 1;
      updated.push({
        ...presetCol,
        order: maxOrder
      });
    }
  }

  return updated;
}
