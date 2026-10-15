"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { LANG_STORAGE_KEY, detectLang, isOrderLang, type OrderLang } from "../../lib/order-i18n";
import { RESERVATION_STRINGS } from "../../lib/reservation-i18n";
import { ReservationStatusView } from "./reservation-status";

export function ReservationStatusScreen({
  reservationId,
  restaurantId,
}: {
  reservationId: string;
  restaurantId: string;
}) {
  const [lang, setLang] = useState<OrderLang>("de");

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    } catch {
      // Storage can be blocked; fall back to the browser language.
    }
    setLang(isOrderLang(saved) ? saved : detectLang(navigator.languages ?? [navigator.language]));
  }, []);

  const t = RESERVATION_STRINGS[lang];

  return (
    <main
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-[#f8f9fb] px-4 py-8 text-black"
    >
      <div className="mx-auto flex max-w-md flex-col gap-5">
        <Logo size="sm" className="text-orange-500" />
        <h1 className="text-2xl font-black text-balance">{t.title}</h1>
        <ReservationStatusView reservationId={reservationId} restaurantId={restaurantId} lang={lang} />
        <Link
          href={`/r/${restaurantId}`}
          className="flex min-h-12 items-center justify-center rounded-xl bg-black font-black text-white"
        >
          {t.backToMenu}
        </Link>
      </div>
    </main>
  );
}
