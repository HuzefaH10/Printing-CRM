/**
/**
 * Utility functions for handling fraction reams and sheet calculations.
 */

/**
 * Converts reams and loose sheets into a single integer for total sheets.
 */
export function toTotalSheets(
  reams: number = 0,
  loose: number = 0,
  perReam: number = 500
): number {
  const safePerReam = Math.max(1, Math.floor(perReam || 500));
  const safeReams = Math.max(0, Math.floor(reams || 0));
  const safeLoose = Math.max(0, Math.floor(loose || 0));
  return safeReams * safePerReam + safeLoose;
}

/**
 * Splits a total sheet count integer into reams and loose sheets.
 */
export function splitSheets(
  totalSheets: number = 0,
  perReam: number = 500
): { reams: number; loose: number } {
  const safeTotal = Math.max(0, Math.floor(totalSheets || 0));
  const safePerReam = Math.max(1, Math.floor(perReam || 500));

  const reams = Math.floor(safeTotal / safePerReam);
  const loose = safeTotal % safePerReam;

  return { reams, loose };
}

/**
 * Formats a total sheet count into a human-readable ream display string.
 * Examples:
 * - 1150 total sheets (perReam 500) -> "2 reams + 150 sheets"
 * - 1500 total sheets (perReam 500) -> "3 reams"
 * - 150 total sheets (perReam 500) -> "150 sheets"
 * - 0 total sheets -> "0 sheets"
 */
export function formatReams(
  totalSheets: number = 0,
  perReam: number = 500
): string {
  const { reams, loose } = splitSheets(totalSheets, perReam);

  if (reams === 0 && loose === 0) {
    return "0 sheets";
  }

  const reamUnit = reams === 1 ? "ream" : "reams";
  const looseUnit = loose === 1 ? "sheet" : "sheets";

  if (reams > 0 && loose === 0) {
    return `${reams} ${reamUnit}`;
  }

  if (reams === 0 && loose > 0) {
    return `${loose} ${looseUnit}`;
  }

  return `${reams} ${reamUnit} + ${loose} ${looseUnit}`;
}
