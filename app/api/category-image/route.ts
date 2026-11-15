import { NextResponse } from "next/server";
import {
  getSupabaseAdmin,
  readCategoryImages,
} from "../../../lib/supabase-server";

export const runtime = "nodejs";

const BUCKET = "menu-images";

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
      .select("id, category_images")
      .eq("owner_id", userData.user.id)
      .maybeSingle();

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: "Restaurant konnte nicht gefunden werden." },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => null)) as {
      category?: unknown;
      url?: unknown;
    } | null;

    const category =
      typeof body?.category === "string" ? body.category.trim() : "";
    if (!category || category.length > 80) {
      return NextResponse.json({ error: "Ungültige Kategorie." }, { status: 400 });
    }

    const images = readCategoryImages(restaurant.category_images);

    if (body?.url === null) {
      delete images[category];
    } else {
      const allowedPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${restaurant.id}/`;
      if (typeof body?.url !== "string" || !body.url.startsWith(allowedPrefix)) {
        return NextResponse.json({ error: "Ungültiges Bild." }, { status: 400 });
      }
      images[category] = body.url;
    }

    const { error: updateError } = await admin
      .from("restaurants")
      .update({ category_images: images })
      .eq("id", restaurant.id);

    if (updateError) {
      console.error("Zelloo category image save error:", updateError.message);
      return NextResponse.json(
        { error: "Kategorie-Foto konnte nicht gespeichert werden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ categoryImages: images });
  } catch (error) {
    console.error("Zelloo category image error:", error);
    return NextResponse.json(
      { error: "Kategorie-Foto konnte nicht gespeichert werden." },
      { status: 500 }
    );
  }
}
