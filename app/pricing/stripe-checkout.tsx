"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "../../lib/supabase";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function StripeCheckout({ planId }: { planId: string }) {
  const [alreadySubscribedMessage, setAlreadySubscribedMessage] = useState<
    string | null
  >(null);

  const fetchClientSecret = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ planId }),
    });

    const body = await response.json().catch(() => null);
    if (!response.ok || !body?.clientSecret) {
      const message = body?.error || "Zahlung konnte nicht gestartet werden.";
      setAlreadySubscribedMessage(
        body?.code === "already_subscribed" ? message : null
      );
      throw new Error(message);
    }

    return body.clientSecret as string;
  }, [planId]);

  if (alreadySubscribedMessage) {
    return (
      <div
        role="alert"
        className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-5 text-black"
      >
        <p className="text-base leading-relaxed">{alreadySubscribedMessage}</p>
        <Link
          href="/dashboard"
          className="flex min-h-11 items-center justify-center rounded-xl bg-orange-500 px-4 text-base font-semibold text-white"
        >
          Zum Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div id="checkout" className="overflow-hidden rounded-2xl">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
