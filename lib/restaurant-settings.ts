export type OpeningDay = { closed: boolean; open: string; close: string };

// Index 0 = Monday ... 6 = Sunday.
export type OpeningHours = OpeningDay[];

export type Availability = "open" | "busy" | "paused" | "closed";

export type RestaurantSettings = {
  accepting: boolean;
  busy: boolean;
  openingHours: OpeningHours | null;
  deliveryFeeCents: number;
  deliveryMinCents: number;
  deliveryZones: string;
};

export const DAY_LABELS_DE = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
];

export const DEFAULT_SETTINGS: RestaurantSettings = {
  accepting: true,
  busy: false,
  openingHours: null,
  deliveryFeeCents: 0,
  deliveryMinCents: 0,
  deliveryZones: "",
};

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function defaultOpeningHours(): OpeningHours {
  return Array.from({ length: 7 }, () => ({
    closed: false,
    open: "11:00",
    close: "22:00",
  }));
}

export function parseOpeningHours(value: unknown): OpeningHours | null {
  if (!Array.isArray(value) || value.length !== 7) return null;
  const days: OpeningHours = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") return null;
    const day = raw as Record<string, unknown>;
    const closed = day.closed === true;
    const open = typeof day.open === "string" ? day.open : "";
    const close = typeof day.close === "string" ? day.close : "";
    if (!closed && (!TIME_PATTERN.test(open) || !TIME_PATTERN.test(close))) {
      return null;
    }
    days.push({
      closed,
      open: TIME_PATTERN.test(open) ? open : "11:00",
      close: TIME_PATTERN.test(close) ? close : "22:00",
    });
  }
  return days;
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

const WEEKDAY_INDEX: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

function zurichNow(now: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Zurich",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    day: WEEKDAY_INDEX[get("weekday")] ?? 0,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

// A closing time earlier than (or equal to) the opening time means the
// restaurant stays open past midnight into the next day.
export function isOpenNow(hours: OpeningHours | null, now = new Date()) {
  if (!hours) return true;
  const { day, minutes } = zurichNow(now);

  const today = hours[day];
  if (!today.closed) {
    const open = toMinutes(today.open);
    const close = toMinutes(today.close);
    if (close > open) {
      if (minutes >= open && minutes < close) return true;
    } else if (minutes >= open) {
      return true;
    }
  }

  const yesterday = hours[(day + 6) % 7];
  if (!yesterday.closed) {
    const open = toMinutes(yesterday.open);
    const close = toMinutes(yesterday.close);
    if (close <= open && minutes < close) return true;
  }

  return false;
}

export function getAvailability(
  settings: RestaurantSettings,
  now = new Date()
): Availability {
  if (!settings.accepting) return "paused";
  if (!isOpenNow(settings.openingHours, now)) return "closed";
  return settings.busy ? "busy" : "open";
}

export function canOrder(availability: Availability) {
  return availability === "open" || availability === "busy";
}

export function parseZones(value: string) {
  return value
    .split(/[,;\n]/)
    .map((zone) => zone.trim().toLowerCase())
    .filter(Boolean);
}

// With no zones configured, every address is accepted.
export function addressInZones(address: string, zonesText: string) {
  const zones = parseZones(zonesText);
  if (zones.length === 0) return true;
  const normalized = address.toLowerCase();
  return zones.some((zone) => normalized.includes(zone));
}
