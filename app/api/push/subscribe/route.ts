import { NextResponse } from "next/server";
import { getSupabaseAdmin, isValidRestaurantId } from "../../../../lib/supabase-server";
import { ORDER_LANGS } from "../../../../lib/order-i18n";

export const runtime = "nodejs";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_SUBSCRIPTIONS_PER_ORDER = 3;
const ACTIVE_STATUSES = ["new", "accepted", "preparing"];

type Body = {
  orderId?: unknown;
  restaurantId?: unknown;
  lang?: unknown;
  subscription?: {
    endpoint?: unknown;
    keys?: { p256dh?: unknown; auth?: unknown };
  };
};

function readText(value: unknown, maxLength: number): string | null {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength
    ? value
    : null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Body | null;

  const orderId = readText(body?.orderId, 36);
  const restaurantId = body?.restaurantId;
  const endpoint = readText(body?.subscription?.endpoint, 2048);
  const p256dh = readText(body?.subscription?.keys?.p256dh, 256);
  const auth = readText(body?.subscription?.keys?.auth, 256);

  if (
    !orderId ||
    !UUID_PATTERN.test(orderId) ||
    !isValidRestaurantId(restaurantId) ||
    !endpoint ||
    !endpoint.startsWith("https://") ||
    !p256dh ||
    !auth
  ) {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const lang =
    typeof body?.lang === "string" &&
    (ORDER_LANGS as readonly string[]).includes(body.lang)
      ? body.lang
      : "de";

  try {
    const admin = getSupabaseAdmin();

    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("id, status")
      .eq("id", orderId)
      .eq("restaurant_id", restaurantId)
      .maybeSingle();

    if (orderError) throw orderError;
    if (!order || !ACTIVE_STATUSES.includes(order.status)) {
      return NextResponse.json(
        { error: "Bestellung nicht gefunden." },
        { status: 404 }
      );
    }

    const { count, error: countError } = await admin
      .from("order_push_subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("order_id", orderId);

    if (countError) throw countError;
    if ((count ?? 0) >= MAX_SUBSCRIPTIONS_PER_ORDER) {
      return NextResponse.json({ error: "Zu viele Anfragen." }, { status: 429 });
    }

    const { error: upsertError } = await admin
      .from("order_push_subscriptions")
      .upsert(
        { order_id: orderId, endpoint, p256dh, auth, lang },
        { onConflict: "order_id,endpoint" }
      );

    if (upsertError) throw upsertError;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Zelloo push subscribe error:", error);
    return NextResponse.json(
      { error: "Benachrichtigung konnte nicht aktiviert werden." },
      { status: 500 }
    );
  }
}
