"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

const ADMIN_EMAIL = "ahmed.ismail.ch@gmail.com";

type RestaurantRow = {
  id: number | string;
  name: string;
  email: string | null;
  subscription_status: string | null;
  subscription_plan: string | null;
  current_period_end: string | null;
};

type Summary = {
  total: number;
  active: number;
  trialing: number;
  canceled: number;
  noSubscription: number;
};

const statusLabel: Record<string, { label: string; className: string }> = {
  active: { label: "Aktiv", className: "bg-green-100 text-green-800" },
  trialing: { label: "Testphase", className: "bg-blue-100 text-blue-800" },
  past_due: { label: "Zahlung überfällig", className: "bg-amber-100 text-amber-800" },
  canceled: { label: "Gekündigt", className: "bg-gray-100 text-gray-700" },
  unpaid: { label: "Unbezahlt", className: "bg-red-100 text-red-800" },
  incomplete: { label: "Unvollständig", className: "bg-gray-100 text-gray-700" },
  incomplete_expired: { label: "Abgelaufen", className: "bg-gray-100 text-gray-700" },
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("de-CH", {
    timeZone: "Europe/Zurich",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default function AdminPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantRow[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data, error: userError } = await supabase.auth.getUser();

        if (cancelled) return;

        if (userError || !data.user) {
          router.replace("/login");
          return;
        }

        if (data.user.email?.toLowerCase() !== ADMIN_EMAIL) {
          router.replace("/dashboard");
          return;
        }

        setChecking(false);

        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        const response = await fetch("/api/admin/restaurants", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const body = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          throw new Error(body?.error || "Fehler beim Laden.");
        }

        setSummary(body.summary);
        setRestaurants(body.restaurants || []);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Daten konnten nicht geladen werden.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (checking) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">Wird geprüft...</p>
      </main>
    );
  }

  const cards: { label: string; value: number }[] = summary
    ? [
        { label: "Restaurants gesamt", value: summary.total },
        { label: "Aktive Abonnements", value: summary.active },
        { label: "In Testphase", value: summary.trialing },
        { label: "Gekündigt / unbezahlt", value: summary.canceled },
        { label: "Ohne Abonnement", value: summary.noSubscription },
      ]
    : [];

  return (
    <main className="min-h-screen bg-black text-white p-5">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-bold text-orange-500">ZELLOO</p>
            <h1 className="text-2xl font-black mt-1">Admin · Übersicht</h1>
            <p className="text-gray-400 mt-1 text-sm">
              Nur für den Zelloo-Betreiber sichtbar.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="border border-zinc-700 rounded-xl px-4 py-2 text-sm font-semibold text-white shrink-0"
          >
            Zum Dashboard
          </Link>
        </div>

        {error && (
          <div
            role="alert"
            className="bg-red-950 border border-red-800 text-red-200 rounded-xl p-4 mb-6"
          >
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-400">Wird geladen...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              {cards.map((card) => (
                <div
                  key={card.label}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
                >
                  <p className="text-gray-400 text-xs">{card.label}</p>
                  <p className="text-2xl font-black mt-2">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-zinc-800">
                <h2 className="font-bold">Restaurants</h2>
              </div>

              {restaurants.length === 0 ? (
                <p className="p-4 text-gray-400 text-sm">
                  Noch keine Restaurants registriert.
                </p>
              ) : (
                <ul className="divide-y divide-zinc-800">
                  {restaurants.map((restaurant) => {
                    const status =
                      restaurant.subscription_status &&
                      statusLabel[restaurant.subscription_status]
                        ? statusLabel[restaurant.subscription_status]
                        : {
                            label: "Kein Abonnement",
                            className: "bg-zinc-800 text-gray-300",
                          };

                    return (
                      <li
                        key={restaurant.id}
                        className="p-4 flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-bold break-words">
                              {restaurant.name}
                            </p>
                            {restaurant.email && (
                              <p className="text-gray-400 text-xs break-all mt-0.5">
                                {restaurant.email}
                              </p>
                            )}
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        {restaurant.subscription_status === "active" && (
                          <p className="text-gray-400 text-xs">
                            {restaurant.subscription_plan === "yearly"
                              ? "Jährlich"
                              : "Monatlich"}
                            {" · verlängert am "}
                            {formatDate(restaurant.current_period_end)}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
