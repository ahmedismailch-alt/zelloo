"use client";

import { Logo } from "@/components/logo";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { OrderBell } from "../../lib/order-bell";
import { DashboardShell } from "../../components/dashboard/dashboard-shell";

type Restaurant = {
  id: number | string;
  name: string;
  source_url: string | null;
  phone: string | null;
  subscription_status: string | null;
  subscription_plan: string | null;
  current_period_end: string | null;
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

type AdminMessage = {
  id: string;
  message: string;
  created_at: string;
};

type OrderFilter = "all" | "table" | "pickup" | "delivery";

const filterOptions: { value: OrderFilter; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "table", label: "Tische" },
  { value: "pickup", label: "Abholung" },
  { value: "delivery", label: "Lieferung" },
];

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
  const [openingBilling, setOpeningBilling] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);
  const [dismissingMessageId, setDismissingMessageId] = useState<string | null>(null);
  const [onboarding, setOnboarding] = useState<{
    menuItemsCount: number;
    totalOrders: number;
  } | null>(null);
  const [checklistDismissed, setChecklistDismissed] = useState(false);

  const knownIdsRef = useRef<Set<string> | null>(null);
  const bellRef = useRef<OrderBell | null>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!printingOrder) return;
    // Render the hidden receipt first, then print on the next frame so the
    // browser has painted it. A same-page print (no popup, no iframe) is the
    // only approach that works reliably across iOS Safari and Android Chrome.
    const frame = window.requestAnimationFrame(() => {
      window.print();
    });
    const handleAfterPrint = () => setPrintingOrder(null);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [printingOrder]);

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
          .select(
            "id, name, source_url, phone, subscription_status, subscription_plan, current_period_end"
          )
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
          .select(
            "id, name, source_url, subscription_status, subscription_plan, current_period_end"
          )
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

    async function loadAdminMessages() {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) return;

        const response = await fetch("/api/restaurant-messages", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await response.json();
        if (!cancelled && response.ok) {
          setAdminMessages(body.messages || []);
        }
      } catch (error) {
        console.error(error);
      }
    }

    void loadAdminMessages();

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  useEffect(() => {
    if (restaurantId === undefined) return;

    let cancelled = false;

    async function loadOnboardingStatus() {
      try {
        const [menuItemsResult, ordersResult] = await Promise.all([
          supabase
            .from("menu_items")
            .select("id", { count: "exact", head: true })
            .eq("restaurant_id", restaurantId)
            .eq("is_confirmed", true),
          supabase
            .from("orders")
            .select("id", { count: "exact", head: true })
            .eq("restaurant_id", restaurantId),
        ]);

        if (cancelled) return;

        setOnboarding({
          menuItemsCount: menuItemsResult.count ?? 0,
          totalOrders: ordersResult.count ?? 0,
        });
      } catch (error) {
        console.error(error);
      }
    }

    void loadOnboardingStatus();

    return () => {
      cancelled = true;
    };
  }, [restaurantId, refreshVersion]);

  async function dismissAdminMessage(messageId: string) {
    setDismissingMessageId(messageId);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      const response = await fetch("/api/restaurant-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ messageId }),
      });

      if (response.ok) {
        setAdminMessages((current) =>
          current.filter((item) => item.id !== messageId)
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDismissingMessageId(null);
    }
  }

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

  async function handleManageBilling() {
    setActionError("");
    setOpeningBilling(true);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });

      const body = await response.json();
      if (!response.ok || !body.url) {
        throw new Error(body?.error || "Konnte nicht geöffnet werden.");
      }

      window.location.href = body.url;
    } catch (error) {
      console.error(error);
      setActionError("Abonnement konnte nicht geöffnet werden.");
    } finally {
      setOpeningBilling(false);
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
  const restaurantName = restaurant.name;

  function printOrder(order: Order) {
    // Render the receipt into a hidden section of this same page and print
    // the page itself (print CSS shows only the receipt). iframes and
    // window.open popups are unreliable on iOS Safari and get blocked on
    // Android Chrome, so an in-page print is the only approach that works
    // consistently on mobile.
    setPrintingOrder(order);
  }

  const cards: {
    label: string;
    value: string;
    compact?: boolean;
    hint?: string;
  }[] = [
    {
      label: "Neue Bestellungen",
      value: stats ? String(stats.new_orders) : "—",
    },
    {
      label: "Bestellungen heute",
      value: stats ? String(stats.orders_today) : "—",
    },
  ];

  const revenueToday = stats ? formatMoney(stats.revenue_today_cents) : "—";

  // Orders already arrive newest-first; a stable sort keeps that order
  // within each group while bringing "new" orders to the top so staff
  // never miss one among older, already-handled orders.
  const sortedOrders = [...orders].sort((a, b) => {
    if (a.status === "new" && b.status !== "new") return -1;
    if (a.status !== "new" && b.status === "new") return 1;
    return 0;
  });

  const matchesFilter = (order: Order, filter: OrderFilter) => {
    if (filter === "table") return Boolean(order.table_number);
    if (filter === "pickup") {
      return !order.table_number && order.order_type === "pickup";
    }
    if (filter === "delivery") {
      return !order.table_number && order.order_type === "delivery";
    }
    return true;
  };

  const filteredOrders = sortedOrders.filter((order) =>
    matchesFilter(order, orderFilter)
  );

  return (
    <>
    <DashboardShell restaurantName={restaurantName} />
    <main className="min-h-screen bg-[#f8f9fb] text-black p-5 md:pl-[17rem] print:hidden print:md:pl-0">
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
        {adminMessages.length > 0 && (
          <div className="mb-6 flex flex-col gap-3">
            {adminMessages.map((item) => (
              <div
                key={item.id}
                role="status"
                className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-orange-600">
                    Nachricht von Zelloo
                  </p>
                  <p className="text-sm text-gray-800 mt-0.5 break-words">
                    {item.message}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={dismissingMessageId === item.id}
                  onClick={() => void dismissAdminMessage(item.id)}
                  className="shrink-0 text-xs font-semibold text-orange-600 underline disabled:opacity-60"
                >
                  {dismissingMessageId === item.id ? "..." : "Verstanden"}
                </button>
              </div>
            ))}
          </div>
        )}

        {onboarding &&
          !checklistDismissed &&
          (onboarding.menuItemsCount === 0 ||
            onboarding.totalOrders === 0) && (
            <div className="mb-6 bg-white border rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-black">Erste Schritte</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    So kommen die ersten Bestellungen an.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setChecklistDismissed(true)}
                  className="shrink-0 text-xs font-semibold text-gray-400"
                  aria-label="Erste Schritte ausblenden"
                >
                  Ausblenden
                </button>
              </div>

              <ul className="flex flex-col gap-2">
                {[
                  {
                    done: onboarding.menuItemsCount > 0,
                    label: "Menü hinzufügen",
                    href: "/menu",
                    cta: "Zur Speisekarte",
                  },
                  {
                    done: true,
                    label: "Tisch-QR-Codes einrichten",
                    href: "/dashboard/tables",
                    cta: "QR-Codes ansehen",
                    optional: true,
                  },
                  {
                    done: onboarding.totalOrders > 0,
                    label: "Erste Bestellung erhalten",
                  },
                ].map((step) => (
                  <li
                    key={step.label}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                          step.done
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                        aria-hidden="true"
                      >
                        {step.done ? "✓" : ""}
                      </span>
                      <span
                        className={`text-sm font-semibold truncate ${
                          step.done ? "text-gray-400" : "text-black"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>

                    {!step.done && step.href && (
                      <Link
                        href={step.href}
                        className="shrink-0 text-xs font-bold text-orange-600 underline"
                      >
                        {step.cta}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

        <div className="flex justify-between items-start gap-4 mb-6">
          <div className="min-w-0">
            <Logo size="sm" className="text-orange-500" />

            <h1 className="text-2xl font-black mt-1 break-words">
              {restaurant.name}
            </h1>

            <p className="text-gray-500 mt-1 break-all text-sm">{email}</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <Link
                href="/dashboard/settings"
                className="border border-gray-300 bg-white rounded-xl px-4 py-2 text-sm font-semibold"
              >
                Einstellungen
              </Link>

              <button
                onClick={handleLogout}
                className="border border-gray-300 bg-white rounded-xl px-4 py-2 text-sm font-semibold"
              >
                Abmelden
              </button>
            </div>

            <div className="bg-white border rounded-xl px-3 py-1.5 text-right">
              <p className="text-[10px] leading-tight text-gray-500">
                Umsatz Heute
              </p>
              <p className="text-sm font-black leading-tight">
                {revenueToday}
              </p>
            </div>
          </div>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          {cards.map((card) => (
            <div
              key={card.label}
              className={`bg-white border rounded-2xl ${
                card.compact ? "p-3" : "p-4"
              }`}
            >
              <p
                className={`text-gray-500 ${
                  card.compact ? "text-xs" : "text-sm"
                }`}
              >
                {card.label}
              </p>
              <p
                className={`font-black mt-1 ${
                  card.compact ? "text-lg" : "text-2xl mt-2"
                }`}
              >
                {card.value}
              </p>

              {card.hint && (
                <p className="text-xs text-gray-500 mt-2">{card.hint}</p>
              )}
            </div>
          ))}
        </div>

        <section className="bg-white border rounded-2xl p-4 mb-6 max-w-2xl mx-auto w-full">
          <div className="flex justify-between items-center gap-3 mb-2">
            <h2 className="text-lg font-black">Bestellungen</h2>

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

          <div
            role="tablist"
            aria-label="Bestellungen filtern"
            className="flex gap-2 overflow-x-auto -mx-1 px-1 mb-5"
          >
            {filterOptions.map((option) => {
              const active = orderFilter === option.value;
              const count =
                option.value === "all"
                  ? sortedOrders.length
                  : sortedOrders.filter((order) =>
                      matchesFilter(order, option.value)
                    ).length;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setOrderFilter(option.value)}
                  className={`shrink-0 min-h-9 rounded-full pl-3 pr-2 py-1 text-xs font-bold flex items-center gap-1.5 ${
                    active
                      ? "bg-black text-white"
                      : "bg-white border border-gray-300 text-gray-700"
                  }`}
                >
                  {option.label}
                  <span
                    className={`inline-flex min-w-5 h-5 items-center justify-center rounded-full px-1.5 text-xs font-black text-white ${
                      count > 0 ? "bg-orange-500" : "bg-gray-300"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

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

          {ordersLoaded && orders.length > 0 && filteredOrders.length === 0 && (
            <div className="border border-dashed rounded-xl p-6 text-center">
              <p className="font-bold">Keine Bestellungen in dieser Kategorie</p>
              <p className="text-sm text-gray-500 mt-2">
                Versuchen Sie einen anderen Filter.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <article
                key={order.id}
                className={`border rounded-xl p-3 transition-colors ${
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

                    <h3 className="font-bold mt-1 text-sm">{order.customer_name}</h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {order.table_number
                        ? `Tisch ${order.table_number}`
                        : order.order_type === "delivery"
                          ? "Lieferung"
                          : "Abholung"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <p className="font-black text-sm">
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
                        className="flex-1 min-h-11 rounded-xl bg-black text-white font-bold text-sm px-3 py-2.5 disabled:opacity-50"
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
                          className="min-h-11 rounded-xl border border-red-200 text-red-700 font-semibold text-sm px-3 py-2.5 disabled:opacity-50"
                        >
                          Stornieren
                        </button>
                      )}
                  </div>
                )}

                  <button
                    type="button"
                    onClick={() => printOrder(order)}
                    className="w-full min-h-11 rounded-xl border border-gray-300 text-black font-semibold text-sm px-3 py-2.5 mt-2 active:bg-gray-100"
                  >
                    Drucken
                  </button>

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

        <section className="bg-white border rounded-2xl p-5 mb-6">
          <h2 className="text-xl font-black mb-2">Abonnement</h2>

          {restaurant.subscription_status === "active" ||
          restaurant.subscription_status === "trialing" ? (
            <>
              <div className="border rounded-xl p-4 mt-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="font-bold mt-1 text-green-700">
                    {restaurant.subscription_plan === "zelloo-yearly"
                      ? "Jährlich · Aktiv"
                      : "Monatlich · Aktiv"}
                  </p>
                  {restaurant.current_period_end && (
                    <p className="text-sm text-gray-500 mt-1">
                      Verlängert am{" "}
                      {new Date(
                        restaurant.current_period_end
                      ).toLocaleDateString("de-CH")}
                    </p>
                  )}
                </div>
                <span className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
              </div>

              <button
                type="button"
                onClick={() => void handleManageBilling()}
                disabled={openingBilling}
                className="w-full min-h-12 rounded-xl border border-gray-300 text-black font-semibold px-4 py-3 mt-4 disabled:opacity-50"
              >
                {openingBilling ? "Wird geöffnet..." : "Abonnement verwalten"}
              </button>
            </>
          ) : (
            <>
              <div className="border rounded-xl p-4 mt-4">
                <p className="text-xs text-gray-500">Status</p>
                <p className="font-bold mt-1 text-red-700">Kein aktives Abonnement</p>
              </div>

              <Link
                href="/pricing"
                className="inline-block w-full text-center min-h-12 rounded-xl bg-orange-500 text-black font-bold px-4 py-3 mt-4 hover:bg-orange-400 transition-colors"
              >
                Jetzt abonnieren
              </Link>
            </>
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

      {printingOrder && (
        <div className="hidden print:block p-6 font-mono text-black">
          <h1 className="text-lg font-bold mb-1">{restaurantName}</h1>
          <p className="text-sm m-0">
            #{printingOrder.id.slice(0, 8)} · {formatDate(printingOrder.created_at)}
          </p>
          <p className="text-sm m-0">
            {printingOrder.table_number
              ? `Tisch ${printingOrder.table_number}`
              : printingOrder.order_type === "delivery"
                ? "Lieferung"
                : "Abholung"}
          </p>
          {printingOrder.customer_phone && (
            <p className="text-sm m-0">Telefon: {printingOrder.customer_phone}</p>
          )}
          {printingOrder.customer_address && (
            <p className="text-sm m-0">Adresse: {printingOrder.customer_address}</p>
          )}
          <hr className="border-t border-dashed border-black my-3" />
          <table className="w-full border-collapse text-sm">
            <tbody>
              {(printingOrder.order_items || []).map((item) => (
                <tr key={item.id}>
                  <td className="py-1 align-top">
                    {item.quantity} × {item.item_name}
                    {item.notes && (
                      <div className="text-xs text-gray-600 pl-3">{item.notes}</div>
                    )}
                  </td>
                  <td className="py-1 text-right whitespace-nowrap align-top">
                    {formatMoney(item.quantity * item.unit_price_cents)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-black font-bold">
                <td className="pt-2">Total</td>
                <td className="pt-2 text-right">{formatMoney(printingOrder.total_cents)}</td>
              </tr>
            </tfoot>
          </table>
          {printingOrder.notes && (
            <>
              <hr className="border-t border-dashed border-black my-3" />
              <p className="text-sm m-0">Hinweis: {printingOrder.notes}</p>
            </>
          )}
        </div>
      )}
    </>
  );
}
