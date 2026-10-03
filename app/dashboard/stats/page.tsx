"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { StatsBars } from "../../../components/dashboard/stats-bars";
import {
  computeStats,
  formatChf,
  periodStartIso,
  type StatsOrder,
  type StatsPeriod,
} from "../../../lib/order-stats";

const PAGE_SIZE = 1000;
const MAX_ORDERS = 5000;

const PERIODS: { value: StatsPeriod; label: string; salesTitle: string }[] = [
  { value: "today", label: "Heute", salesTitle: "Umsatz pro Stunde" },
  { value: "7d", label: "7 Tage", salesTitle: "Umsatz pro Tag" },
  { value: "30d", label: "30 Tage", salesTitle: "Umsatz pro Woche" },
  { value: "12m", label: "12 Monate", salesTitle: "Umsatz pro Monat" },
];

type Restaurant = { id: number | string; name: string };

export default function StatsPage() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [period, setPeriod] = useState<StatsPeriod>("7d");
  const [orders, setOrders] = useState<StatsOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadRestaurant() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (cancelled) return;
        if (userError || !user) {
          router.replace("/login");
          return;
        }
        const { data, error } = await supabase
          .from("restaurants")
          .select("id, name")
          .eq("owner_id", user.id)
          .maybeSingle();
        if (error) throw error;
        if (!cancelled) setRestaurant(data as Restaurant | null);
      } catch (error) {
        console.error(error);
        if (!cancelled) setPageError("Restaurant konnte nicht geladen werden.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadRestaurant();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!restaurant) return;
    let cancelled = false;
    const restaurantId = restaurant.id;

    async function loadOrders() {
      setOrdersLoading(true);
      setPageError("");
      try {
        const since = periodStartIso(period);
        const collected: StatsOrder[] = [];

        for (let from = 0; from < MAX_ORDERS; from += PAGE_SIZE) {
          const { data, error } = await supabase
            .from("orders")
            .select("status, total_cents, created_at, order_items (item_name, quantity, unit_price_cents)")
            .eq("restaurant_id", restaurantId)
            .gte("created_at", since)
            .order("created_at", { ascending: false })
            .range(from, from + PAGE_SIZE - 1);
          if (error) throw error;
          if (cancelled) return;
          collected.push(...((data || []) as StatsOrder[]));
          if (!data || data.length < PAGE_SIZE) break;
        }

        if (!cancelled) {
          setOrders(collected);
          setTruncated(collected.length >= MAX_ORDERS);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) setPageError("Statistik konnte nicht geladen werden. Bitte erneut versuchen.");
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    }

    void loadOrders();
    return () => {
      cancelled = true;
    };
  }, [restaurant, period]);

  const stats = useMemo(() => computeStats(orders, period), [orders, period]);
  const activePeriod = PERIODS.find((item) => item.value === period) ?? PERIODS[1];

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <p className="text-gray-500">Wird geladen...</p>
      </main>
    );
  }

  if (!restaurant) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] p-5 flex items-center justify-center">
        <div className="bg-white border rounded-2xl p-6 max-w-md">
          <p role="alert" className="text-red-700">
            {pageError || "Kein Restaurant gefunden."}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center mt-4 min-h-11 bg-black text-white rounded-xl px-4 font-bold"
          >
            Zum Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const hasOrders = stats.orderCount > 0;

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-black p-5 pb-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center min-h-11 text-sm font-semibold text-gray-600">
          {"← Zurück zum Dashboard"}
        </Link>
        <p className="text-sm font-bold text-orange-500 mt-2">ZELLOO</p>
        <h1 className="text-3xl font-black mt-1 text-balance">Statistik</h1>
        <p className="text-gray-500 mt-2 leading-relaxed text-pretty">
          {restaurant.name} · Stornierte Bestellungen werden nicht gezählt. Zeiten in Schweizer Zeit.
        </p>

        <div className="grid grid-cols-4 gap-2 mt-5" role="group" aria-label="Zeitraum">
          {PERIODS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setPeriod(item.value)}
              aria-pressed={period === item.value}
              className={`min-h-11 rounded-xl text-sm font-bold border transition-colors ${
                period === item.value ? "bg-black text-white border-black" : "bg-white text-black"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {pageError && (
          <p role="alert" className="mt-4 bg-red-50 text-red-700 rounded-xl p-3 text-sm">
            {pageError}
          </p>
        )}
        {truncated && (
          <p className="mt-4 bg-orange-50 text-orange-800 rounded-xl p-3 text-sm leading-relaxed">
            Nur die letzten {MAX_ORDERS} Bestellungen dieses Zeitraums werden berechnet.
          </p>
        )}

        <div aria-busy={ordersLoading} className={ordersLoading ? "opacity-50 transition-opacity" : "transition-opacity"}>
          <section className="grid grid-cols-2 gap-3 mt-5">
            <div className="col-span-2 bg-black text-white rounded-2xl p-5">
              <p className="text-sm text-gray-400">Umsatz · {activePeriod.label}</p>
              <p className="text-4xl font-black mt-1">{formatChf(stats.revenueCents)}</p>
            </div>
            <div className="bg-white border rounded-2xl p-4">
              <p className="text-sm text-gray-500">Bestellungen</p>
              <p className="text-2xl font-black mt-1">{stats.orderCount}</p>
            </div>
            <div className="bg-white border rounded-2xl p-4">
              <p className="text-sm text-gray-500">Ø pro Bestellung</p>
              <p className="text-2xl font-black mt-1">{formatChf(stats.averageCents)}</p>
            </div>
          </section>

          {!hasOrders && !ordersLoading ? (
            <p className="bg-white border rounded-2xl p-6 mt-4 text-center text-gray-500">
              Noch keine Bestellungen in diesem Zeitraum.
            </p>
          ) : (
            <>
              <StatsBars
                title={activePeriod.salesTitle}
                bars={stats.salesBars}
                formatValue={formatChf}
                labelEvery={period === "today" ? 3 : period === "12m" ? 2 : 1}
              />

              <section className="bg-white border rounded-2xl p-5 mt-4">
                <h2 className="text-lg font-black">Meistverkaufte Artikel</h2>
                <ol className="mt-3 flex flex-col">
                  {stats.topItems.map((item, index) => (
                    <li key={item.name} className="flex items-center gap-3 py-3 border-b last:border-b-0">
                      <span
                        className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-black ${
                          index === 0 ? "bg-orange-500 text-black" : "bg-gray-100 text-black"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="flex-1 min-w-0 font-semibold truncate">{item.name}</span>
                      <span className="text-right shrink-0">
                        <span className="block font-black">{item.quantity}×</span>
                        <span className="block text-xs text-gray-500">{formatChf(item.revenueCents)}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </section>

              <StatsBars
                title="Bestellungen nach Uhrzeit"
                description="Wann die meisten Bestellungen eingehen."
                bars={stats.hourBars}
                formatValue={(value) => `${value} Bestellungen`}
                labelEvery={3}
              />

              <StatsBars
                title="Bestellungen nach Wochentag"
                bars={stats.weekdayBars}
                formatValue={(value) => `${value} Bestellungen`}
              />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
