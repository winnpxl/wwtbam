import {
  PRIZE_LADDER,
  SAFE_HAVEN_INDICES,
  getSafeHavenPrize,
  formatPrize,
} from "@/lib/types";

export { PRIZE_LADDER, SAFE_HAVEN_INDICES, getSafeHavenPrize, formatPrize };

/** Returns the prize display label for a ladder rung (1-indexed label, 0-indexed array) */
export function getLadderLabel(index: number): string {
  return formatPrize(PRIZE_LADDER[index]);
}

/** Given the current question index (0-14), what prize is locked in as a safe haven? */
export function getLockedPrize(currentIndex: number): number {
  return getSafeHavenPrize(currentIndex);
}

/** Returns true if answering this question correctly crosses a safe haven */
export function isSafeHaven(index: number): boolean {
  return SAFE_HAVEN_INDICES.has(index);
}

/** Prize string with commas for display, e.g. "$1,000,000" */
export function formatPrizeFull(amount: number): string {
  if (amount === 0) return "$0";
  return `$${amount.toLocaleString("en-US")}`;
}
