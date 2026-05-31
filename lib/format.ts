// =============================================================================
//  lib/format.ts  —  money + label helpers (paisa is the source of truth)
// =============================================================================

/** Format paisa (BDT * 100) as "৳72,000". */
export function bdt(paisa: number): string {
  return '৳' + Math.round(paisa / 100).toLocaleString('en-BD');
}

/** Whole-percent discount, or null when there's no valid MRP. */
export function discountPct(pricePaisa: number, mrpPaisa?: number | null): number | null {
  if (!mrpPaisa || mrpPaisa <= pricePaisa) return null;
  return Math.round(((mrpPaisa - pricePaisa) / mrpPaisa) * 100);
}
