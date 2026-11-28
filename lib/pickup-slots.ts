import { defaultOpeningHours, type OpeningHours } from "./restaurant-settings";
import { upcomingDays, zurichTimeLabel, zurichToUtcMs } from "./reservations";

const SLOT_STEP_MINUTES = 15;
const MIN_LEAD_MINUTES = 10;
// The server accepts a slot slightly earlier than the client offered, because
// the customer may have kept the cart open for a few minutes.
const SERVER_LEAD_MINUTES = 5;
const LAST_SLOT_OF_DAY = 23 * 60 + 45;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatMinutes(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function todayWindow(hours: OpeningHours | null, now: Date) {
  const today = upcomingDays(now, 1)[0];
  const entry = (hours ?? defaultOpeningHours())[today.weekday];
  if (!entry || entry.closed) return null;
  const open = toMinutes(entry.open);
  const close = toMinutes(entry.close);
  return {
    date: today.date,
    open,
    close: close > open ? close : LAST_SLOT_OF_DAY,
  };
}

export function pickupSlotsToday(
  hours: OpeningHours | null,
  waitMinutes: number | null,
  now = new Date()
): string[] {
  const window = todayWindow(hours, now);
  if (!window) return [];

  const lead = Math.max(waitMinutes ?? 0, MIN_LEAD_MINUTES);
  const nowMinutes = toMinutes(zurichTimeLabel(now.toISOString()));
  const earliest = Math.max(
    window.open,
    Math.ceil((nowMinutes + lead) / SLOT_STEP_MINUTES) * SLOT_STEP_MINUTES
  );

  const slots: string[] = [];
  for (let minutes = earliest; minutes <= window.close; minutes += SLOT_STEP_MINUTES) {
    slots.push(formatMinutes(minutes));
  }
  return slots;
}

// Returns the pickup moment as an ISO timestamp, or null if the requested time
// is malformed, in the past, or outside today's opening hours.
export function resolvePickupTime(
  hours: OpeningHours | null,
  time: unknown,
  now = new Date()
): string | null {
  if (typeof time !== "string" || !TIME_PATTERN.test(time)) return null;
  const window = todayWindow(hours, now);
  if (!window) return null;

  const minutes = toMinutes(time);
  if (minutes < window.open || minutes > window.close) return null;

  const utcMs = zurichToUtcMs(window.date, time);
  if (utcMs < now.getTime() + SERVER_LEAD_MINUTES * 60000) return null;
  return new Date(utcMs).toISOString();
}
