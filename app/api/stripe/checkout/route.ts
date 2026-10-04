import { NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe";
import { getPlanById } from "../../../../lib/products";
import { getSupabaseAdmin } from "../../../../lib/supabase-server";

export const runtime = "nodejs";

async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const planId = typeof body?.planId === "string" ? body.planId : null;
    const plan = planId ? getPlanById(planId) : undefined;

    if (!plan) {
      return NextResponse.json({ error: "Ungültiger Plan." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .select("id, name, email, stripe_customer_id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: "Restaurant nicht gefunden." },
        { status: 404 }
      );
    }

    let customerId = restaurant.stripe_customer_id as string | null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: restaurant.email || user.email || undefined,
        name: restaurant.name,
        metadata: { restaurantId: String(restaurant.id) },
      });
      customerId = customer.id;

      await supabase
        .from("restaurants")
        .update({ stripe_customer_id: customerId })
        .eq("id", restaurant.id);
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      redirect_on_completion: "never",
      mode: "subscription",
      customer: customerId,
      payment_method_types: ["card", "twint"],
      line_items: [
        {
          price_data: {
            currency: "chf",
            product_data: {
              name: `Zelloo – ${plan.name}`,
              description: plan.description,
            },
            unit_amount: plan.priceInCents,
            recurring: { interval: plan.interval },
          },
          quantity: 1,
        },
      ],
      metadata: {
        restaurantId: String(restaurant.id),
        planId: plan.id,
      },
      subscription_data: {
        metadata: {
          restaurantId: String(restaurant.id),
          planId: plan.id,
        },
      },
    });

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error("Zelloo checkout session error:", error);
    return NextResponse.json(
      { error: "Zahlung konnte nicht gestartet werden." },
      { status: 500 }
    );
  }
}
