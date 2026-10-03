"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { OrderBell } from "../../lib/order-bell";

type Restaurant = {
  id: number | string;
  name: string;
  source_url: string | null;
};

type OrderStatus =
  | "new"
  | "accepted"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

type OrderItem = {
  id: string;
  item_name: string;
  quantity: number;
  unit_price_cents: number;
  notes: string | null;
};

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_address: string | null;
  order_type: "pickup" | "delivery";
  status: OrderStatus;
  total_cents: number;
  notes: string | null;
  table_number: string | null;
  created_at: string;
  order_items: OrderItem[];
};

type DashboardStats = {
  orders_today: number | string;
  new_orders: number | string;
  revenue_today_cents: number | string;
};

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: "new", label: "Neu" },
  { value: "accepted", label: "Angenommen" },
  { value: "preparing", label: "In Zubereitung" },
  { value: "ready", label: "Bereit" },
  { value: "completed", label: "Abgeschlossen" },
  { value: "cancelled", label: "Storniert" },
];

const nextStep: Partial<
  Record<OrderStatus, { status: OrderStatus; label: string }>
> = {
  new: { status: "accepted", label: "Annehmen" },
  accepted: { status: "preparing", label: "Zubereitung starten" },
  preparing: { status: "ready", label: "Bereit" },
  ready: { status: "completed", label: "Abschliessen" },
};

const statusBadge: Record<OrderStatus, string> = {
  new: "bg-orange-100 text-orange-800",
  accepted: "bg-blue-100 text-blue-800",
  preparing: "bg-yellow-100 text-yellow-800",
  ready: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-800",
};

const POLL_INTERVAL_MS = 10000;
const HIGHLIGHT_MS = 8000;
const BELL_REPEAT_MS = 3000;

