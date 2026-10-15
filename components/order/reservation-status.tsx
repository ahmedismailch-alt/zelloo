"use client";

import useSWR from "swr";
import { formatReservationWhen, type ReservationStatus } from "../../lib/reservations";
import { RESERVATION_STRINGS } from "../../lib/reservation-i18n";
import type { OrderLang } from "../../lib/order-i18n";

type StatusResponse = {
  status: ReservationStatus;
  reservedAt: string;
  partySize: number;
  restaurantName: string;
};

async function fetchStatus(url: string): Promise<StatusResponse> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("not-found");
  return (await response.json()) as StatusResponse;
}

const BADGE_CLASS: Record<ReservationStatus, string> = {
  new: "bg-amber-50 border-amber-300 text-amber-900",
  confirmed: "bg-green-50 border-green-300 text-green-900",
  declined: "bg-red-50 border-red-300 text-red-900",
  cancelled: "bg-gray-100 border-gray-300 text-gray-800",
};

export function reservationLocale(lang: OrderLang) {
  return lang === "ar" ? "ar-u-nu-latn" : lang;
}

export function ReservationStatusView({
  reservationId,
  restaurantId,
  lang,
}: {
  reservationId: string;
  restaurantId: string;
  lang: OrderLang;
}) {
  const t = RESERVATION_STRINGS[lang];
  const { data, error } = useSWR(
    `/api/reservations/${reservationId}?restaurant=${encodeURIComponent(restaurantId)}`,
    fetchStatus,
    {
      refreshInterval: (latest) => (latest && latest.status !== "new" ? 0 : 10000),
    }
  );

  if (error) {
    return (
      <p role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-4 font-semibold text-red-900">
        {t.statusNotFound}
      </p>
    );
  }
  if (!data) return null;

  const statusText = {
    new: t.statusNew,
    confirmed: t.statusConfirmed,
    declined: t.statusDeclined,
    cancelled: t.statusCancelled,
  }[data.status];

  return (
    <div role="status" className={`flex flex-col gap-1 rounded-2xl border p-4 ${BADGE_CLASS[data.status]}`}>
      <p className="font-black" dir="auto">
        {statusText}
      </p>
      <p className="text-sm font-semibold" dir="auto">
        {formatReservationWhen(data.reservedAt, reservationLocale(lang))} · {t.partyCount(data.partySize)}
      </p>
    </div>
  );
}
