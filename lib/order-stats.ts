import { VAT_RATES, vatPartCents, vatRateFor } from "./vat";

export type StatsPeriod = "today" | "7d" | "30d" | "12m";

export type StatsOrder = {
  status: string;
  total_cents: number;
  created_at: string;
  paid_at?: string | null;
  table_number?: string | number | null;
  order_type?: string | null;
  order_items: { item_name: string; quantity: number; unit_price_cents: number }[] | null;
};

export type Bar = { key: string; label: string; value: number };

export type TopItem = { name: string; quantity: number; revenueCents: number };

export type OrderStats = {
  revenueCents: number;
  orderCount: number;
  averageCents: number;
  salesBars: Bar[];
  hourBars: Bar[];
  weekdayBars: Bar[];
  topItems: TopItem[];
};

const TIME_ZONE = "Europe/Zurich";
const DAY_MS = 86_400_000;
const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTH_LABELS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

const zurichParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
});

type ZurichDate = { year: number; month: number; day: number; hour: number };

function toZurich(date: Date): ZurichDate {
  const parts = Object.fromEntries(
    zurichParts.formatToParts(date).map((part) => [part.type, part.value])
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour) % 24,
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function dayKeyFromUtc(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function calendarDate(z: ZurichDate) {
  return new Date(Date.UTC(z.year, z.month - 1, z.day));
}

function mondayIndex(date: Date) {
  return (date.getUTCDay() + 6) % 7;
}

function weekStart(date: Date) {
  return new Date(date.getTime() - mondayIndex(date) * DAY_MS);
}

function dayLabel(date: Date) {
  return `${pad(date.getUTCDate())}.${pad(date.getUTCMonth() + 1)}.`;
}

export const PERIOD_DAYS: Record<StatsPeriod, number> = {
  today: 1,
  "7d": 7,
  "30d": 30,
  "12m": 366,
};

/** Fetch window with a safety margin; exact filtering happens in computeStats. */
export function periodStartIso(period: StatsPeriod, now = new Date()) {
  return new Date(now.getTime() - (PERIOD_DAYS[period] + 1) * DAY_MS).toISOString();
}

function buildSalesBuckets(period: StatsPeriod, now: Date): Bar[] {
  const today = calendarDate(toZurich(now));

  if (period === "today") {
    return Array.from({ length: 24 }, (_, hour) => ({
      key: String(hour),
      label: pad(hour),
      value: 0,
    }));
  }

  if (period === "7d") {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today.getTime() - (6 - index) * DAY_MS);
      return {
        key: dayKeyFromUtc(date),
        label: `${WEEKDAY_LABELS[mondayIndex(date)]} ${dayLabel(date)}`,
        value: 0,
      };
    });
  }

  if (period === "30d") {
    const first = weekStart(new Date(today.getTime() - 29 * DAY_MS));
    const bars: Bar[] = [];
    for (let date = first; date <= today; date = new Date(date.getTime() + 7 * DAY_MS)) {
      bars.push({ key: dayKeyFromUtc(date), label: `ab ${dayLabel(date)}`, value: 0 });
    }
    return bars;
  }

  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - (11 - index), 1));
    return {
      key: `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`,
      label: `${MONTH_LABELS[date.getUTCMonth()]} ${String(date.getUTCFullYear()).slice(2)}`,
      value: 0,
    };
  });
}

function periodFirstDayKey(period: StatsPeriod, now: Date) {
  const today = calendarDate(toZurich(now));
  if (period === "12m") {
    return dayKeyFromUtc(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 11, 1)));
  }
  return dayKeyFromUtc(new Date(today.getTime() - (PERIOD_DAYS[period] - 1) * DAY_MS));
}

function salesBucketKey(period: StatsPeriod, z: ZurichDate) {
  const date = calendarDate(z);
  if (period === "today") return String(z.hour);
  if (period === "7d") return dayKeyFromUtc(date);
  if (period === "30d") return dayKeyFromUtc(weekStart(date));
  return `${z.year}-${pad(z.month)}`;
}

export function computeStats(orders: StatsOrder[], period: StatsPeriod, now = new Date()): OrderStats {
  const firstDayKey = periodFirstDayKey(period, now);
  const salesBars = buildSalesBuckets(period, now);
  const salesIndex = new Map(salesBars.map((bar, index) => [bar.key, index]));
  const hourBars: Bar[] = Array.from({ length: 24 }, (_, hour) => ({
    key: String(hour),
    label: pad(hour),
    value: 0,
  }));
  const weekdayBars: Bar[] = WEEKDAY_LABELS.map((label) => ({ key: label, label, value: 0 }));
  const items = new Map<string, TopItem>();

  let revenueCents = 0;
  let orderCount = 0;

  for (const order of orders) {
    if (order.status === "cancelled") continue;

    const z = toZurich(new Date(order.created_at));
    const date = calendarDate(z);
    if (dayKeyFromUtc(date) < firstDayKey) continue;

    const total = Number(order.total_cents) || 0;
    revenueCents += total;
    orderCount += 1;

    const salesPosition = salesIndex.get(salesBucketKey(period, z));
    if (salesPosition !== undefined) salesBars[salesPosition].value += total;
    hourBars[z.hour].value += 1;
    weekdayBars[mondayIndex(date)].value += 1;

    for (const item of order.order_items || []) {
      const name = item.item_name?.trim() || "—";
      const quantity = Number(item.quantity) || 0;
      const entry = items.get(name) || { name, quantity: 0, revenueCents: 0 };
      entry.quantity += quantity;
      entry.revenueCents += quantity * (Number(item.unit_price_cents) || 0);
      items.set(name, entry);
    }
  }

  const topItems = [...items.values()]
    .sort((a, b) => b.quantity - a.quantity || b.revenueCents - a.revenueCents)
    .slice(0, 10);

  return {
    revenueCents,
    orderCount,
    averageCents: orderCount ? Math.round(revenueCents / orderCount) : 0,
    salesBars,
    hourBars,
    weekdayBars,
    topItems,
  };
}

