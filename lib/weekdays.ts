export const WEEKDAY_KEYS = [1, 2, 3, 4, 5, 6, 7] as const;

export type WeekdayKey = (typeof WEEKDAY_KEYS)[number];

export const WEEKDAY_SHORT_DE: Record<WeekdayKey, string> = {
  1: "Mo",
  2: "Di",
  3: "Mi",
  4: "Do",
  5: "Fr",
  6: "Sa",
  7: "So",
};

export const WEEKDAY_LONG_DE: Record<WeekdayKey, string> = {
  1: "Montag",
  2: "Dienstag",
  3: "Mittwoch",
  4: "Donnerstag",
  5: "Freitag",
  6: "Samstag",
  7: "Sonntag",
};

const ZURICH_WEEKDAY_INDEX: Record<string, WeekdayKey> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

export function currentZurichWeekday(now: Date = new Date()): WeekdayKey {
  const short = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "Europe/Zurich",
  }).format(now);
  return ZURICH_WEEKDAY_INDEX[short] ?? 1;
}

// null means "every day". An empty or full selection is treated the same way.
export function readAvailableDays(value: unknown): WeekdayKey[] | null {
  if (!Array.isArray(value)) return null;
  const days = new Set<WeekdayKey>();
  for (const entry of value) {
    const day = Number(entry);
    if ((WEEKDAY_KEYS as readonly number[]).includes(day)) days.add(day as WeekdayKey);
  }
  if (days.size === 0 || days.size === WEEKDAY_KEYS.length) return null;
  return [...days].sort((a, b) => a - b);
}

export function isAvailableOnWeekday(
  days: WeekdayKey[] | null,
  weekday: WeekdayKey
): boolean {
  return days === null || days.includes(weekday);
}

export function describeAvailableDays(days: WeekdayKey[] | null): string | null {
  if (!days) return null;
  return days.map((day) => WEEKDAY_SHORT_DE[day]).join(", ");
}
