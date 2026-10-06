import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-server";

export const runtime = "nodejs";

async function getAuthedUserId(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

export async function GET(request: Request) {
  const userId = await getAuthedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", userId)
      .maybeSingle();

    if (restaurantError) throw restaurantError;
    if (!restaurant) {
      return NextResponse.json({ messages: [] });
    }

    const { data, error } = await supabase
      .from("admin_messages")
      .select("id, message, created_at")
      .eq("restaurant_id", restaurant.id)
      .is("read_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ messages: data || [] });
  } catch (error) {
    console.error("Zelloo restaurant messages error:", error);
    return NextResponse.json({ error: "Nachrichten konnten nicht geladen werden." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getAuthedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const messageId = typeof body?.messageId === "string" ? body.messageId : null;
    const report = typeof body?.report === "string" ? body.report.trim().slice(0, 1000) : null;

    const supabase = getSupabaseAdmin();

    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", userId)
      .maybeSingle();

    if (!restaurant) {
      return NextResponse.json({ error: "Kein Restaurant gefunden." }, { status: 404 });
    }

    // Restaurant owner reporting an issue to Zelloo support.
    if (report) {
      const { error } = await supabase
        .from("admin_messages")
        .insert({ restaurant_id: restaurant.id, message: report, sender: "restaurant" });

      if (error) throw error;

      return NextResponse.json({ ok: true });
    }

    // Restaurant owner marking an admin-sent message as read.
    if (!messageId) {
      return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
    }

    const { error } = await supabase
      .from("admin_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("id", messageId)
      .eq("restaurant_id", restaurant.id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Zelloo restaurant messages error:", error);
    return NextResponse.json({ error: "Anfrage fehlgeschlagen." }, { status: 500 });
  }
}