export type DayOption = { key: string; label: string };

export type VatLine = { rate: number; grossCents: number; vatCents: number };

export type DaySummary = {
  vatLines: VatLine[];
  totalVatCents: number;
  orderCount: number;
  revenueCents: number;
  averageCents: number;
  paidCount: number;
  paidCents: number;
  unpaidCount: number;
  unpaidCents: number;
  cancelledCount: number;
  cancelledCents: number;
  topItems: TopItem[];
};

/** The last `count` Zurich calendar days, newest first, for the day picker. */
export function dayOptions(count = 30, now = new Date()): DayOption[] {
  const today = calendarDate(toZurich(now));
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today.getTime() - index * DAY_MS);
    const formatted = `${WEEKDAY_LABELS[mondayIndex(date)]} ${dayLabel(date)}${date.getUTCFullYear()}`;
    const prefix = index === 0 ? "Heute · " : index === 1 ? "Gestern · " : "";
    return { key: dayKeyFromUtc(date), label: `${prefix}${formatted}` };
  });
}

/** UTC window that safely contains the whole Zurich calendar day `dayKey`. */
export function dayFetchWindow(dayKey: string) {
  const midnightUtc = new Date(`${dayKey}T00:00:00Z`).getTime();
  return {
    fromIso: new Date(midnightUtc - DAY_MS).toISOString(),
    toIso: new Date(midnightUtc + 2 * DAY_MS).toISOString(),
  };
}

/** Zurich calendar day (YYYY-MM-DD) of a timestamp. */
export function zurichDayKey(iso: string) {
  return dayKeyFromUtc(calendarDate(toZurich(new Date(iso))));
}

/** The last `count` Zurich months, newest first, as `YYYY-MM` keys with German labels. */
export function monthOptions(count = 12, now = new Date()): DayOption[] {
  const today = calendarDate(toZurich(now));
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - index, 1));
    return {
      key: `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`,
      label: `${MONTH_LABELS[date.getUTCMonth()]} ${date.getUTCFullYear()}`,
    };
  });
}

/** UTC window that safely contains the whole Zurich month `monthKey` (YYYY-MM). */
export function monthFetchWindow(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const start = Date.UTC(year, month - 1, 1);
  const end = Date.UTC(year, month, 1);
  return {
    fromIso: new Date(start - DAY_MS).toISOString(),
    toIso: new Date(end + DAY_MS).toISOString(),
  };
}

export function computeDaySummary(orders: StatsOrder[], dayKey: string): DaySummary {
  const items = new Map<string, TopItem>();
  let orderCount = 0;
  let revenueCents = 0;
  let paidCount = 0;
  let paidCents = 0;
  let cancelledCount = 0;
  let cancelledCents = 0;
  const grossByRate = new Map<number, number>(VAT_RATES.map((rate) => [rate, 0]));

  for (const order of orders) {
    const key = dayKeyFromUtc(calendarDate(toZurich(new Date(order.created_at))));
    if (key !== dayKey) continue;

    const total = Number(order.total_cents) || 0;
    if (order.status === "cancelled") {
      cancelledCount += 1;
      cancelledCents += total;
      continue;
    }

    orderCount += 1;
    revenueCents += total;
    const rate = vatRateFor(order);
    grossByRate.set(rate, (grossByRate.get(rate) ?? 0) + total);
    if (order.paid_at) {
      paidCount += 1;
      paidCents += total;
    }

    for (const item of order.order_items || []) {
      const name = item.item_name?.trim() || "—";
      const quantity = Number(item.quantity) || 0;
      const entry = items.get(name) || { name, quantity: 0, revenueCents: 0 };
      entry.quantity += quantity;
      entry.revenueCents += quantity * (Number(item.unit_price_cents) || 0);
      items.set(name, entry);
    }
  }

  const topItems = [...items.values()]
    .sort((a, b) => b.quantity - a.quantity || b.revenueCents - a.revenueCents)
    .slice(0, 5);

  const vatLines: VatLine[] = VAT_RATES.map((rate) => {
    const grossCents = grossByRate.get(rate) ?? 0;
    return { rate, grossCents, vatCents: vatPartCents(grossCents, rate) };
  });

  return {
    vatLines,
    totalVatCents: vatLines.reduce((sum, line) => sum + line.vatCents, 0),
    orderCount,
    revenueCents,
    averageCents: orderCount ? Math.round(revenueCents / orderCount) : 0,
    paidCount,
    paidCents,
    unpaidCount: orderCount - paidCount,
    unpaidCents: revenueCents - paidCents,
    cancelledCount,
    cancelledCents,
    topItems,
  };
}

export function formatChf(cents: number) {
  return new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(cents / 100);
}
