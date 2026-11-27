/** Swiss VAT (MWST) rates in percent, valid since 2024. */
export const VAT_DINE_IN = 8.1;
export const VAT_TAKEAWAY = 2.6;

export const VAT_RATES = [VAT_DINE_IN, VAT_TAKEAWAY] as const;

export type VatOrderFields = {
  table_number?: string | number | null;
  order_type?: string | null;
};

export type VatItemFields = {
  quantity: number;
  unit_price_cents: number;
  is_alcohol?: boolean | null;
};

export type VatOrderAmounts = VatOrderFields & {
  total_cents: number;
  order_items?: VatItemFields[] | null;
};

/** Orders placed at a table are consumed on the premises; everything else is takeaway. */
export function isDineIn(order: VatOrderFields) {
  return order.table_number !== null && order.table_number !== undefined && String(order.table_number).trim() !== "";
}

export function vatRateFor(order: VatOrderFields) {
  return isDineIn(order) ? VAT_DINE_IN : VAT_TAKEAWAY;
}

/** Prices in Switzerland include VAT, so the VAT part is extracted from the gross amount. */
export function vatPartCents(grossCents: number, ratePercent: number) {
  return Math.round((grossCents * ratePercent) / (100 + ratePercent));
}

export function orderTypeLabel(order: VatOrderFields) {
  if (isDineIn(order)) return "Tisch";
  return order.order_type === "delivery" ? "Lieferung" : "Abholung";
}

export type OrderVatSplit = {
  /** Gross amount (incl. VAT) per VAT rate. */
  byRate: Map<number, number>;
  /** True when an old order has items without an alcohol flag, so the split is an estimate. */
  estimated: boolean;
};

/**
 * Splits one order's gross total across the two VAT rates.
 * Dine-in: everything at 8.1%. Takeaway/delivery: alcohol items at 8.1%,
 * the rest (food, soft drinks, delivery fee) at 2.6%.
 */
export function splitOrderByRate(order: VatOrderAmounts): OrderVatSplit {
  const total = Number(order.total_cents) || 0;
  const byRate = new Map<number, number>(VAT_RATES.map((rate) => [rate, 0]));

  if (isDineIn(order)) {
    byRate.set(VAT_DINE_IN, total);
    return { byRate, estimated: false };
  }

  const items = order.order_items ?? [];
  let alcoholCents = 0;
  let estimated = false;
  for (const item of items) {
    if (item.is_alcohol === true) {
      alcoholCents += (Number(item.quantity) || 0) * (Number(item.unit_price_cents) || 0);
    } else if (item.is_alcohol === null || item.is_alcohol === undefined) {
      estimated = true;
    }
  }

  const alcoholPart = Math.min(alcoholCents, total);
  byRate.set(VAT_DINE_IN, alcoholPart);
  byRate.set(VAT_TAKEAWAY, total - alcoholPart);
  return { byRate, estimated };
}

/** Normalises a Swiss UID / MWST number to "CHE-123.456.789 MWST", or null if invalid. */
export function readVatNumber(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^CHE[-\s]?(\d{3})\.?(\d{3})\.?(\d{3})(?:\s*(MWST|TVA|IVA))?$/i);
  if (!match) return null;
  const suffix = (match[4] ?? "MWST").toUpperCase();
  return `CHE-${match[1]}.${match[2]}.${match[3]} ${suffix}`;
}
