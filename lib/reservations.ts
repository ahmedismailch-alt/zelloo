import { defaultOpeningHours, type OpeningHours } from "./restaurant-settings";

export type ReservationStatus = "new" | "confirmed" | "declined" | "cancelled";

export type ReservationDay = {
  date: string; // YYYY-MM-DD in Europe/Zurich
  weekday: number; // 0 = Monday ... 6 = Sunday
};

export const BOOKING_DAYS = 14;
export const DEFAULT_MAX_PARTY = 12;
export const ABSOLUTE_MAX_PARTY = 50;

const SLOT_STEP_MINUTES = 30;
const LAST_SEATING_BEFORE_CLOSE_MINUTES = 60;
const MIN_LEAD_MINUTES = 30;

const zurichFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Zurich",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function zurichParts(utcMs: number) {
  const parts = zurichFormatter.formatToParts(new Date(utcMs));
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

function zurichOffsetMs(utcMs: number) {
  const p = zurichParts(utcMs);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  return asUtc - Math.floor(utcMs / 60000) * 60000;
}

// Converts a wall-clock time in Europe/Zurich to a UTC timestamp, DST included.
function zurichToUtcMs(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const naive = Date.UTC(year, month - 1, day, hour, minute);
  const first = naive - zurichOffsetMs(naive);
  return naive - zurichOffsetMs(first);
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatMinutes(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function upcomingDays(now = new Date(), count = BOOKING_DAYS): ReservationDay[] {
  const today = zurichParts(now.getTime());
  return Array.from({ length: count }, (_, offset) => {
    const date = new Date(Date.UTC(today.year, today.month - 1, today.day + offset));
    return {
      date: date.toISOString().slice(0, 10),
      weekday: (date.getUTCDay() + 6) % 7,
    };
  });
}

// Seatings every 30 minutes, the last one an hour before closing. Without
// configured opening hours the default 11:00-22:00 applies.
export function slotsForDay(
  hours: OpeningHours | null,
  day: ReservationDay,
  now = new Date()
): string[] {
  const entry = (hours ?? defaultOpeningHours())[day.weekday];
  if (!entry || entry.closed) return [];

  const open = toMinutes(entry.open);
  const close = toMinutes(entry.close);
  const lastSlot =
    close > open
      ? Math.max(open, close - LAST_SEATING_BEFORE_CLOSE_MINUTES)
      : 23 * 60 + 30;

  const earliest = now.getTime() + MIN_LEAD_MINUTES * 60000;
  const slots: string[] = [];
  for (let minutes = open; minutes <= lastSlot; minutes += SLOT_STEP_MINUTES) {
    const time = formatMinutes(minutes);
    if (zurichToUtcMs(day.date, time) >= earliest) slots.push(time);
  }
  return slots;
}

export function resolveReservationTime(
  hours: OpeningHours | null,
  date: string,
  time: string,
  now = new Date()
): string | null {
  const day = upcomingDays(now).find((candidate) => candidate.date === date);
  if (!day) return null;
  if (!slotsForDay(hours, day, now).includes(time)) return null;
  return new Date(zurichToUtcMs(date, time)).toISOString();
}

export function formatReservationWhen(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    timeZone: "Europe/Zurich",
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

export function zurichDateKey(iso: string) {
  const p = zurichParts(new Date(iso).getTime());
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export function zurichTimeLabel(iso: string) {
  const p = zurichParts(new Date(iso).getTime());
  return `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
}
