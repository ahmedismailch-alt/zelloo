import { NextResponse } from "next/server";
import {
  getRestaurant,
  getRestaurantAccess,
  getRestaurantSettings,
  getSupabaseAdmin,
  isValidRestaurantId,
} from "../../../lib/supabase-server";
import { getReservationConfig } from "../../../lib/reservations-server";
import { resolveReservationTime } from "../../../lib/reservations";

export const runtime = "nodejs";

const MAX_OPEN_PER_PHONE = 3;
const MAX_NEW_PER_RESTAURANT = 60;
const PHONE_PATTERN = /^[+0-9 ()/.-]{6,30}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function fail(code: string, error: string, status: number) {
  return NextResponse.json({ error, code }, { status });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return fail("invalid", "Ungültige Anfrage.", 400);
  }

  const restaurantId = body.restaurantId;
  if (!isValidRestaurantId(restaurantId)) {
    return fail("invalid", "Ungültiges Restaurant.", 400);
  }

  const guestName = clean(body.guestName, 80);
  const guestPhone = clean(body.guestPhone, 30);
  const guestEmail = clean(body.guestEmail, 120);
  const note = clean(body.note, 300);
  const date = clean(body.date, 10);
  const time = clean(body.time, 5);
  const partySize = Number(body.partySize);

  if (!guestName || !PHONE_PATTERN.test(guestPhone)) {
    return fail("contact", "Name und Telefonnummer erforderlich.", 400);
  }
  if (guestEmail && !EMAIL_PATTERN.test(guestEmail)) {
    return fail("contact", "Ungültige E-Mail-Adresse.", 400);
  }
  if (!Number.isInteger(partySize) || partySize < 1) {
    return fail("party", "Ungültige Personenzahl.", 400);
  }

  try {
    const restaurant = await getRestaurant(restaurantId);
    if (!restaurant) return fail("unavailable", "Restaurant nicht gefunden.", 404);

    const [config, access, settings] = await Promise.all([
      getReservationConfig(restaurant.id),
      getRestaurantAccess(restaurant.id),
      getRestaurantSettings(restaurant.id),
    ]);

    if (!config.enabled || !access.allowed) {
      return fail("unavailable", "Reservierungen sind nicht möglich.", 403);
    }
    if (partySize > config.maxParty) {
      return fail("party", "Zu viele Personen für eine Online-Reservierung.", 400);
    }

    const reservedAt = resolveReservationTime(settings.openingHours, date, time);
    if (!reservedAt) {
      return fail("slot", "Diese Zeit ist nicht verfügbar.", 400);
    }

    const supabase = getSupabaseAdmin();
    const nowIso = new Date().toISOString();

    const [{ count: phoneOpen }, { count: restaurantNew }] = await Promise.all([
      supabase
        .from("reservations")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurant.id)
        .eq("guest_phone", guestPhone)
        .in("status", ["new", "confirmed"])
        .gte("reserved_at", nowIso),
      supabase
        .from("reservations")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurant.id)
        .eq("status", "new")
        .gte("reserved_at", nowIso),
    ]);

    if ((phoneOpen ?? 0) >= MAX_OPEN_PER_PHONE || (restaurantNew ?? 0) >= MAX_NEW_PER_RESTAURANT) {
      return fail("limit", "Zu viele offene Reservierungen.", 429);
    }

    const { data, error } = await supabase
      .from("reservations")
      .insert({
        restaurant_id: restaurant.id,
        guest_name: guestName,
        guest_phone: guestPhone,
        guest_email: guestEmail || null,
        party_size: partySize,
        reserved_at: reservedAt,
        note: note || null,
      })
      .select("id")
      .single();

    if (error) throw error;
    return NextResponse.json({ reservationId: data.id }, { status: 201 });
  } catch (error) {
    console.error("Zelloo reservation error:", error);
    return fail("server", "Reservierung konnte nicht gespeichert werden.", 500);
  }
}
