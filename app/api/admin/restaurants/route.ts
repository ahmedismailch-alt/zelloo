import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabase-server";

export const runtime = "nodejs";

// Only Zelloo's own account may view this data. This is an internal
// business-overview endpoint, not a per-restaurant resource.
const ADMIN_EMAIL = "ahmed.ismail.ch@gmail.com";

export async function GET(request: Request) {
  try {
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

    if (userData.user.email?.toLowerCase() !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Kein Zugriff." }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("restaurants")
      .select("id, name, email, subscription_status, subscription_plan, current_period_end")
      .order("name", { ascending: true });

    if (error) throw error;

    const restaurants = data || [];
    const activeStatuses = new Set(["active", "trialing"]);

    const summary = {
      total: restaurants.length,
      active: restaurants.filter((r) => activeStatuses.has(r.subscription_status || "")).length,
      trialing: restaurants.filter((r) => r.subscription_status === "trialing").length,
      canceled: restaurants.filter((r) =>
        ["canceled", "unpaid", "past_due", "incomplete_expired"].includes(r.subscription_status || "")
      ).length,
      noSubscription: restaurants.filter((r) => !r.subscription_status).length,
    };

    return NextResponse.json({ summary, restaurants });
  } catch (error) {
    console.error("Zelloo admin restaurants error:", error);
    return NextResponse.json({ error: "Daten konnten nicht geladen werden." }, { status: 500 });
  }
}
