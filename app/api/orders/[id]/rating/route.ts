import { NextResponse } from "next/server";
import {
  getSupabaseAdmin,
  isValidRestaurantId,
} from "../../../../../lib/supabase-server";

export const runtime = "nodejs";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const { restaurantId, rating } = (body ?? {}) as {
    restaurantId?: unknown;
    rating?: unknown;
  };

  if (
    !UUID_PATTERN.test(id) ||
    !isValidRestaurantId(restaurantId) ||
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("orders")
      .update({ rating })
      .eq("id", id)
      .eq("restaurant_id", restaurantId)
      .is("rating", null)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { error: "Bestellung nicht gefunden oder bereits bewertet." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Zelloo order rating error:", error);
    return NextResponse.json(
      { error: "Bewertung konnte nicht gespeichert werden." },
      { status: 500 }
    );
  }
}
