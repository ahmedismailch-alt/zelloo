import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-server";
import { isDealCategory } from "../../../lib/menu-category-order";

export const runtime = "nodejs";

const DEFAULT_DEAL_CATEGORY = "Tagesangebote";
const MAX_NAME_LENGTH = 80;
const MAX_PRICE = 10000;

type OwnerResult =
  | { ok: true; restaurantId: string | number }
  | { ok: false; response: NextResponse };

async function findOwnerRestaurant(request: Request): Promise<OwnerResult> {
  const admin = getSupabaseAdmin();

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 }),
    };
  }

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 }),
    };
  }

  const { data: restaurant, error } = await admin
    .from("restaurants")
    .select("id")
    .eq("owner_id", userData.user.id)
    .maybeSingle();

  if (error || !restaurant) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Restaurant konnte nicht gefunden werden." },
        { status: 403 }
      ),
    };
  }

  return { ok: true, restaurantId: restaurant.id };
}

function parsePrice(value: unknown): number | null {
  const raw = typeof value === "string" ? value.replace(",", ".") : value;
  const parsed = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > MAX_PRICE) return null;
  return Math.round(parsed * 100) / 100;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const owner = await findOwnerRestaurant(request);
  if (!owner.ok) return NextResponse.json({ owner: false });

  const requested = new URL(request.url).searchParams.get("restaurantId");
  return NextResponse.json({
    owner: requested !== null && String(owner.restaurantId) === requested,
  });
}

export async function POST(request: Request) {
  try {
    const owner = await findOwnerRestaurant(request);
    if (!owner.ok) return owner.response;

    const body = (await request.json().catch(() => null)) as {
      name?: unknown;
      price?: unknown;
      comparePrice?: unknown;
      imageUrl?: unknown;
    } | null;

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name || name.length > MAX_NAME_LENGTH) {
      return NextResponse.json({ error: "Bitte einen Namen eingeben." }, { status: 400 });
    }

    const price = parsePrice(body?.price);
    if (price === null) {
      return NextResponse.json(
        { error: "Bitte einen gültigen Angebotspreis eingeben." },
        { status: 400 }
      );
    }

    const hasCompare =
      body?.comparePrice !== undefined &&
      body.comparePrice !== null &&
      String(body.comparePrice).trim() !== "";
    let comparePrice: number | null = null;
    if (hasCompare) {
      comparePrice = parsePrice(body?.comparePrice);
      if (comparePrice === null || comparePrice <= price) {
        return NextResponse.json(
          { error: "Der normale Preis muss höher als der Angebotspreis sein." },
          { status: 400 }
        );
      }
    }

    const imageUrl =
      typeof body?.imageUrl === "string" ? body.imageUrl.trim() : "";
    if (imageUrl && (imageUrl.length > 500 || !isHttpUrl(imageUrl))) {
      return NextResponse.json({ error: "Ungültiges Bild." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    const { data: categoryRows } = await admin
      .from("menu_items")
      .select("category")
      .eq("restaurant_id", owner.restaurantId)
      .limit(500);

    const existingDealCategory = (categoryRows || [])
      .map((row) => (typeof row.category === "string" ? row.category.trim() : ""))
      .find((category) => category && isDealCategory(category));

    const { data: inserted, error: insertError } = await admin
      .from("menu_items")
      .insert({
        restaurant_id: owner.restaurantId,
        name,
        category: existingDealCategory || DEFAULT_DEAL_CATEGORY,
        price,
        compare_price: comparePrice,
        currency: "CHF",
        is_available: true,
        is_confirmed: true,
        image_url: imageUrl || null,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Zelloo deal create error:", insertError.message);
      return NextResponse.json(
        { error: "Angebot konnte nicht gespeichert werden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: String(inserted.id) });
  } catch (error) {
    console.error("Zelloo deal create error:", error);
    return NextResponse.json(
      { error: "Angebot konnte nicht gespeichert werden." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const owner = await findOwnerRestaurant(request);
    if (!owner.ok) return owner.response;

    const body = (await request.json().catch(() => null)) as {
      itemId?: unknown;
    } | null;
    const itemId =
      typeof body?.itemId === "string" || typeof body?.itemId === "number"
        ? String(body.itemId)
        : "";
    if (!itemId) {
      return NextResponse.json({ error: "Ungültige Auswahl." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    const { data: item } = await admin
      .from("menu_items")
      .select("id, category")
      .eq("id", itemId)
      .eq("restaurant_id", owner.restaurantId)
      .maybeSingle();

    if (!item) {
      return NextResponse.json({ error: "Angebot nicht gefunden." }, { status: 404 });
    }

    const category = typeof item.category === "string" ? item.category : "";
    if (!isDealCategory(category)) {
      return NextResponse.json(
        { error: "Nur Angebote können hier beendet werden." },
        { status: 400 }
      );
    }

    const { error: deleteError } = await admin
      .from("menu_items")
      .delete()
      .eq("id", itemId)
      .eq("restaurant_id", owner.restaurantId);

    if (deleteError) {
      console.error("Zelloo deal end error:", deleteError.message);
      return NextResponse.json(
        { error: "Angebot konnte nicht beendet werden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Zelloo deal end error:", error);
    return NextResponse.json(
      { error: "Angebot konnte nicht beendet werden." },
      { status: 500 }
    );
  }
}
