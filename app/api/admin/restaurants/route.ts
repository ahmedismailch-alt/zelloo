import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/supabase-server";

export const runtime = "nodejs";

// Only Zelloo's own account may view this data. This is an internal
// business-overview endpoint, not a per-restaurant resource.

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const { supabase } = auth;

    const { data, error } = await supabase
      .from("restaurants")
      .select(
        "id, name, email, owner_id, stripe_subscription_id, subscription_status, subscription_plan, current_period_end"
      )
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
