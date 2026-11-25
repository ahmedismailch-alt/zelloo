import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/supabase-server";

export const runtime = "nodejs";

type SupportMessageRow = {
  id: string | number;
  restaurant_id: string | number;
  message: string;
  created_at: string;
  read_at: string | null;
  restaurants: { name: string | null } | null;
};

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  try {
    const { data, error } = await supabase
      .from("admin_messages")
      .select("id, restaurant_id, message, created_at, read_at, restaurants(name)")
      .eq("sender", "restaurant")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    const messages = ((data || []) as unknown as SupportMessageRow[]).map((row) => ({
      id: row.id,
      restaurantId: row.restaurant_id,
      restaurantName: row.restaurants?.name || "Unbekannt",
      message: row.message,
      createdAt: row.created_at,
      readAt: row.read_at,
    }));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Zelloo admin support messages error:", error);
    return NextResponse.json(
      { error: "Meldungen konnten nicht geladen werden." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  try {
    const body = await request.json().catch(() => null);
    const messageId = typeof body?.messageId === "string" ? body.messageId : null;
    if (!messageId) {
      return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
    }

    const { error } = await supabase
      .from("admin_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("id", messageId)
      .eq("sender", "restaurant");

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Zelloo admin support message read error:", error);
    return NextResponse.json(
      { error: "Konnte nicht als gelesen markiert werden." },
      { status: 500 }
    );
  }
}
