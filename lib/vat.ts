/** Swiss VAT (MWST) rates in percent, valid since 2024. */
export const VAT_DINE_IN = 8.1;
export const VAT_TAKEAWAY = 2.6;

export const VAT_RATES = [VAT_DINE_IN, VAT_TAKEAWAY] as const;

export type VatOrderFields = {
  table_number?: string | number | null;
  order_type?: string | null;
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
