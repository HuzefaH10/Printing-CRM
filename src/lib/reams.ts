import { toTotalBase, splitBase, formatUnits } from "./units";

/**
 * Converts reams and loose sheets into a single integer for total sheets.
 * Delegates to shared toTotalBase for zero duplicate logic.
 */
export function toTotalSheets(
  reams: number = 0,
  loose: number = 0,
  perReam: number = 500
): number {
  return toTotalBase(reams, loose, perReam);
}

/**
 * Splits a total sheet count integer into reams and loose sheets.
 * Delegates to shared splitBase.
 */
export function splitSheets(
  totalSheets: number = 0,
  perReam: number = 500
): { reams: number; loose: number } {
  const { fullPacks, looseAmount } = splitBase(totalSheets, perReam);
  return { reams: fullPacks, loose: looseAmount };
}

/**
 * Formats a total sheet count into a human-readable ream display string.
 * Delegates to shared formatUnits.
 */
export function formatReams(
  totalSheets: number = 0,
  perReam: number = 500
): string {
  return formatUnits(totalSheets, perReam, "ream", "sheets");
}
