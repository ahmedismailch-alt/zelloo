import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-server";

export const runtime = "nodejs";

const CONFIRM_WORD = "LÖSCHEN";

export async function POST(request: Request) {
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

    const { data: restaurant, error: restaurantError } = await admin
      .from("restaurants")
      .select("id")
      .eq("owner_id", userData.user.id)
      .maybeSingle();

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: "Restaurant konnte nicht gefunden werden." },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => null)) as {
      confirm?: unknown;
    } | null;

    if (body?.confirm !== CONFIRM_WORD) {
      return NextResponse.json(
        { error: "Bestätigung fehlt." },
        { status: 400 }
      );
    }

    const { data: deleted, error: deleteError } = await admin
      .from("menu_items")
      .delete()
      .eq("restaurant_id", restaurant.id)
      .select("id");

    if (deleteError) {
      console.error("Zelloo delete all menu error:", deleteError.message);
      return NextResponse.json(
        {
          error:
            "Speisekarte konnte nicht gelöscht werden. Möglicherweise sind Gerichte mit bestehenden Bestellungen verknüpft.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ deletedCount: (deleted || []).length });
  } catch (error) {
    console.error("Zelloo delete all menu error:", error);
    return NextResponse.json(
      { error: "Speisekarte konnte nicht gelöscht werden." },
      { status: 500 }
    );
  }
}
