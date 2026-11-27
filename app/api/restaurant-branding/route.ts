import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-server";
import {
  readBrandColor,
  readGoogleReviewUrl,
  readHexColor,
} from "../../../lib/branding";
import { readVatNumber } from "../../../lib/vat";

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
      logoUrl?: unknown;
      brandColor?: unknown;
      themeBg?: unknown;
      themeText?: unknown;
      googleReviewUrl?: unknown;
      vatNumber?: unknown;
    } | null;

    const update: Record<string, string | null> = {};

    if (body && "logoUrl" in body) {
      if (body.logoUrl === null) {
        update.logo_url = null;
      } else {
        const allowedPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${restaurant.id}/`;
        if (
          typeof body.logoUrl !== "string" ||
          !body.logoUrl.startsWith(allowedPrefix)
        ) {
          return NextResponse.json({ error: "Ungültiges Logo." }, { status: 400 });
        }
        update.logo_url = body.logoUrl;
      }
    }

    if (body && "brandColor" in body) {
      if (body.brandColor === null) {
        update.brand_color = null;
      } else {
        const color = readBrandColor(body.brandColor);
        if (!color) {
          return NextResponse.json({ error: "Ungültige Farbe." }, { status: 400 });
        }
        update.brand_color = color;
      }
    }

    for (const [key, column] of [
      ["themeBg", "theme_bg"],
      ["themeText", "theme_text"],
    ] as const) {
      if (!body || !(key in body)) continue;
      const value = (body as Record<string, unknown>)[key];
      if (value === null) {
        update[column] = null;
        continue;
      }
      const color = readHexColor(value);
      if (!color) {
        return NextResponse.json({ error: "Ungültige Farbe." }, { status: 400 });
      }
      update[column] = color;
    }

    if (body && "googleReviewUrl" in body) {
      if (body.googleReviewUrl === null) {
        update.google_review_url = null;
      } else {
        const reviewUrl = readGoogleReviewUrl(body.googleReviewUrl);
        if (!reviewUrl) {
          return NextResponse.json(
            { error: "Bitte einen gültigen Google-Link (https) eingeben." },
            { status: 400 }
          );
        }
        update.google_review_url = reviewUrl;
      }
    }

    if (body && "vatNumber" in body) {
      if (body.vatNumber === null) {
        update.vat_number = null;
      } else {
        const vatNumber = readVatNumber(body.vatNumber);
        if (!vatNumber) {
          return NextResponse.json(
            { error: "Bitte eine gültige MWST-Nummer eingeben (z. B. CHE-123.456.789 MWST)." },
            { status: 400 }
          );
        }
        update.vat_number = vatNumber;
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Keine Änderung." }, { status: 400 });
    }

    const { error: updateError } = await admin
      .from("restaurants")
      .update(update)
      .eq("id", restaurant.id);

    if (updateError) {
      console.error("Zelloo branding save error:", updateError.message);
      return NextResponse.json(
        { error: "Branding konnte nicht gespeichert werden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Zelloo branding error:", error);
    return NextResponse.json(
      { error: "Branding konnte nicht gespeichert werden." },
      { status: 500 }
    );
  }
}
