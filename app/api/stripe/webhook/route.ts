import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "../../../../lib/stripe";
import { getSupabaseAdmin } from "../../../../lib/supabase-server";

export const runtime = "nodejs";

function toIsoOrNull(value: number | null | undefined) {
  return typeof value === "number" ? new Date(value * 1000).toISOString() : null;
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const restaurantId = subscription.metadata?.restaurantId;
  if (!restaurantId) return;

  const planId = subscription.metadata?.planId || null;
  const item = subscription.items.data[0];

  await getSupabaseAdmin()
    .from("restaurants")
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_plan: planId,
      current_period_end: toIsoOrNull(item?.current_period_end ?? null),
    })
    .eq("id", restaurantId);
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.error("Zelloo webhook: missing signature or secret");
    return NextResponse.json({ error: "Webhook nicht konfiguriert." }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("Zelloo webhook signature error:", error);
    return NextResponse.json({ error: "Ungültige Signatur." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id
          );
          await syncSubscription(subscription);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created":
      case "customer.subscription.deleted": {
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("Zelloo webhook handling error:", error);
    return NextResponse.json({ error: "Verarbeitung fehlgeschlagen." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
