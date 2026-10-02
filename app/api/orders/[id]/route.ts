import { NextResponse } from "next/server";
import {
  getSupabaseAdmin,
  isValidRestaurantId,
} from "../../../../lib/supabase-server";

export const runtime = "nodejs";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const restaurantId = new URL(request.url).searchParams.get("restaurant");

  if (!UUID_PATTERN.test(id) || !isValidRestaurantId(restaurantId)) {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("orders")
      .select("status")
      .eq("id", id)
      .eq("restaurant_id", restaurantId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { error: "Bestellung nicht gefunden." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { status: data.status },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Zelloo order status error:", error);
    return NextResponse.json(
      { error: "Status konnte nicht geladen werden." },
      { status: 500 }
    );
  }
}
