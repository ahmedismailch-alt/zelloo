import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-server";
import { parseOptionGroups } from "../../../lib/menu-options";

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
      groups?: unknown;
    } | null;

    const itemIds = Array.isArray(body?.itemIds)
      ? body.itemIds.filter((id): id is string => typeof id === "string")
      : [];
    if (itemIds.length === 0 || itemIds.length > MAX_ITEMS) {
      return NextResponse.json({ error: "Ungültige Auswahl." }, { status: 400 });
    }

    const newGroups = parseOptionGroups(body?.groups);
    if (newGroups.length === 0) {
      return NextResponse.json({ error: "Ungültige Optionen." }, { status: 400 });
    }
    const newGroupIds = new Set(newGroups.map((group) => group.id));

    const { data: items, error: itemsError } = await admin
      .from("menu_items")
      .select("id, options")
      .in("id", itemIds)
      .eq("restaurant_id", restaurant.id);

    if (itemsError) {
      console.error("Zelloo bulk options error:", itemsError.message);
      return NextResponse.json(
        { error: "Optionen konnten nicht gespeichert werden." },
        { status: 500 }
      );
    }

    const results = await Promise.all(
      (items || []).map(async (item) => {
        const kept = parseOptionGroups(item.options).filter(
          (group) => !newGroupIds.has(group.id)
        );
        const merged = parseOptionGroups([...kept, ...newGroups]);

        const { error } = await admin
          .from("menu_items")
          .update({ options: merged })
          .eq("id", item.id)
          .eq("restaurant_id", restaurant.id);

        return error ? null : { id: String(item.id), options: merged };
      })
    );

    const updated = results.filter(
      (row): row is NonNullable<typeof row> => row !== null
    );
    if (updated.length === 0 && (items || []).length > 0) {
      return NextResponse.json(
        { error: "Optionen konnten nicht gespeichert werden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ updated });
  } catch (error) {
    console.error("Zelloo bulk options error:", error);
    return NextResponse.json(
      { error: "Optionen konnten nicht gespeichert werden." },
      { status: 500 }
    );
  }
}
