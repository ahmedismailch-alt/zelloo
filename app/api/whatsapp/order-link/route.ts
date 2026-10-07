import { NextResponse } from "next/server";
import { isValidRestaurantId } from "../../../../lib/supabase-server";
import { getWhatsAppOrderLink } from "../../../../lib/whatsapp";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get("restaurantId");

  if (!isValidRestaurantId(restaurantId)) {
    return NextResponse.json({ error: "Ungültiges Restaurant." }, { status: 400 });
  }

  const link = getWhatsAppOrderLink(restaurantId);
  if (!link) {
    return NextResponse.json(
      { error: "WhatsApp-Bestellungen sind noch nicht eingerichtet." },
      { status: 503 }
    );
  }

  return NextResponse.json({ link });
}
