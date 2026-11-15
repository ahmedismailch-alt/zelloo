import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../../lib/supabase-server";
import { sendReadyPush } from "../../../../../lib/push-server";

export const runtime = "nodejs";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  try {
    const admin = getSupabaseAdmin();

    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
    }

    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
    }

    const { data: restaurant } = await admin
      .from("restaurants")
      .select("id")
      .eq("owner_id", userData.user.id)
      .maybeSingle();

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant konnte nicht gefunden werden." },
        { status: 403 }
      );
    }

    const { data: order } = await admin
      .from("orders")
      .select("id, order_number, status")
      .eq("id", id)
      .eq("restaurant_id", restaurant.id)
      .maybeSingle();

    if (!order) {
      return NextResponse.json(
        { error: "Bestellung nicht gefunden." },
        { status: 404 }
      );
    }

    // Only notify for a state the database actually holds, never on the client's word.
    if (order.status !== "ready") {
      return NextResponse.json({ ok: true, sent: 0 });
    }

    const sent = await sendReadyPush({
      orderId: order.id,
      restaurantId: restaurant.id,
      orderNumber: typeof order.order_number === "number" ? order.order_number : null,
    });

    return NextResponse.json({ ok: true, sent });
  } catch (error) {
    console.error("Zelloo notify-ready error:", error);
    return NextResponse.json(
      { error: "Benachrichtigung konnte nicht gesendet werden." },
      { status: 500 }
    );
  }
}
