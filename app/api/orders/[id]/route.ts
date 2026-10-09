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
    const supabase = getSupabaseAdmin();

    // Falls back to status only if the prep_minutes column does not exist yet.
    let prepMinutes: number | null = null;
    let status: string | null = null;

    const withPrep = await supabase
      .from("orders")
      .select("status, prep_minutes")
      .eq("id", id)
      .eq("restaurant_id", restaurantId)
      .maybeSingle();

    if (!withPrep.error) {
      status = withPrep.data?.status ?? null;
      prepMinutes =
        typeof withPrep.data?.prep_minutes === "number"
          ? withPrep.data.prep_minutes
          : null;
    } else {
      const plain = await supabase
        .from("orders")
        .select("status")
        .eq("id", id)
        .eq("restaurant_id", restaurantId)
        .maybeSingle();
      if (plain.error) throw plain.error;
      status = plain.data?.status ?? null;
    }

    if (!status) {
      return NextResponse.json(
        { error: "Bestellung nicht gefunden." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { status, prepMinutes },
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
