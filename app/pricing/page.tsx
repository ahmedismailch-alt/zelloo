"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { PLANS } from "../../lib/products";
import StripeCheckout from "./stripe-checkout";

function formatMoney(cents: number) {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
  }).format(cents / 100);
}

export default function PricingPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (!user) {
        router.replace("/login");
        return;
      }

      setChecking(false);
    }

    void checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (checking) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Wird geladen...</p>
      </main>
    );
  }

  if (selectedPlanId) {
    const plan = PLANS.find((item) => item.id === selectedPlanId);

    return (
      <main className="min-h-screen bg-black text-white p-5">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setSelectedPlanId(null)}
            className="text-sm text-gray-400 font-semibold mb-4"
          >
            ← Zurück zur Auswahl
          </button>

          <p className="text-sm font-bold text-orange-500">ZELLOO</p>
          <h1 className="text-2xl font-black mt-1 mb-6">
            {plan ? `Abonnieren – ${plan.name}` : "Abonnieren"}
          </h1>

          <StripeCheckout planId={selectedPlanId} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-5">
      <div className="max-w-md mx-auto">
        <p className="text-sm font-bold text-orange-500">ZELLOO</p>
        <h1 className="text-3xl font-black mt-1">Preise</h1>
        <p className="text-gray-400 mt-2 leading-relaxed">
          Ein Preis, keine Provision pro Bestellung. Jederzeit kündbar.
        </p>

        <div className="mt-8 space-y-4">
          {PLANS.map((plan) => {
            const isYearly = plan.interval === "year";
            const monthlyEquivalent = isYearly
              ? Math.round(plan.priceInCents / 12)
              : null;

            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-6 ${
                  isYearly
                    ? "border-orange-500 bg-zinc-900"
                    : "border-zinc-800 bg-zinc-900"
                }`}
              >
                {isYearly && (
                  <span className="inline-block bg-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full mb-3">
                    2 Monate gratis
                  </span>
                )}

                <h2 className="text-xl font-black">{plan.name}</h2>

                <p className="mt-3">
                  <span className="text-4xl font-black">
                    {formatMoney(plan.priceInCents)}
                  </span>
                  <span className="text-gray-400 ml-1">
                    / {plan.interval === "year" ? "Jahr" : "Monat"}
                  </span>
                </p>

                {monthlyEquivalent && (
                  <p className="text-sm text-gray-400 mt-1">
                    entspricht {formatMoney(monthlyEquivalent)} / Monat
                  </p>
                )}

                <ul className="mt-5 space-y-2 text-sm text-gray-300">
                  <li>Unbegrenzte Bestellungen</li>
                  <li>QR-Code Bestellsystem je Tisch</li>
                  <li>KI-Speisekarten-Erkennung</li>
                  <li>Keine Provision pro Bestellung</li>
                </ul>

                <button
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`w-full min-h-12 rounded-xl font-bold px-4 py-3 mt-6 ${
                    isYearly
                      ? "bg-orange-500 text-black"
                      : "bg-white text-black"
                  }`}
                >
                  Jetzt abonnieren
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          <Link href="/dashboard" className="underline">
            Zurück zum Dashboard
          </Link>
        </p>
      </div>
    </main>
  );
}
