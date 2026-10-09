"use client";

import { useState } from "react";
import type { OrderLang } from "../../lib/order-i18n";
import { formatChf } from "./format";

export type DemoSummary = {
  orderId: string;
  totalCents: number;
  orderType: "pickup" | "delivery";
  table: string | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  lines: { name: string; quantity: number }[];
};

type Stage = 0 | 1 | 2 | 3;

type Copy = {
  title: string;
  intro: string;
  restaurantSide: string;
  customerSide: string;
  newBadge: string;
  workBadge: string;
  readyBadge: string;
  doneBadge: string;
  accept: string;
  ready: string;
  complete: string;
  customerSees: [string, string, string, string];
  tryAction: string;
  pickup: string;
  delivery: string;
  tableLabel: (table: string) => string;
  customerLabel: string;
  addressLabel: string;
  cta: string;
  again: string;
  note: string;
};

const COPY: Record<OrderLang, Copy> = {
  de: {
    title: "So kommt Ihre Bestellung im Restaurant an",
    intro: "Das ist die Ansicht Ihres Restaurants. Tippen Sie die Buttons, wie Ihr Team es tun würde.",
    restaurantSide: "Im Restaurant",
    customerSide: "Ihr Gast sieht",
    newBadge: "Neu",
    workBadge: "In Arbeit",
    readyBadge: "Bereit",
    doneBadge: "Abgeschlossen",
    accept: "Annehmen",
    ready: "Bereit",
    complete: "Abschliessen",
    customerSees: [
      "Bestellung gesendet, das Restaurant bestätigt gleich.",
      "Wird zubereitet, bereit in ca. 15 Minuten.",
      "Ihre Bestellung ist bereit.",
      "Danke für Ihre Bestellung!",
    ],
    tryAction: "Tippen Sie auf den Button, um den nächsten Schritt zu sehen.",
    pickup: "Abholung",
    delivery: "Lieferung",
    tableLabel: (table) => `Tisch ${table}`,
    customerLabel: "Kunde",
    addressLabel: "Lieferadresse",
    cta: "Jetzt registrieren - 15 Tage gratis",
    again: "Nochmal ausprobieren",
    note: "Demo: keine echte Bestellung, es wird nichts zubereitet.",
  },
  fr: {
    title: "Voici comment la commande arrive au restaurant",
    intro: "C'est la vue de votre restaurant. Touchez les boutons comme le ferait votre équipe.",
    restaurantSide: "Au restaurant",
    customerSide: "Votre client voit",
    newBadge: "Nouveau",
    workBadge: "En cours",
    readyBadge: "Prêt",
    doneBadge: "Terminé",
    accept: "Accepter",
    ready: "Prêt",
    complete: "Terminer",
    customerSees: [
      "Commande envoyée, le restaurant confirme bientôt.",
      "En préparation, prête dans environ 15 minutes.",
      "Votre commande est prête.",
      "Merci pour votre commande !",
    ],
    tryAction: "Touchez le bouton pour voir l'étape suivante.",
    pickup: "À emporter",
    delivery: "Livraison",
    tableLabel: (table) => `Table ${table}`,
    customerLabel: "Client",
    addressLabel: "Adresse de livraison",
    cta: "S'inscrire maintenant - 15 jours gratuits",
    again: "Essayer encore",
    note: "Démo : pas de vraie commande, rien n'est préparé.",
  },
  it: {
    title: "Ecco come l'ordine arriva al ristorante",
    intro: "Questa è la vista del tuo ristorante. Tocca i pulsanti come farebbe il tuo team.",
    restaurantSide: "Al ristorante",
    customerSide: "Il tuo cliente vede",
    newBadge: "Nuovo",
    workBadge: "In corso",
    readyBadge: "Pronto",
    doneBadge: "Concluso",
    accept: "Accetta",
    ready: "Pronto",
    complete: "Concludi",
    customerSees: [
      "Ordine inviato, il ristorante conferma a breve.",
      "In preparazione, pronto tra circa 15 minuti.",
      "Il tuo ordine è pronto.",
      "Grazie per il tuo ordine!",
    ],
    tryAction: "Tocca il pulsante per vedere il passaggio successivo.",
    pickup: "Ritiro",
    delivery: "Consegna",
    tableLabel: (table) => `Tavolo ${table}`,
    customerLabel: "Cliente",
    addressLabel: "Indirizzo di consegna",
    cta: "Registrati ora - 15 giorni gratis",
    again: "Riprova",
    note: "Demo: nessun ordine reale, non viene preparato nulla.",
  },
  en: {
    title: "This is how your order reaches the restaurant",
    intro: "This is your restaurant's view. Tap the buttons the way your team would.",
    restaurantSide: "At the restaurant",
    customerSide: "Your guest sees",
    newBadge: "New",
    workBadge: "In progress",
    readyBadge: "Ready",
    doneBadge: "Completed",
    accept: "Accept",
    ready: "Ready",
    complete: "Complete",
    customerSees: [
      "Order sent, the restaurant will confirm shortly.",
      "Being prepared, ready in about 15 minutes.",
      "Your order is ready.",
      "Thank you for your order!",
    ],
    tryAction: "Tap the button to see the next step.",
    pickup: "Pickup",
    delivery: "Delivery",
    tableLabel: (table) => `Table ${table}`,
    customerLabel: "Customer",
    addressLabel: "Delivery address",
    cta: "Sign up now - 15 days free",
    again: "Try again",
    note: "Demo: not a real order, nothing is being prepared.",
  },
  ar: {
    title: "هيك بيوصل طلبك عند المطعم",
    intro: "هاي شاشة مطعمك. اضغط الأزرار متل ما بيعمل فريقك.",
    restaurantSide: "عند المطعم",
    customerSide: "الزبون بيشوف",
    newBadge: "جديد",
    workBadge: "قيد التحضير",
    readyBadge: "جاهز",
    doneBadge: "مكتمل",
    accept: "قبول",
    ready: "جاهز",
    complete: "إنهاء",
    customerSees: [
      "تم إرسال الطلب، المطعم رح يأكّد قريباً.",
      "قيد التحضير، جاهز بعد حوالي 15 دقيقة.",
      "طلبك جاهز.",
      "شكراً على طلبك!",
    ],
    tryAction: "اضغط الزر لتشوف الخطوة التالية.",
    pickup: "استلام",
    delivery: "توصيل",
    tableLabel: (table) => `طاولة ${table}`,
    customerLabel: "الزبون",
    addressLabel: "عنوان التوصيل",
    cta: "سجّل الآن - 15 يوم مجاناً",
    again: "جرّب مرة ثانية",
    note: "تجريبي: مو طلب حقيقي، ما في شي عم يتحضّر.",
  },
};