function formatMoney(cents: number | string) {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
  }).format(Number(cents) / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-CH", {
    timeZone: "Europe/Zurich",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function safeRestaurantUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol)
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [email, setEmail] = useState("");
  const [pageError, setPageError] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [actionError, setActionError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());

  const knownIdsRef = useRef<Set<string> | null>(null);
  const bellRef = useRef<OrderBell | null>(null);

  async function enableSound() {
    try {
      const bell = bellRef.current ?? new OrderBell();
      bellRef.current = bell;
      await bell.enable();
      bell.ring();
      setSoundOn(true);
    } catch (error) {
      console.error(error);
      setActionError("Ton konnte nicht aktiviert werden.");
    }
  }

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        void bellRef.current?.resume();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      bellRef.current?.dispose();
      bellRef.current = null;
    };
  }, []);

  const pendingOrders = orders.filter((order) => order.status === "new");
  const hasPending = pendingOrders.length > 0;

  useEffect(() => {
    if (!soundOn || !hasPending) return;
    bellRef.current?.ring();
    const timer = window.setInterval(() => {
      bellRef.current?.ring();
    }, BELL_REPEAT_MS);
    return () => window.clearInterval(timer);
  }, [soundOn, hasPending]);

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

        setEmail(user.email || "");

        const { data: existing, error: readError } = await supabase
          .from("restaurants")
          .select("id, name, source_url")
          .eq("owner_id", user.id)
          .maybeSingle();

        if (readError) throw readError;
        if (cancelled) return;

        if (existing) {
          setRestaurant(existing as Restaurant);
          return;
        }

        const metadataName =
          typeof user.user_metadata?.restaurant_name === "string"
            ? user.user_metadata.restaurant_name
            : "Mein Restaurant";

        const metadataUrl =
          typeof user.user_metadata?.restaurant_url === "string"
            ? user.user_metadata.restaurant_url
            : "";

        const { data: created, error: insertError } = await supabase
          .from("restaurants")
          .insert({
            owner_id: user.id,
            name: metadataName,
            source_url: metadataUrl,
            email: user.email || "",
          })
          .select("id, name, source_url")
          .single();

        if (insertError) throw insertError;

        if (!cancelled) {
          setRestaurant(created as Restaurant);
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setPageError(
            "Restaurant konnte nicht geladen werden. Bitte versuchen Sie es erneut."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadRestaurant();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const restaurantId = restaurant?.id;

  useEffect(() => {
    if (restaurantId === undefined) return;

    let cancelled = false;
    let inFlight = false;

    async function loadOrders() {
      if (inFlight || cancelled) return;
      inFlight = true;
      setOrdersLoading(true);

      try {
        const [statsResult, ordersResult] = await Promise.all([
          supabase
            .rpc("get_dashboard_stats", {
              p_restaurant_id: restaurantId,
            })
            .single(),

          supabase
            .from("orders")
            .select(`
              id,
              customer_name,
              customer_phone,
              customer_address,
              order_type,
              status,
              total_cents,
              notes,
              table_number,
              created_at,
              order_items (
                id,
                item_name,
                quantity,
                unit_price_cents,
                notes
              )
            `)
            .eq("restaurant_id", restaurantId)
            .order("created_at", { ascending: false })
            .limit(50),
        ]);

        if (statsResult.error) throw statsResult.error;
        if (ordersResult.error) throw ordersResult.error;
        if (cancelled) return;

        const fetched = (ordersResult.data || []) as Order[];
        const known = knownIdsRef.current;

        if (known) {
          const arrived = fetched
            .filter((order) => order.status === "new" && !known.has(order.id))
            .map((order) => order.id);

          if (arrived.length > 0) {
            setHighlighted((current) => new Set([...current, ...arrived]));
            window.setTimeout(() => {
              setHighlighted((current) => {
                const next = new Set(current);
                arrived.forEach((id) => next.delete(id));
                return next;
              });
            }, HIGHLIGHT_MS);
          }
        }

        knownIdsRef.current = new Set([
          ...(known ?? []),
          ...fetched.map((order) => order.id),
        ]);

        setStats(statsResult.data as DashboardStats);
        setOrders(fetched);
        setOrdersLoaded(true);
        setOrdersError("");
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setOrdersError(
            "Bestellungen konnten nicht aktualisiert werden. Angezeigte Daten können veraltet sein."
          );
        }
      } finally {
        inFlight = false;

        if (!cancelled) setOrdersLoading(false);
      }
    }

    void loadOrders();

    const timer = window.setInterval(() => {
      void loadOrders();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [restaurantId, refreshVersion]);

  async function changeStatus(order: Order, nextStatus: OrderStatus) {
    if (
      restaurantId === undefined ||
      savingId ||
      nextStatus === order.status
    ) {
      return;
    }

    setSavingId(order.id);
    setActionError("");

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: nextStatus })
        .eq("id", order.id)
        .eq("restaurant_id", restaurantId)
        .eq("status", order.status)
        .select("id, status")
        .single();

      if (error) throw error;

      setOrders((current) =>
        current.map((item) =>
          item.id === order.id
            ? { ...item, status: nextStatus }
            : item
        )
      );

      setRefreshVersion((current) => current + 1);
    } catch (error) {
      console.error(error);

      setActionError(
        "Status konnte nicht gespeichert werden. Bitte aktualisieren Sie die Bestellungen und versuchen Sie es erneut."
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleLogout() {
    setActionError("");

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      router.replace("/login");
    } catch (error) {
      console.error(error);
      setActionError("Abmelden fehlgeschlagen. Bitte erneut versuchen.");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Wird geladen...</p>
      </main>
    );
  }

  if (pageError || !restaurant) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] p-5 flex items-center justify-center">
        <div className="bg-white border rounded-2xl p-6 max-w-md">
          <p role="alert" className="text-red-700">
            {pageError || "Kein Restaurant gefunden."}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-black text-white rounded-xl px-4 py-3 font-bold"
          >
            Erneut versuchen
          </button>
        </div>
      </main>
    );
  }

  const restaurantUrl = safeRestaurantUrl(restaurant.source_url);

  const cards = [
    {
      label: "Bestellungen heute",
      value: stats ? String(stats.orders_today) : "—",
    },
    {
      label: "Neue Bestellungen",
      value: stats ? String(stats.new_orders) : "—",
    },
    {
      label: "Bestellwert heute",
      value: stats ? formatMoney(stats.revenue_today_cents) : "—",
      hint: "Abgeschlossene Bestellungen, heute eingegangen",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-black p-5">
      {hasPending && (
        <div
          role="alert"
          aria-live="assertive"
          className="sticky top-0 z-50 -mx-5 -mt-5 mb-5 bg-red-600 text-white px-5 py-4 shadow-lg"
        >
          <div className="max-w-5xl mx-auto flex flex-col gap-3">
            <div>
              <p className="text-xl font-black animate-pulse">
                {pendingOrders.length === 1
                  ? "Neue Bestellung!"
                  : `${pendingOrders.length} neue Bestellungen!`}
              </p>
              <p className="text-sm font-semibold">
                {pendingOrders[pendingOrders.length - 1].table_number
                  ? `Tisch ${pendingOrders[pendingOrders.length - 1].table_number}`
                  : pendingOrders[pendingOrders.length - 1].customer_name}
                {" · "}
                {formatMoney(pendingOrders[pendingOrders.length - 1].total_cents)}
                {!soundOn && " · Ton ist aus"}
              </p>
            </div>
            <button
              type="button"
              disabled={savingId !== null}
              onClick={() =>
                void changeStatus(
                  pendingOrders[pendingOrders.length - 1],
                  "accepted"
                )
              }
              className="w-full min-h-12 rounded-xl bg-white text-red-700 font-black text-lg px-4 py-3 disabled:opacity-60"
            >
              {savingId !== null ? "Wird gespeichert..." : "Annehmen"}
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-start gap-4 mb-8">
          <div className="min-w-0">
            <p className="text-sm font-bold text-orange-500">ZELLOO</p>

            <h1 className="text-3xl font-black mt-1 break-words">
              {restaurant.name}
            </h1>

            <p className="text-gray-500 mt-1 break-all">{email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="border border-gray-300 bg-white rounded-xl px-4 py-2 text-sm font-semibold"
          >
            Abmelden
          </button>
        </div>

        {(ordersError || actionError) && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-6"
          >
            {ordersError && <p>{ordersError}</p>}
            {actionError && <p>{actionError}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {cards.map((card) => (
            <div key={card.label} className="bg-white border rounded-2xl p-5">
              <p className="text-gray-500 text-sm">{card.label}</p>
              <p className="text-3xl font-black mt-2">{card.value}</p>

              {card.hint && (
                <p className="text-xs text-gray-500 mt-2">{card.hint}</p>
              )}
            </div>
          ))}
        </div>

        <section className="bg-white border rounded-2xl p-5 mb-6">
          <div className="flex justify-between items-center gap-3 mb-2">
            <h2 className="text-xl font-black">Bestellungen</h2>

            <button
              disabled={ordersLoading || savingId !== null}
              onClick={() => setRefreshVersion((current) => current + 1)}
              className="border rounded-xl px-3 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {ordersLoading ? "Wird geladen..." : "Aktualisieren"}
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Letzte 50 Bestellungen · Aktualisierung alle 10 Sekunden
          </p>

          <button
            type="button"
            onClick={() => void enableSound()}
            disabled={soundOn}
            aria-pressed={soundOn}
            className={`w-full min-h-11 rounded-xl px-4 py-3 font-bold mb-5 ${
              soundOn
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-orange-500 text-black"
            }`}
          >
            {soundOn
              ? "Ton an · Klingelt bis zur Annahme"
              : "Ton aktivieren"}
          </button>

          {soundOn && (
            <p className="text-xs text-gray-500 -mt-3 mb-5">
              Bildschirm bleibt an. Lautstärke am Gerät auf Maximum stellen.
            </p>
          )}

          {!ordersLoaded && !ordersError && (
            <p className="text-gray-500">Bestellungen werden geladen...</p>
          )}

          {ordersLoaded && orders.length === 0 && (
            <div className="border border-dashed rounded-xl p-6 text-center">
              <p className="font-bold">Noch keine Bestellungen</p>
              <p className="text-sm text-gray-500 mt-2">
                Sobald eine Bestellung gespeichert wird, erscheint sie hier.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className={`border rounded-xl p-4 transition-colors ${
                  highlighted.has(order.id)
                    ? "bg-orange-50 border-orange-400"
                    : ""
                }`}
              >
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500">
                      #{order.id.slice(0, 8)} · {formatDate(order.created_at)}
                    </p>

                    <h3 className="font-bold mt-1">{order.customer_name}</h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {order.table_number
                        ? `Tisch ${order.table_number}`
                        : order.order_type === "delivery"
                          ? "Lieferung"
                          : "Abholung"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <p className="font-black">
                      {formatMoney(order.total_cents)}
                    </p>
                    <span
                      className={`text-xs font-bold rounded-full px-2 py-1 ${statusBadge[order.status]}`}
                    >
                      {statusOptions.find((o) => o.value === order.status)
                        ?.label ?? order.status}
                    </span>
                  </div>
                </div>

                {order.customer_phone && (
                  <p className="text-sm mt-3">
                    Telefon: {order.customer_phone}
                  </p>
                )}

                {order.customer_address && (
                  <p className="text-sm mt-1 break-words">
                    Adresse: {order.customer_address}
                  </p>
                )}

                <ul className="mt-3 space-y-2">
                  {(order.order_items || []).map((item) => (
                    <li key={item.id} className="text-sm">
                      <div className="flex justify-between gap-3">
                        <span>
                          {item.quantity} × {item.item_name}
                        </span>
                        <span className="whitespace-nowrap">
                          {formatMoney(item.quantity * item.unit_price_cents)}
                        </span>
                      </div>

                      {item.notes && (
                        <p className="text-gray-500 mt-1">{item.notes}</p>
                      )}
                    </li>
                  ))}
                </ul>

                {order.notes && (
                  <p className="text-sm bg-gray-50 rounded-lg p-3 mt-3">
                    Hinweis: {order.notes}
                  </p>
                )}

                {(nextStep[order.status] ||
                  order.status === "new" ||
                  order.status === "accepted") && (
                  <div className="flex gap-2 mt-4">
                    {nextStep[order.status] && (
                      <button
                        type="button"
                        disabled={savingId !== null}
                        onClick={() =>
                          void changeStatus(
                            order,
                            nextStep[order.status]!.status
                          )
                        }
                        className="flex-1 min-h-12 rounded-xl bg-black text-white font-bold px-4 py-3 disabled:opacity-50"
                      >
                        {nextStep[order.status]!.label}
                      </button>
                    )}
                    {order.status !== "completed" &&
                      order.status !== "cancelled" && (
                        <button
                          type="button"
                          disabled={savingId !== null}
                          onClick={() => {
                            if (window.confirm("Bestellung stornieren?")) {
                              void changeStatus(order, "cancelled");
                            }
                          }}
                          className="min-h-12 rounded-xl border border-red-200 text-red-700 font-semibold px-4 py-3 disabled:opacity-50"
                        >
                          Stornieren
                        </button>
                      )}
                  </div>
                )}

                <details className="mt-3">
                  <summary className="text-sm text-gray-500 cursor-pointer min-h-11 flex items-center">
                    Status manuell ändern
                  </summary>
                <label className="block text-sm font-semibold mt-2">
                  Status
                  <select
                    value={order.status}
                    disabled={savingId !== null}
                    onChange={(event) =>
                      void changeStatus(
                        order,
                        event.target.value as OrderStatus
                      )
                    }
                    className="block w-full bg-white border rounded-xl p-3 mt-2 disabled:opacity-50"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                </details>

                {savingId === order.id && (
                  <p role="status" className="text-sm text-gray-500 mt-2">
                    Wird gespeichert...
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white border rounded-2xl p-5 mb-6">
          <h2 className="text-xl font-black mb-2">Restaurant</h2>

          <div className="border rounded-xl p-4 mt-4">
            <p className="text-xs text-gray-500">Restaurantname</p>
            <p className="font-bold mt-1">{restaurant.name}</p>
          </div>

          {restaurantUrl && (
            <div className="border rounded-xl p-4 mt-3">
              <p className="text-xs text-gray-500">Restaurant-Link</p>

              <a
                href={restaurantUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-orange-500 break-all mt-1 block"
              >
                {restaurantUrl}
              </a>
            </div>
          )}
        </section>

        <section className="bg-black text-white rounded-2xl p-5">
          <p className="text-sm text-gray-400">Zelloo AI</p>
          <h2 className="text-xl font-black mt-1">Speisekarte verwalten</h2>

          <p className="text-gray-400 mt-2 text-sm">
            Laden Sie Ihre Speisekarte hoch, prüfen Sie die erkannten
            Gerichte und bestätigen Sie Ihre Auswahl.
          </p>

          <Link
            href="/menu"
            className="inline-block mt-4 bg-orange-500 text-black font-bold px-5 py-3 rounded-xl hover:bg-orange-400 transition-colors"
          >
            Speisekarte öffnen
          </Link>
        </section>

        <section className="bg-white border rounded-2xl p-5 mt-6">
          <h2 className="text-xl font-black">QR-Codes für Tische</h2>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            Ihr Restaurant-Link und ein QR-Code pro Tisch, bereit zum Drucken.
          </p>
          <Link
            href="/dashboard/tables"
            className="inline-block mt-4 bg-black text-white font-bold px-5 py-3 rounded-xl"
          >
            QR-Codes öffnen
          </Link>
        </section>

        <section className="bg-white border rounded-2xl p-5 mt-6">
          <h2 className="text-xl font-black">Statistik</h2>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            Umsatz, meistverkaufte Artikel und Ihre stärksten Zeiten.
          </p>
          <Link
            href="/dashboard/stats"
            className="inline-block mt-4 bg-orange-500 text-black font-bold px-5 py-3 rounded-xl hover:bg-orange-400 transition-colors"
          >
            Statistik öffnen
          </Link>
        </section>
      </div>
    </main>
  );
}
