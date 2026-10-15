"use client";

import { useState } from "react";
import type { OrderLang } from "../../lib/order-i18n";
import { reservationLocale } from "./reservation-status";

export type DemoReservationSummary = {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  partySize: number;
  guestName: string;
  guestPhone: string;
  note: string;
};

type Stage = "new" | "confirmed" | "declined";

type Copy = {
  title: string;
  intro: string;
  restaurantSide: string;
  customerSide: string;
  panelTitle: string;
  badges: Record<Stage, string>;
  confirm: string;
  decline: string;
  customerSees: Record<Stage, string>;
  tryAction: string;
  persons: (count: number) => string;
  guestLabel: string;
  noteLabel: string;
  cta: string;
  again: string;
  note: string;
};

const COPY: Record<OrderLang, Copy> = {
  de: {
    title: "So kommt Ihre Reservierung im Restaurant an",
    intro: "Das ist die Ansicht Ihres Restaurants. Bestätigen oder lehnen Sie ab, wie Ihr Team es tun würde.",
    restaurantSide: "Im Restaurant",
    customerSide: "Ihr Gast sieht",
    panelTitle: "Reservierungen",
    badges: { new: "Neu", confirmed: "Bestätigt", declined: "Abgelehnt" },
    confirm: "Bestätigen",
    decline: "Ablehnen",
    customerSees: {
      new: "Anfrage gesendet, das Restaurant bestätigt in Kürze.",
      confirmed: "Bestätigt. Wir freuen uns auf Sie!",
      declined: "Leider nicht möglich. Bitte wählen Sie eine andere Zeit.",
    },
    tryAction: "Tippen Sie auf Bestätigen oder Ablehnen, um zu sehen, was Ihr Gast erhält.",
    persons: (count) => (count === 1 ? "1 Person" : `${count} Personen`),
    guestLabel: "Gast",
    noteLabel: "Bemerkung",
    cta: "Jetzt registrieren - 15 Tage gratis",
    again: "Nochmal ausprobieren",
    note: "Demo: keine echte Reservierung, es wird nichts gespeichert und keine E-Mail gesendet.",
  },
  fr: {
    title: "Voici comment la réservation arrive au restaurant",
    intro: "C'est la vue de votre restaurant. Confirmez ou refusez comme le ferait votre équipe.",
    restaurantSide: "Au restaurant",
    customerSide: "Votre client voit",
    panelTitle: "Réservations",
    badges: { new: "Nouveau", confirmed: "Confirmée", declined: "Refusée" },
    confirm: "Confirmer",
    decline: "Refuser",
    customerSees: {
      new: "Demande envoyée, le restaurant confirme bientôt.",
      confirmed: "Confirmée. Nous nous réjouissons de vous accueillir !",
      declined: "Malheureusement impossible. Veuillez choisir un autre horaire.",
    },
    tryAction: "Touchez Confirmer ou Refuser pour voir ce que reçoit votre client.",
    persons: (count) => (count === 1 ? "1 personne" : `${count} personnes`),
    guestLabel: "Client",
    noteLabel: "Remarque",
    cta: "S'inscrire maintenant - 15 jours gratuits",
    again: "Essayer encore",
    note: "Démo : pas de vraie réservation, rien n'est enregistré et aucun e-mail n'est envoyé.",
  },
  it: {
    title: "Ecco come la prenotazione arriva al ristorante",
    intro: "Questa è la vista del tuo ristorante. Conferma o rifiuta come farebbe il tuo team.",
    restaurantSide: "Al ristorante",
    customerSide: "Il tuo cliente vede",
    panelTitle: "Prenotazioni",
    badges: { new: "Nuova", confirmed: "Confermata", declined: "Rifiutata" },
    confirm: "Conferma",
    decline: "Rifiuta",
    customerSees: {
      new: "Richiesta inviata, il ristorante conferma a breve.",
      confirmed: "Confermata. Non vediamo l'ora di accogliervi!",
      declined: "Purtroppo non è possibile. Scegli un altro orario.",
    },
    tryAction: "Tocca Conferma o Rifiuta per vedere cosa riceve il tuo cliente.",
    persons: (count) => (count === 1 ? "1 persona" : `${count} persone`),
    guestLabel: "Cliente",
    noteLabel: "Nota",
    cta: "Registrati ora - 15 giorni gratis",
    again: "Riprova",
    note: "Demo: nessuna prenotazione reale, non viene salvato nulla né inviata alcuna e-mail.",
  },
  en: {
    title: "This is how your reservation reaches the restaurant",
    intro: "This is your restaurant's view. Confirm or decline the way your team would.",
    restaurantSide: "At the restaurant",
    customerSide: "Your guest sees",
    panelTitle: "Reservations",
    badges: { new: "New", confirmed: "Confirmed", declined: "Declined" },
    confirm: "Confirm",
    decline: "Decline",
    customerSees: {
      new: "Request sent, the restaurant will confirm shortly.",
      confirmed: "Confirmed. We look forward to seeing you!",
      declined: "Unfortunately not possible. Please choose another time.",
    },
    tryAction: "Tap Confirm or Decline to see what your guest receives.",
    persons: (count) => (count === 1 ? "1 person" : `${count} people`),
    guestLabel: "Guest",
    noteLabel: "Note",
    cta: "Sign up now - 15 days free",
    again: "Try again",
    note: "Demo: not a real reservation, nothing is saved and no email is sent.",
  },
  ar: {
    title: "هيك بيوصل الحجز عند المطعم",
    intro: "هاي شاشة مطعمك. أكّد أو ارفض متل ما بيعمل فريقك.",
    restaurantSide: "عند المطعم",
    customerSide: "الزبون بيشوف",
    panelTitle: "الحجوزات",
    badges: { new: "جديد", confirmed: "مؤكَّد", declined: "مرفوض" },
    confirm: "تأكيد",
    decline: "رفض",
    customerSees: {
      new: "تم إرسال الطلب، المطعم رح يأكّد قريباً.",
      confirmed: "تم التأكيد. بانتظارك!",
      declined: "للأسف مو ممكن. اختار وقت تاني.",
    },
    tryAction: "اضغط تأكيد أو رفض لتشوف شو بيوصل للزبون.",
    persons: (count) => `${count} أشخاص`,
    guestLabel: "الزبون",
    noteLabel: "ملاحظة",
    cta: "سجّل الآن - 15 يوم مجاناً",
    again: "جرّب مرة ثانية",
    note: "تجريبي: مو حجز حقيقي، ما بينحفظ شي وما بيتبعت إيميل.",
  },
};

