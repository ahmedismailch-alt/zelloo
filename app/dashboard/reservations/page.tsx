"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { supabase } from "@/lib/supabase";
import { OrderBell } from "@/lib/order-bell";
import {
  formatReservationWhen,
  zurichDateKey,
  zurichTimeLabel,
  type ReservationStatus,
} from "@/lib/reservations";

type Restaurant = { id: number | string; name: string };

type Reservation = {
  id: string;
  guest_name: string;
  guest_phone: string;
  guest_email: string | null;
  party_size: number;
  reserved_at: string;
  note: string | null;
  status: ReservationStatus;
};

const POLL_MS = 15000;
const RING_REPEAT_MS = 8000;
const SHOW_SINCE_MS = 3 * 60 * 60 * 1000;

const STATUS_LABEL: Record<ReservationStatus, string> = {
  new: "Neu",
  confirmed: "Bestätigt",
  declined: "Abgelehnt",
  cancelled: "Storniert",
};

const STATUS_STYLE: Record<ReservationStatus, string> = {
  new: "bg-orange-100 text-orange-800",
  confirmed: "bg-green-100 text-green-800",
  declined: "bg-gray-200 text-gray-700",
  cancelled: "bg-gray-200 text-gray-700",
};

export default function ReservationsPage() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const bellRef = useRef<OrderBell | null>(null);

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
        const { data, error: readError } = await supabase
          .from("restaurants")
          .select("id, name")
          .eq("owner_id", user.id)
          .maybeSingle();
        if (readError) throw readError;
        if (!cancelled) setRestaurant(data as Restaurant | null);
      } catch (loadError) {
        console.error(loadError);
        if (!cancelled) setError("Restaurant konnte nicht geladen werden.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadRestaurant();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const loadReservations = useCallback(async (restaurantId: number | string) => {
    const since = new Date(Date.now() - SHOW_SINCE_MS).toISOString();
    const { data, error: readError } = await supabase
      .from("reservations")
      .select("id, guest_name, guest_phone, guest_email, party_size, reserved_at, note, status")
      .eq("restaurant_id", restaurantId)
      .gte("reserved_at", since)
      .order("reserved_at", { ascending: true })
      .limit(300);
    if (readError) {
      console.error(readError);
      setError("Reservierungen konnten nicht geladen werden.");
      return;
    }
    setError("");
    setReservations((data || []) as Reservation[]);
  }, []);

  useEffect(() => {
    if (!restaurant) return;
    void loadReservations(restaurant.id);
    const timer = window.setInterval(() => void loadReservations(restaurant.id), POLL_MS);
    return () => window.clearInterval(timer);
  }, [restaurant, loadReservations]);

  const newCount = useMemo(
    () => reservations.filter((item) => item.status === "new").length,
    [reservations]
  );

  useEffect(() => {
    if (!soundOn || newCount === 0) return;
    bellRef.current?.ring();
    const timer = window.setInterval(() => bellRef.current?.ring(), RING_REPEAT_MS);
    return () => window.clearInterval(timer);
  }, [soundOn, newCount]);

  useEffect(() => {
    return () => bellRef.current?.dispose();
  }, []);

  async function enableSound() {
    const bell = bellRef.current ?? new OrderBell();
    bellRef.current = bell;
    try {
      await bell.enable();
      bell.ring();
      setSoundOn(true);
    } catch (soundError) {
      console.error(soundError);
    }
  }

  async function updateStatus(id: string, status: "confirmed" | "declined" | "cancelled") {
    if (!restaurant) return;
    setBusyId(id);
    setError("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      await loadReservations(restaurant.id);
    } catch (updateError) {
      console.error(updateError);
      setError("Speichern fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setBusyId(null);
    }
  }

  const fresh = reservations.filter((item) => item.status === "new");
  const others = reservations.filter((item) => item.status !== "new");
  const days = useMemo(() => {
    const map = new Map<string, Reservation[]>();
    for (const item of others) {
      const key = zurichDateKey(item.reserved_at);
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return [...map.entries()];
  }, [others]);

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
            {error || "Kein Restaurant gefunden."}
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

  return (
    <>
      <DashboardShell restaurantName={restaurant.name} />
      <main className="min-h-screen bg-[#f8f9fb] text-black p-5 md:pl-[17rem] pb-24 md:pb-12">
        <div className="max-w-3xl mx-auto">
          <Logo size="sm" className="text-orange-500" />
          <h1 className="text-3xl font-black mt-1 text-balance">Reservierungen</h1>
          <p className="text-gray-500 mt-2 leading-relaxed text-pretty">
            {restaurant.name} · Zeiten in Schweizer Zeit. Aktivieren Sie Reservierungen unter{" "}
            <Link href="/dashboard/settings" className="font-semibold underline">
              Einstellungen
            </Link>
            .
          </p>

          <button
            type="button"
            onClick={() => void enableSound()}
            disabled={soundOn}
            className="mt-4 min-h-11 rounded-xl border bg-white px-4 text-sm font-bold disabled:text-green-700"
          >
            {soundOn ? "Ton ist aktiv" : "Ton für neue Reservierungen aktivieren"}
          </button>

          {error && (
            <p role="alert" className="mt-4 bg-red-50 text-red-700 rounded-xl p-3 text-sm">
              {error}
            </p>
          )}

          {fresh.length > 0 && (
            <section className="mt-6" aria-labelledby="new-reservations">
              <h2 id="new-reservations" className="text-lg font-black">
                Neue Anfragen ({fresh.length})
              </h2>
              <ul className="mt-3 flex flex-col gap-3">
                {fresh.map((item) => (
                  <ReservationCard
                    key={item.id}
                    item={item}
                    busy={busyId === item.id}
                    onUpdate={updateStatus}
                    highlight
                  />
                ))}
              </ul>
            </section>
          )}

          {days.map(([key, items]) => (
            <section key={key} className="mt-6" aria-label={key}>
              <h2 className="text-sm font-black uppercase tracking-wide text-gray-500">
                {formatReservationWhen(items[0].reserved_at, "de-CH").split(",")[0]}
                {" · "}
                {key.split("-").reverse().slice(0, 2).join(".")}
              </h2>
              <ul className="mt-3 flex flex-col gap-3">
                {items.map((item) => (
                  <ReservationCard
                    key={item.id}
                    item={item}
                    busy={busyId === item.id}
                    onUpdate={updateStatus}
                  />
                ))}
              </ul>
            </section>
          ))}

          {reservations.length === 0 && !error && (
            <p className="bg-white border rounded-2xl p-6 mt-6 text-center text-gray-500">
              Noch keine Reservierungen.
            </p>
          )}
        </div>
      </main>
    </>
  );
}

function ReservationCard({
  item,
  busy,
  onUpdate,
  highlight = false,
}: {
  item: Reservation;
  busy: boolean;
  onUpdate: (id: string, status: "confirmed" | "declined" | "cancelled") => void;
  highlight?: boolean;
}) {
  const buttonClass =
    "min-h-11 flex-1 rounded-xl px-4 text-sm font-black disabled:opacity-60";

  return (
    <li
      className={`rounded-2xl border bg-white p-4 ${
        highlight ? "border-orange-400 ring-2 ring-orange-200" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-2xl font-black">
            {zurichTimeLabel(item.reserved_at)}
            <span className="ml-2 text-base font-bold text-gray-500">
              {item.party_size} {item.party_size === 1 ? "Person" : "Personen"}
            </span>
          </p>
          <p className="mt-1 truncate font-bold">{item.guest_name}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[item.status]}`}
        >
          {STATUS_LABEL[item.status]}
        </span>
      </div>

      {item.note && (
        <p className="mt-2 rounded-xl bg-gray-50 p-3 text-sm leading-relaxed text-pretty">
          {item.note}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={`tel:${item.guest_phone.replace(/[^+\d]/g, "")}`}
          className="inline-flex min-h-11 items-center rounded-xl border px-4 text-sm font-bold"
        >
          {item.guest_phone}
        </a>
      </div>

      {item.status === "new" && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onUpdate(item.id, "confirmed")}
            className={`${buttonClass} bg-orange-500 text-white`}
          >
            Bestätigen
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onUpdate(item.id, "declined")}
            className={`${buttonClass} border bg-white text-black`}
          >
            Ablehnen
          </button>
        </div>
      )}

      {item.status === "confirmed" && (
        <div className="mt-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => onUpdate(item.id, "cancelled")}
            className={`${buttonClass} w-full border bg-white text-red-700`}
          >
            Stornieren
          </button>
        </div>
      )}
    </li>
  );
}
