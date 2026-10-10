import { ColumnDef } from "@/features/inventory/models/stock";

export interface CategoryPreset {
  id: "paper" | "ink" | "plates" | "chemicals" | "masters";
  label: string;
  description: string;
  sheetsPerReam?: number;
  columns: ColumnDef[];
}

export const CATEGORY_PRESETS: Record<CategoryPreset["id"], CategoryPreset> = {
  paper: {
    id: "paper",
    label: "Paper",
    description: "Standard paper inventory specs including type, GSM, sheet size, and reams.",
    sheetsPerReam: 500,
    columns: [
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
        options: ["A5", "A4", "A3", "SRA3", "70x100", "64x90", "61x86"],
        allowCustomOption: true,
        showInTable: true,
        order: 3
      },
      {
        id: "reams",
        label: "Quantity (Reams)",
        type: "quantity_units",
        required: true,
        unitLabel: "ream",
        packSize: 500,
        packUnit: "sheets",
        unit: "reams",
        showInTable: true,
        order: 4
      }
    ]
  },

  ink: {
    id: "ink",
    label: "Ink",
    description: "Printing inks for Offset, RISO, Toner, and Screen with colour and Pantone code.",
    columns: [
      {
        id: "inkType",
        label: "Ink Type",
        type: "select",
        required: true,
        options: ["Offset", "RISO", "Toner", "Screen"],
        showInTable: true,
        order: 1
      },
      {
        id: "colour",
        label: "Colour",
        type: "select",
        required: true,
        options: [
          "Black",
          "Cyan",
          "Magenta",
          "Yellow",
          "Red",
          "Blue",
          "Green",
          "Orange",
          "Violet",
          "Pantone/Custom"
        ],
        allowCustomOption: true,
        showInTable: true,
        order: 2
      },
      {
        id: "pantoneCode",
        label: "Pantone Code",
        type: "text",
        required: false,
        showInTable: true,
        order: 3
      },
      {
        id: "brand",
        label: "Brand",
        type: "text",
        required: false,
        showInTable: true,
        order: 4
      },
      {
        id: "stock",
        label: "Stock Quantity",
        type: "quantity_units",
        required: true,
        unitLabel: "tin",
        packSize: 1,
        packUnit: "kg",
        unit: "tins",
        showInTable: true,
        order: 5
      }
    ]
  },

  plates: {
    id: "plates",
    label: "Plates",
    description: "Offset and CTP printing plates with material type, size, and thickness.",
    columns: [
      {
        id: "plateType",
        label: "Plate Type",
        type: "select",
        required: true,
        options: ["Thermal CTP", "Violet CTP", "Conventional", "Polyester"],
        showInTable: true,
        order: 1
      },
      {
        id: "size",
        label: "Size",
        type: "select",
        required: true,
        options: ["700x1000", "650x550", "1030x800", "A3"],
        allowCustomOption: true,
        showInTable: true,
        order: 2
      },
      {
        id: "thickness",
        label: "Thickness (mm)",
        type: "select",
        required: true,
        options: ["0.15", "0.20", "0.30"],
        unit: "mm",
        showInTable: true,
        order: 3
      },
      {
        id: "stock",
        label: "Stock Quantity",
        type: "quantity_units",
        required: true,
        unitLabel: "box",
        packSize: 100,
        packUnit: "pcs",
        unit: "boxes",
        showInTable: true,
        order: 4
      }
    ]
  },

  chemicals: {
    id: "chemicals",
    label: "Chemicals",
    description: "Fountain solutions, plate developers, blanket washes, and pressroom chemicals.",
    columns: [
      {
        id: "chemicalType",
        label: "Chemical Type",
        type: "select",
        required: true,
        options: ["Fountain Solution", "Plate Developer", "Blanket Wash", "Roller Wash", "Gum", "Other"],
        showInTable: true,
        order: 1
      },
      {
        id: "brand",
        label: "Brand",
        type: "text",
        required: false,
        showInTable: true,
        order: 2
      },
      {
        id: "stock",
        label: "Stock Quantity",
        type: "quantity_units",
        required: true,
        unitLabel: "bottle",
        packSize: 1,
        packUnit: "L",
        unit: "bottles",
        showInTable: true,
        order: 3
      }
    ]
  },

  masters: {
    id: "masters",
    label: "RISO Masters",
    description: "RISO duplicating master rolls by machine model and size.",
    columns: [
      {
        id: "machineModel",
        label: "Machine Model",
        type: "text",
        required: true,
        defaultValue: "RISO 9050",
        showInTable: true,
        order: 1
      },
      {
        id: "size",
        label: "Size",
        type: "select",
        required: true,
        options: ["A3", "A4", "B4"],
        allowCustomOption: true,
        showInTable: true,
        order: 2
      },
      {
        id: "stock",
        label: "Stock Quantity",
        type: "quantity_units",
        required: true,
        unitLabel: "roll",
        packSize: 1,
        packUnit: "pcs",
        unit: "rolls",
        showInTable: true,
        order: 3
      }
    ]
  }
};

/**
 * Merges preset columns into existing columns by column ID.
 * Never overwrites or duplicates existing columns.
 */
export function mergePreset(existingColumns: ColumnDef[] = [], presetColumns: ColumnDef[]): ColumnDef[] {
  const existingMap = new Map(existingColumns.map(c => [c.id, c]));
  const updated = [...existingColumns];

  let maxOrder = existingColumns.reduce((max, c) => Math.max(max, c.order || 0), 0);

  for (const presetCol of presetColumns) {
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
