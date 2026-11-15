import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-server";

export const runtime = "nodejs";

const MAX_ITEMS = 200;

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
      itemIds?: unknown;
      category?: unknown;
    } | null;

    const category =
      typeof body?.category === "string" ? body.category.trim() : "";
    if (!category || category.length > 80) {
      return NextResponse.json({ error: "Ungültige Kategorie." }, { status: 400 });
    }

    const itemIds = Array.isArray(body?.itemIds)
      ? body.itemIds.filter((id): id is string => typeof id === "string")
      : [];
    if (itemIds.length === 0 || itemIds.length > MAX_ITEMS) {
      return NextResponse.json({ error: "Ungültige Auswahl." }, { status: 400 });
    }

    const { data: updated, error: updateError } = await admin
      .from("menu_items")
      .update({ category })
      .in("id", itemIds)
      .eq("restaurant_id", restaurant.id)
      .select("id");

    if (updateError) {
      console.error("Zelloo bulk category error:", updateError.message);
      return NextResponse.json(
        { error: "Kategorie konnte nicht geändert werden." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      category,
      updatedIds: (updated || []).map((row) => String(row.id)),
    });
  } catch (error) {
    console.error("Zelloo bulk category error:", error);
    return NextResponse.json(
      { error: "Kategorie konnte nicht geändert werden." },
      { status: 500 }
    );
  }
}