export function DemoResult({
  summary,
  lang,
  onClose,
}: {
  summary: DemoSummary;
  lang: OrderLang;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<Stage>(0);
  const t = COPY[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  const badge = [t.newBadge, t.workBadge, t.readyBadge, t.doneBadge][stage];
  const badgeClass = [
    "bg-green-100 text-green-800",
    "bg-amber-100 text-amber-800",
    "bg-blue-100 text-blue-800",
    "bg-gray-100 text-gray-600",
  ][stage];
  const actionLabel = [t.accept, t.ready, t.complete][stage];

  const placeLabel = summary.table
    ? t.tableLabel(summary.table)
    : summary.orderType === "delivery"
      ? t.delivery
      : t.pickup;

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-30 overflow-y-auto bg-[#f8f9fb] text-black"
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
    >
      <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-5">
        <header className="flex flex-col gap-2">
          <h2 className="text-2xl font-black text-balance">{t.title}</h2>
          <p className="text-sm text-gray-600">{t.intro}</p>
        </header>

        <section aria-labelledby="demo-restaurant-side" className="flex flex-col gap-2">
          <h3
            id="demo-restaurant-side"
            className="text-xs font-bold tracking-widest text-gray-500 uppercase"
          >
            {t.restaurantSide}
          </h3>
          <div className="rounded-2xl border bg-white overflow-hidden shadow-sm">
            <div className="flex items-center justify-between bg-black px-4 py-3 text-white">
              <span className="font-bold">Bestellungen</span>
              {stage === 0 && (
                <span className="relative flex size-3" aria-hidden="true">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-orange-500 opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-orange-500" />
                </span>
              )}
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${badgeClass}`}
                >
                  {badge}
                </span>
                <span className="text-sm text-gray-500" dir="ltr">
                  #{summary.orderId.slice(0, 8)}
                </span>
              </div>
              <p className="font-black">{placeLabel}</p>
              {(summary.customerName || summary.customerPhone) && (
                <p className="text-sm" dir="auto">
                  <span className="font-bold">{t.customerLabel}: </span>
                  {[summary.customerName, summary.customerPhone].filter(Boolean).join(" · ")}
                </p>
              )}
              {summary.orderType === "delivery" && summary.customerAddress && (
                <p className="text-sm" dir="auto">
                  <span className="font-bold">{t.addressLabel}: </span>
                  {summary.customerAddress}
                </p>
              )}
              <ul className="flex flex-col gap-1 text-sm" dir="auto">
                {summary.lines.map((line, index) => (
                  <li key={`${line.name}-${index}`}>
                    {line.quantity} x {line.name}
                  </li>
                ))}
              </ul>
              <p className="font-bold" dir="ltr">
                {formatChf(summary.totalCents)}
              </p>
              {stage < 3 && (
                <button
                  type="button"
                  onClick={() => setStage((current) => Math.min(current + 1, 3) as Stage)}
                  className="min-h-12 rounded-xl bg-orange-500 px-4 py-3 font-black text-black"
                >
                  {actionLabel}
                </button>
              )}
              {stage === 0 && <p className="text-xs text-gray-500">{t.tryAction}</p>}
            </div>
          </div>
        </section>

        <section aria-labelledby="demo-customer-side" className="flex flex-col gap-2">
          <h3
            id="demo-customer-side"
            className="text-xs font-bold tracking-widest text-gray-500 uppercase"
          >
            {t.customerSide}
          </h3>
          <p
            role="status"
            aria-live="polite"
            className={`rounded-2xl px-4 py-4 font-bold ${
              stage === 2 || stage === 3 ? "bg-green-700 text-white" : "bg-black text-white"
            }`}
          >
            {t.customerSees[stage]}
          </p>
        </section>

        <div className="flex flex-col gap-3">
          <a
            href="/signup"
            className="min-h-12 flex items-center justify-center rounded-xl bg-[#c41e24] px-4 py-3 text-center font-black text-white"
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
