/**
 * Utility functions for handling unit packs (quantity_units) and sheet/weight/volume base calculations.
 */

export type PackUnit = "kg" | "L" | "ml" | "pcs" | "sheets" | string;

/**
 * Pluralizes a unit label (e.g., "tin" -> "tins", "box" -> "boxes", "bottle" -> "bottles", "roll" -> "rolls", "ream" -> "reams").
 */
export function pluralizeUnitLabel(label: string, count: number): string {
  if (count === 1) return label;
  if (label.toLowerCase().endsWith("x")) return `${label}es`;
  if (label.toLowerCase().endsWith("box")) return `${label}es`;
  return `${label}s`;
}

/**
 * Formats loose pack unit with singular/plural support (e.g. 1 sheet vs 2 sheets).
 */
export function formatPackUnit(packUnit: string, amount: number): string {
  if (amount === 1 && packUnit.toLowerCase() === "sheets") return "sheet";
  if (amount === 1 && packUnit.toLowerCase() === "pcs") return "pc";
  return packUnit;
}

/**
 * Converts full packs and loose base amount into total base integer/number.
 */
export function toTotalBase(
  fullPacks: number = 0,
  looseAmount: number = 0,
  packSize: number = 1
): number {
  const safePackSize = Math.max(0.0001, packSize || 1);
  const safePacks = Math.max(0, fullPacks || 0);
  const safeLoose = Math.max(0, looseAmount || 0);

  const total = safePacks * safePackSize + safeLoose;
  return Number.isInteger(total) ? total : Math.round(total * 10000) / 10000;
}

/**
 * Splits a total base amount into full packs and loose base amount.
 */
export function splitBase(
  totalBase: number = 0,
  packSize: number = 1
): { fullPacks: number; looseAmount: number } {
  const safeTotal = Math.max(0, totalBase || 0);
  const safePackSize = Math.max(0.0001, packSize || 1);

  if (safePackSize === 1) {
    const fullPacks = Math.floor(safeTotal);
    const looseAmount = safeTotal - fullPacks;
    return {
      fullPacks,
      looseAmount: Number.isInteger(looseAmount) ? looseAmount : Math.round(looseAmount * 1000) / 1000
    };
  }

  const fullPacks = Math.floor(safeTotal / safePackSize);
  const looseAmount = safeTotal % safePackSize;

  return {
    fullPacks,
    looseAmount: Number.isInteger(looseAmount) ? looseAmount : Math.round(looseAmount * 1000) / 1000
  };
}

/**
 * Formats a total base amount into a human-readable display string.
 */
export function formatUnits(
  totalBase: number = 0,
  packSize: number = 1,
  unitLabel: string = "pack",
  packUnit: PackUnit = "pcs"
): string {
  const { fullPacks, looseAmount } = splitBase(totalBase, packSize);

  if (fullPacks === 0 && looseAmount === 0) {
    if (packUnit === "sheets") return "0 sheets";
    return `0 ${pluralizeUnitLabel(unitLabel, 0)}`;
  }

  const packText = `${fullPacks} ${pluralizeUnitLabel(unitLabel, fullPacks)}`;
  const looseText = `${looseAmount} ${formatPackUnit(packUnit, looseAmount)}`;

  if (fullPacks > 0 && looseAmount === 0) {
    return packText;
  }

  if (fullPacks === 0 && looseAmount > 0) {
    return looseText;
  }

  return `${packText} + ${looseText}`;
}
