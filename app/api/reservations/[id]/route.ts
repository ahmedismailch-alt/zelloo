import { NextResponse } from "next/server";
import { getSupabaseAdmin, isValidRestaurantId } from "../../../../lib/supabase-server";
import { sendEmail, reservationStatusEmail } from "../../../../lib/email";
import { formatReservationWhen } from "../../../../lib/reservations";

export const runtime = "nodejs";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const OWNER_STATUSES = ["confirmed", "declined", "cancelled"] as const;
type OwnerStatus = (typeof OWNER_STATUSES)[number];

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const restaurantId = new URL(request.url).searchParams.get("restaurant");

  if (!UUID_PATTERN.test(id) || !isValidRestaurantId(restaurantId)) {
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("reservations")
    .select("status, reserved_at, party_size, restaurants (name)")
    .eq("id", id)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  }

  const restaurant = data.restaurants as unknown as { name: string } | null;
  return NextResponse.json(
    {
      status: data.status,
      reservedAt: data.reserved_at,
      partySize: data.party_size,
      restaurantName: restaurant?.name ?? "",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  let status: OwnerStatus;
  try {
    const body = (await request.json()) as { status?: unknown };
    if (!OWNER_STATUSES.includes(body.status as OwnerStatus)) {
      return NextResponse.json({ error: "Ungültiger Status." }, { status: 400 });
    }
    status = body.status as OwnerStatus;
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
    }

    const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .select("id, name")
      .eq("owner_id", userData.user.id)
      .maybeSingle();
    if (restaurantError) throw restaurantError;
    if (!restaurant) {
      return NextResponse.json({ error: "Kein Restaurant." }, { status: 403 });
    }

    const { data: reservation, error: readError } = await supabase
      .from("reservations")
      .select("id, status, guest_name, guest_email, party_size, reserved_at, restaurant_id")
      .eq("id", id)
      .eq("restaurant_id", restaurant.id)
      .maybeSingle();
    if (readError) throw readError;
    if (!reservation) {
      return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
    }

    if (reservation.status !== status) {
      const { error: updateError } = await supabase
        .from("reservations")
        .update({ status })
        .eq("id", reservation.id);
      if (updateError) throw updateError;

      if (reservation.guest_email) {
        const email = reservationStatusEmail({
          restaurantName: restaurant.name,
          guestName: reservation.guest_name,
          status,
          when: formatReservationWhen(reservation.reserved_at, "de-CH"),
          partySize: reservation.party_size,
          statusUrl: `https://zelloo.ch/reservation/${reservation.id}?r=${restaurant.id}`,
        });
        await sendEmail({ to: reservation.guest_email, ...email }).catch((error) =>
          console.error("Zelloo reservation email error:", error)
        );
      }
    }

    return NextResponse.json({ ok: true, status });
  } catch (error) {
    console.error("Zelloo reservation update error:", error);
    return NextResponse.json({ error: "Speichern fehlgeschlagen." }, { status: 500 });
  }
}