const BADGE_CLASS: Record<Stage, string> = {
  new: "bg-green-100 text-green-800",
  confirmed: "bg-blue-100 text-blue-800",
  declined: "bg-gray-100 text-gray-600",
};

export function DemoReservationResult({
  summary,
  lang,
  onClose,
}: {
  summary: DemoReservationSummary;
  lang: OrderLang;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<Stage>("new");
  const t = COPY[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  const dayLabel = new Intl.DateTimeFormat(reservationLocale(lang), {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${summary.date}T12:00:00Z`));

  return (
    <div
      dir={dir}
      lang={lang}
      className="fixed inset-0 z-[80] overflow-y-auto bg-[#f8f9fb] text-black"
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
    >
      <div className="mx-auto flex max-w-xl flex-col gap-5 px-4 py-6">
        <header className="flex flex-col gap-2">
          <h2 className="text-2xl font-black text-balance">{t.title}</h2>
          <p className="text-sm text-gray-600">{t.intro}</p>
        </header>

        <section aria-labelledby="demo-reservation-restaurant" className="flex flex-col gap-2">
          <h3
            id="demo-reservation-restaurant"
            className="text-xs font-bold uppercase tracking-widest text-gray-500"
          >
            {t.restaurantSide}
          </h3>
          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="flex items-center justify-between bg-black px-4 py-3 text-white">
              <span className="font-bold">{t.panelTitle}</span>
              {stage === "new" && (
                <span className="relative flex size-3" aria-hidden="true">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-orange-500 opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-orange-500" />
                </span>
              )}
            </div>
            <div className="flex flex-col gap-3 p-4">
              <span
                className={`self-start rounded-full px-3 py-1 text-xs font-bold ${BADGE_CLASS[stage]}`}
              >
                {t.badges[stage]}
              </span>
              <div>
                <p className="text-lg font-black" dir="auto">
                  {dayLabel}
                </p>
                <p className="text-lg font-black" dir="ltr">
                  {summary.time}
                </p>
                <p className="text-sm font-bold text-gray-600" dir="auto">
                  {t.persons(summary.partySize)}
                </p>
              </div>
              <p className="text-sm" dir="auto">
                <span className="font-bold">{t.guestLabel}: </span>
                {[summary.guestName, summary.guestPhone].filter(Boolean).join(" · ")}
              </p>
              {summary.note && (
                <p className="text-sm" dir="auto">
                  <span className="font-bold">{t.noteLabel}: </span>
                  {summary.note}
                </p>
              )}
              {stage === "new" && (
                <>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStage("confirmed")}
                      className="min-h-12 flex-1 rounded-xl bg-orange-500 px-4 py-3 font-black text-black"
                    >
                      {t.confirm}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStage("declined")}
                      className="min-h-12 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 font-bold"
                    >
                      {t.decline}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">{t.tryAction}</p>
                </>
              )}
            </div>
          </div>
        </section>

        <section aria-labelledby="demo-reservation-customer" className="flex flex-col gap-2">
          <h3
            id="demo-reservation-customer"
            className="text-xs font-bold uppercase tracking-widest text-gray-500"
          >
            {t.customerSide}
          </h3>
          <p
            role="status"
            aria-live="polite"
            className={`rounded-2xl px-4 py-4 font-bold ${
              stage === "confirmed" ? "bg-green-700 text-white" : "bg-black text-white"
            }`}
          >
            {t.customerSees[stage]}
          </p>
        </section>

        <div className="flex flex-col gap-3">
          <a
            href="/signup"
            className="flex min-h-12 items-center justify-center rounded-xl bg-[#c41e24] px-4 py-3 text-center font-black text-white"
          >
            {t.cta}
          </a>
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 rounded-xl border border-black bg-white px-4 py-3 font-bold"
          >
            {t.again}
          </button>
          <p className="text-center text-xs text-gray-500">{t.note}</p>
        </div>
      </div>
    </div>
  );
}
