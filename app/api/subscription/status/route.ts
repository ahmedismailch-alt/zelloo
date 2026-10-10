import { NextResponse } from "next/server";
import { ADMIN_EMAIL, getSupabaseAdmin } from "../../../../lib/supabase-server";
import { computeAccess } from "../../../../lib/subscription";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("restaurants")
    .select("subscription_status, trial_ends_at, is_demo, email")
    .eq("owner_id", userData.user.id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(computeAccess({}, ADMIN_EMAIL));
  }

  return NextResponse.json(computeAccess(data, ADMIN_EMAIL), {
    headers: { "Cache-Control": "no-store" },
  });
}
