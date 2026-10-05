import { NextResponse } from "next/server";
import { stripe } from "../../../../../../lib/stripe";
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
    const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .select("stripe_subscription_id")
      .eq("id", id)
      .maybeSingle();

    if (restaurantError) throw restaurantError;
    if (!restaurant?.stripe_subscription_id) {
      return NextResponse.json({ error: "Kein Abonnement gefunden." }, { status: 404 });
    }

    const subscription = await stripe.subscriptions.update(
      restaurant.stripe_subscription_id,
      { cancel_at_period_end: true }
    );

    return NextResponse.json({
      ok: true,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  } catch (error) {
    console.error("Zelloo admin cancel subscription error:", error);
    return NextResponse.json(
      { error: "Abonnement konnte nicht gekündigt werden." },
      { status: 500 }
    );
  }
}
