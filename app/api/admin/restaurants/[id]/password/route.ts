import { NextResponse } from "next/server";
import { isValidRestaurantId, requireAdmin } from "../../../../../../lib/supabase-server";

export const runtime = "nodejs";

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
    const password = typeof body?.password === "string" ? body.password : "";

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Passwort muss mindestens 6 Zeichen haben." },
        { status: 400 }
      );
    }

    const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .select("owner_id")
      .eq("id", id)
      .maybeSingle();

    if (restaurantError) throw restaurantError;
    if (!restaurant?.owner_id) {
      return NextResponse.json({ error: "Kein Konto gefunden." }, { status: 404 });
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      restaurant.owner_id,
      { password }
    );

    if (updateError) throw updateError;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Zelloo admin password reset error:", error);
    return NextResponse.json(
      { error: "Passwort konnte nicht geändert werden." },
      { status: 500 }
    );
  }
}
