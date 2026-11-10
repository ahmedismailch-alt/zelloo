import { NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe";
import { getSupabaseAdmin } from "../../../../lib/supabase-server";

export const runtime = "nodejs";

const ALLOWED_RETURN_HOSTS = ["zelloo.ch", "www.zelloo.ch"];

// The portal return URL comes from the client, so only same-origin or zelloo.ch
// URLs are accepted; anything else falls back to this deployment's dashboard.
function resolveReturnUrl(request: Request, candidate: unknown): string {
  const requestOrigin = new URL(request.url).origin;
  const fallback = `${requestOrigin}/dashboard`;

  if (typeof candidate !== "string") return fallback;

  try {
    const parsed = new URL(candidate);
    const isSameOrigin = parsed.origin === requestOrigin;
    const isZelloo =
      parsed.protocol === "https:" && ALLOWED_RETURN_HOSTS.includes(parsed.hostname);
    return isSameOrigin || isZelloo ? parsed.toString() : fallback;
  } catch {
    return fallback;
  }
}

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
    const returnUrl = resolveReturnUrl(request, body?.returnUrl);

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
