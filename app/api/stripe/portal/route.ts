import { NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe";
import { getSupabaseAdmin } from "../../../../lib/supabase-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
    }

    const { data: userData, error: userError } =
      await getSupabaseAdmin().auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("stripe_customer_id")
      .eq("owner_id", userData.user.id)
      .maybeSingle();

    if (!restaurant?.stripe_customer_id) {
      return NextResponse.json(
        { error: "Kein Abonnement gefunden." },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => null);
    const returnUrl = typeof body?.returnUrl === "string" ? body.returnUrl : undefined;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: restaurant.stripe_customer_id,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Zelloo billing portal error:", error);
    return NextResponse.json(
      { error: "Konnte nicht öffnen." },
      { status: 500 }
    );
  }
}
