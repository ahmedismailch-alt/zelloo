import { NextResponse } from "next/server";
import {
  getOrderableMenu,
  isValidRestaurantId,
} from "../../../lib/supabase-server";
import { parseOrderText } from "../../../lib/order-ai";

export const runtime = "nodejs";

const MAX_TEXT_LENGTH = 500;

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY fehlt." },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => null);
    const restaurantId = body?.restaurantId;
    const text = typeof body?.text === "string" ? body.text.trim() : "";

    if (!isValidRestaurantId(restaurantId)) {
      return NextResponse.json(
        { error: "Ungültiges Restaurant." },
        { status: 400 }
      );
    }

    if (!text || text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Bitte geben Sie 1–${MAX_TEXT_LENGTH} Zeichen ein.` },
        { status: 400 }
      );
    }

    const menu = await getOrderableMenu(restaurantId);
    if (menu.length === 0) {
      return NextResponse.json(
        { error: "Keine bestellbaren Artikel vorhanden." },
        { status: 404 }
      );
    }

    const result = await parseOrderText(menu, text);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Zelloo order parse error:", error);
    return NextResponse.json(
      { error: "Bestellung konnte nicht verstanden werden." },
      { status: 500 }
    );
  }
}
