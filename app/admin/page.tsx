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
  owner_id: string | null;
  stripe_subscription_id: string | null;
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

type RestaurantStats = {
  totalOrders: number;
  last7DaysOrders: number;
  lastOrderAt: string | null;
  menuItemsCount: number;
};

type AdminMessage = {
  id: string;
  message: string;
  created_at: string;
  read_at: string | null;
};

type SupportMessage = {
  id: string;
  restaurantId: number | string;
  restaurantName: string;
  message: string;
  createdAt: string;
  readAt: string | null;
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

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("de-CH", {
    timeZone: "Europe/Zurich",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantRow[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [supportLoading, setSupportLoading] = useState(true);
  const [supportToken, setSupportToken] = useState<string | null>(null);

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
        const token = sessionData.session?.access_token || null;
        setSupportToken(token);

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

        const supportResponse = await fetch("/api/admin/support-messages", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const supportBody = await supportResponse.json();
        if (!cancelled && supportResponse.ok) {
          setSupportMessages(supportBody.messages || []);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Daten konnten nicht geladen werden.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setSupportLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function markSupportMessageRead(messageId: string) {
    setSupportMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, readAt: new Date().toISOString() } : m
      )
    );

    try {
      await fetch("/api/admin/support-messages", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(supportToken ? { Authorization: `Bearer ${supportToken}` } : {}),
        },
        body: JSON.stringify({ messageId }),
      });
    } catch (err) {
      console.error("Zelloo support message read error:", err);
    }
  }

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

  const statusFilterOptions: { value: string; label: string }[] = [
    { value: "all", label: "Alle" },
    { value: "active", label: "Aktiv" },
    { value: "trialing", label: "Testphase" },
    { value: "canceled", label: "Gekündigt" },
    { value: "none", label: "Ohne Abo" },
  ];

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      restaurant.name.toLowerCase().includes(query) ||
      (restaurant.email?.toLowerCase().includes(query) ?? false);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "none" && !restaurant.subscription_status) ||
      (statusFilter === "canceled" &&
        (restaurant.subscription_status === "canceled" ||
          restaurant.subscription_status === "unpaid")) ||
      restaurant.subscription_status === statusFilter;

    return matchesQuery && matchesStatus;
  });

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
            {!supportLoading && supportMessages.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-6">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                  <h2 className="font-bold">Problemmeldungen</h2>
                  {supportMessages.some((m) => !m.readAt) && (
                    <span className="bg-orange-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                      {supportMessages.filter((m) => !m.readAt).length} neu
                    </span>
                  )}
                </div>
                <div className="divide-y divide-zinc-800">
                  {supportMessages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-4 flex flex-col gap-2 ${
                        m.readAt ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm">
                          {m.restaurantName}
                        </p>
                        <p className="text-xs text-gray-500 shrink-0">
                          {formatDateTime(m.createdAt)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">
                        {m.message}
                      </p>
                      {!m.readAt && (
                        <button
                          type="button"
                          onClick={() => markSupportMessageRead(m.id)}
                          className="self-start text-xs font-semibold text-orange-500"
                        >
                          Als erledigt markieren
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
              <div className="p-4 border-b border-zinc-800 flex flex-col gap-3">
                <h2 className="font-bold">Restaurants</h2>

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Nach Name oder E-Mail suchen..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500"
                />

                <div className="flex gap-2 overflow-x-auto -mx-1 px-1">
                  {statusFilterOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStatusFilter(option.value)}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold border ${
                        statusFilter === option.value
                          ? "bg-orange-500 text-black border-orange-500"
                          : "border-zinc-700 text-gray-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {restaurants.length === 0 ? (
                <p className="p-4 text-gray-400 text-sm">
                  Noch keine Restaurants registriert.
                </p>
              ) : filteredRestaurants.length === 0 ? (
                <p className="p-4 text-gray-400 text-sm">
                  Keine Restaurants gefunden.
                </p>
              ) : (
                <ul className="divide-y divide-zinc-800">
                  {filteredRestaurants.map((restaurant) => {
                    const status =
                      restaurant.subscription_status &&
                      statusLabel[restaurant.subscription_status]
                        ? statusLabel[restaurant.subscription_status]
                        : {
                            label: "Kein Abonnement",
                            className: "bg-zinc-800 text-gray-300",
                          };

                    const restaurantId = String(restaurant.id);
                    const isExpanded = expandedId === restaurantId;

                    return (
                      <li key={restaurant.id} className="flex flex-col">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : restaurantId)
                          }
                          className="p-4 flex flex-col gap-2 text-left w-full"
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

                          <p className="text-orange-500 text-xs font-semibold mt-1">
                            {isExpanded ? "Verwalten ausblenden ▲" : "Verwalten ▼"}
                          </p>
                        </button>

                        {isExpanded && (
                          <RestaurantAdminPanel restaurant={restaurant} />
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

async function authedFetch(path: string, options: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error || "Aktion fehlgeschlagen.");
  }

  return body;
}

function RestaurantAdminPanel({ restaurant }: { restaurant: RestaurantRow }) {
  const restaurantId = String(restaurant.id);

  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageFeedback, setMessageFeedback] = useState("");

  const [messageLog, setMessageLog] = useState<AdminMessage[]>([]);
  const [messageLogLoading, setMessageLogLoading] = useState(true);
  const [messageLogError, setMessageLogError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [settingPassword, setSettingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState("");

  const [cancelling, setCancelling] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState("");
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setStatsLoading(true);
      setStatsError("");

      try {
        const body = await authedFetch(
          `/api/admin/restaurants/${restaurantId}/stats`
        );
        if (!cancelled) setStats(body as RestaurantStats);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setStatsError("Statistik konnte nicht geladen werden.");
        }
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }

    void loadStats();

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  useEffect(() => {
    let cancelled = false;

    async function loadMessageLog() {
      setMessageLogLoading(true);
      setMessageLogError("");

      try {
        const body = await authedFetch(
          `/api/admin/restaurants/${restaurantId}/message`
        );
        if (!cancelled) setMessageLog((body.messages || []) as AdminMessage[]);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setMessageLogError("Verlauf konnte nicht geladen werden.");
        }
      } finally {
        if (!cancelled) setMessageLogLoading(false);
      }
    }

    void loadMessageLog();

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  async function handleSendMessage() {
    if (!messageText.trim()) return;

    setSendingMessage(true);
    setMessageFeedback("");

    try {
      await authedFetch(`/api/admin/restaurants/${restaurantId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText.trim() }),
      });
      setMessageText("");
      setMessageFeedback("Nachricht gesendet.");
      setMessageLog((previous) => [
        {
          id: `temp-${Date.now()}`,
          message: messageText.trim(),
          created_at: new Date().toISOString(),
          read_at: null,
        },
        ...previous,
      ]);
    } catch (err) {
      setMessageFeedback(
        err instanceof Error ? err.message : "Fehler beim Senden."
      );
    } finally {
      setSendingMessage(false);
    }
  }

  async function handleSetPassword() {
    if (newPassword.length < 6) {
      setPasswordFeedback("Mindestens 6 Zeichen.");
      return;
    }

    setSettingPassword(true);
    setPasswordFeedback("");

    try {
      await authedFetch(`/api/admin/restaurants/${restaurantId}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      setNewPassword("");
      setPasswordFeedback("Passwort geändert.");
    } catch (err) {
      setPasswordFeedback(
        err instanceof Error ? err.message : "Fehler beim Ändern."
      );
    } finally {
      setSettingPassword(false);
    }
  }

  async function handleCancelSubscription() {
    setCancelling(true);
    setCancelFeedback("");

    try {
      await authedFetch(
        `/api/admin/restaurants/${restaurantId}/cancel-subscription`,
        { method: "POST" }
      );
      setCancelFeedback(
        "Abonnement wird zum Ende der Periode gekündigt."
      );
      setConfirmingCancel(false);
    } catch (err) {
      setCancelFeedback(
        err instanceof Error ? err.message : "Fehler beim Kündigen."
      );
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="bg-black/40 border-t border-zinc-800 p-4 flex flex-col gap-5">
      <div>
        <p className="text-xs font-bold text-gray-400 mb-2">Nutzung</p>
        {statsLoading ? (
          <p className="text-gray-500 text-sm">Wird geladen...</p>
        ) : statsError ? (
          <p className="text-red-400 text-sm">{statsError}</p>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <p className="text-gray-400 text-[11px]">Bestellungen gesamt</p>
              <p className="font-black text-lg mt-0.5">{stats.totalOrders}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <p className="text-gray-400 text-[11px]">Letzte 7 Tage</p>
              <p className="font-black text-lg mt-0.5">
                {stats.last7DaysOrders}
              </p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <p className="text-gray-400 text-[11px]">Menüpunkte aktiv</p>
              <p className="font-black text-lg mt-0.5">
                {stats.menuItemsCount}
              </p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <p className="text-gray-400 text-[11px]">Letzte Bestellung</p>
              <p className="font-semibold text-xs mt-1 leading-tight">
                {formatDateTime(stats.lastOrderAt)}
              </p>
            </div>
          </div>
        ) : null}
        {!statsLoading && stats?.totalOrders === 0 && (
          <p className="text-amber-400 text-xs mt-2">
            Noch keine Bestellungen — das Restaurant nutzt Zelloo
            möglicherweise nicht aktiv.
          </p>
        )}
      </div>

      <div>
        <p className="text-xs font-bold text-gray-400 mb-2">
          Nachricht an Restaurant senden
        </p>
        <textarea
          value={messageText}
          onChange={(event) => setMessageText(event.target.value)}
          rows={2}
          placeholder="z. B. Hinweis zur Zahlung oder neue Funktion..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder:text-gray-500"
        />
        <div className="flex items-center justify-between gap-3 mt-2">
          <button
            type="button"
            disabled={sendingMessage || !messageText.trim()}
            onClick={() => void handleSendMessage()}
            className="bg-orange-500 text-black rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-50"
          >
            {sendingMessage ? "Wird gesendet..." : "Senden"}
          </button>
          {messageFeedback && (
            <p className="text-xs text-gray-400">{messageFeedback}</p>
          )}
        </div>

        <div className="mt-3">
          <p className="text-xs font-bold text-gray-400 mb-2">Verlauf</p>
          {messageLogLoading ? (
            <p className="text-gray-500 text-xs">Wird geladen...</p>
          ) : messageLogError ? (
            <p className="text-red-400 text-xs">{messageLogError}</p>
          ) : messageLog.length === 0 ? (
            <p className="text-gray-500 text-xs">
              Noch keine Nachrichten gesendet.
            </p>
          ) : (
            <ul className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {messageLog.map((entry) => (
                <li
                  key={entry.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-3"
                >
                  <p className="text-sm break-words">{entry.message}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <p className="text-gray-500 text-[11px]">
                      {formatDateTime(entry.created_at)}
                    </p>
                    <span
                      className={`text-[11px] font-semibold ${
                        entry.read_at ? "text-green-500" : "text-amber-500"
                      }`}
                    >
                      {entry.read_at ? "Gelesen" : "Ungelesen"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-gray-400 mb-2">
          Passwort für Restaurant ändern
        </p>
        <div className="flex flex-col gap-2">
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="Neues Passwort (min. 6 Zeichen)"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder:text-gray-500"
          />
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={settingPassword || newPassword.length < 6}
              onClick={() => void handleSetPassword()}
              className="border border-zinc-700 rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-50"
            >
              {settingPassword ? "Wird geändert..." : "Passwort setzen"}
            </button>
            {passwordFeedback && (
              <p className="text-xs text-gray-400">{passwordFeedback}</p>
            )}
          </div>
        </div>
      </div>

      {restaurant.stripe_subscription_id && (
        <div>
          <p className="text-xs font-bold text-gray-400 mb-2">Abonnement</p>
          {!confirmingCancel ? (
            <button
              type="button"
              onClick={() => setConfirmingCancel(true)}
              className="border border-red-800 text-red-300 rounded-xl px-4 py-2 text-sm font-bold"
            >
              Abonnement kündigen
            </button>
          ) : (
            <div className="bg-red-950 border border-red-800 rounded-xl p-3 flex flex-col gap-2">
              <p className="text-red-200 text-xs">
                Das Abonnement wird zum Ende der aktuellen Abrechnungsperiode
                gekündigt. Diese Aktion ist nicht sofort rückgängig zu machen.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => void handleCancelSubscription()}
                  className="bg-red-700 text-white rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-60"
                >
                  {cancelling ? "Wird gekündigt..." : "Ja, kündigen"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingCancel(false)}
                  className="border border-zinc-700 rounded-xl px-4 py-2 text-sm font-bold"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}
          {cancelFeedback && (
            <p className="text-xs text-gray-400 mt-2">{cancelFeedback}</p>
          )}
        </div>
      )}
    </div>
  );
}
