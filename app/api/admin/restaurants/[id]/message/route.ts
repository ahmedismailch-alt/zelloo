import { NextResponse } from "next/server";
import { isValidRestaurantId, requireAdmin } from "../../../../../../lib/supabase-server";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isValidRestaurantId(id)) {
    return NextResponse.json({ error: "Ungültiges Restaurant." }, { status: 400 });
  }

  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  try {
    const { data, error } = await supabase
      .from("admin_messages")
      .select("id, message, created_at, read_at")
      .eq("restaurant_id", id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json({ messages: data || [] });
  } catch (error) {
    console.error("Zelloo admin message log error:", error);
    return NextResponse.json(
      { error: "Verlauf konnte nicht geladen werden." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isValidRestaurantId(id)) {
    return NextResponse.json({ error: "Ungültiges Restaurant." }, { status: 400 });
  }

  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  try {
    const body = await request.json().catch(() => null);
    const message = typeof body?.message === "string" ? body.message.trim().slice(0, 1000) : "";

    if (!message) {
      return NextResponse.json({ error: "Nachricht darf nicht leer sein." }, { status: 400 });
    }

    const { error } = await supabase
      .from("admin_messages")
      .insert({ restaurant_id: id, message });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Zelloo admin message error:", error);
    return NextResponse.json(
      { error: "Nachricht konnte nicht gesendet werden." },
      { status: 500 }
    );
  }
}
