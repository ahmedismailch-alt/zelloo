"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { supabase } from "@/lib/supabase";
import {
  computeDaySummary,
  dayFetchWindow,
  dayOptions,
  formatChf,
  type StatsOrder,
} from "@/lib/order-stats";
import { VAT_DINE_IN } from "@/lib/vat";

const PAGE_SIZE = 1000;
const MAX_ORDERS = 5000;

async function fetchDayOrders([, restaurantId, dayKey]: [string, number | string, string]) {
  const { fromIso, toIso } = dayFetchWindow(dayKey);
  const collected: StatsOrder[] = [];

  const itemColumns = "order_items (item_name, quantity, unit_price_cents)";
  let columns = `status, total_cents, created_at, paid_at, table_number, order_type, ${itemColumns}`;

  for (let from = 0; from < MAX_ORDERS; from += PAGE_SIZE) {
    const fetchPage = (select: string) =>
      supabase
        .from("orders")
        .select(select)
        .eq("restaurant_id", restaurantId)
        .gte("created_at", fromIso)
        .lt("created_at", toIso)
        .order("created_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

    let { data, error } = await fetchPage(columns);
    if (error) {
      // paid_at column may not exist yet.
      columns = `status, total_cents, created_at, table_number, order_type, ${itemColumns}`;
      ({ data, error } = await fetchPage(columns));
    }
    if (error) throw error;
    collected.push(...((data || []) as unknown as StatsOrder[]));
    if (!data || data.length < PAGE_SIZE) break;
  }

  return collected;
}

function formatPrintedAt() {
  return new Intl.DateTimeFormat("de-CH", {
    timeZone: "Europe/Zurich",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());
}

export function DayClosing({
  restaurantId,
  restaurantName,
}: {
  restaurantId: number | string;
  restaurantName: string;
}) {
  const options = useMemo(() => dayOptions(30), []);
  const [open, setOpen] = useState(false);
  const [dayKey, setDayKey] = useState(options[0].key);

  const { data: orders, error, isLoading } = useSWR(
    open ? ["day-closing", restaurantId, dayKey] : null,
    fetchDayOrders
  );

  const summary = useMemo(() => (orders ? computeDaySummary(orders, dayKey) : null), [orders, dayKey]);
  const dayLabel = options.find((option) => option.key === dayKey)?.label ?? dayKey;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-5 w-full min-h-14 bg-white border rounded-2xl px-5 py-3 text-left flex items-center justify-between gap-3 print:hidden"
      >
        <span>
          <span className="block font-black">Tagesabschluss</span>
          <span className="block text-sm text-gray-500">Zusammenfassung des Tages zum Drucken</span>
        </span>
        <span aria-hidden="true" className="text-xl font-black">
          {"›"}
        </span>
      </button>
    );
  }

  return (
    <section className="mt-5" aria-label="Tagesabschluss">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end print:hidden">
        <div className="flex-1">
          <label htmlFor="closing-day" className="block text-sm font-semibold text-gray-600 mb-1">
            Tag
          </label>
          <select
            id="closing-day"
            value={dayKey}
            onChange={(event) => setDayKey(event.target.value)}
            className="w-full min-h-11 bg-white border rounded-xl px-3 text-base font-semibold"
          >
            {options.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!summary}
            className="min-h-11 bg-black text-white rounded-xl px-4 font-bold disabled:opacity-40"
          >
            Drucken / PDF
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="min-h-11 bg-white border rounded-xl px-4 font-bold"
          >
            Schliessen
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 bg-red-50 text-red-700 rounded-xl p-3 text-sm print:hidden">
          Tagesabschluss konnte nicht geladen werden. Bitte erneut versuchen.
        </p>
      )}

      <article
        aria-busy={isLoading}
        className="mt-4 bg-white border rounded-2xl p-5 text-black print:mt-0 print:border-0 print:p-0"
      >
        <header className="border-b pb-4">
          <p className="text-sm text-gray-500">{restaurantName}</p>
          <h2 className="text-2xl font-black mt-1">Tagesabschluss</h2>
          <p className="font-semibold mt-1">{dayLabel}</p>
        </header>

        {isLoading || !summary ? (
          <p className="py-8 text-center text-gray-500 print:hidden">Wird geladen...</p>
        ) : (
          <>
            <dl className="mt-4 flex flex-col">
              <div className="flex items-baseline justify-between gap-3 py-3 border-b">
                <dt className="text-gray-600">Umsatz</dt>
                <dd className="text-2xl font-black">{formatChf(summary.revenueCents)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 py-3 border-b">
                <dt className="text-gray-600">Bestellungen</dt>
                <dd className="font-black">{summary.orderCount}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 py-3 border-b">
                <dt className="text-gray-600">Ø pro Bestellung</dt>
                <dd className="font-black">{formatChf(summary.averageCents)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 py-3 border-b">
                <dt className="text-gray-600">Bezahlt</dt>
                <dd className="font-black">
                  {summary.paidCount}
                  <span className="font-semibold text-gray-500"> · {formatChf(summary.paidCents)}</span>
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 py-3 border-b">
                <dt className="text-gray-600">Noch offen</dt>
                <dd className="font-black">
                  {summary.unpaidCount}
                  <span className="font-semibold text-gray-500"> · {formatChf(summary.unpaidCents)}</span>
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 py-3 border-b">
                <dt className="text-gray-600">Storniert (nicht im Umsatz)</dt>
                <dd className="font-black">
                  {summary.cancelledCount}
                  {summary.cancelledCount > 0 && (
                    <span className="font-semibold text-gray-500"> · {formatChf(summary.cancelledCents)}</span>
                  )}
                </dd>
              </div>
            </dl>

            <h3 className="font-black mt-5">MWST (im Umsatz enthalten)</h3>
            <dl className="mt-2 flex flex-col">
              {summary.vatLines.map((line) => (
                <div key={line.rate} className="flex items-baseline justify-between gap-3 py-2 border-b">
                  <dt className="text-gray-600">
                    {line.rate === VAT_DINE_IN ? "Im Lokal" : "Take-away / Lieferung"} · {line.rate}%
                    <span className="block text-xs text-gray-500">Umsatz {formatChf(line.grossCents)}</span>
                  </dt>
                  <dd className="font-black">{formatChf(line.vatCents)}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-3 py-2 border-b">
                <dt className="font-semibold">MWST total</dt>
                <dd className="font-black">{formatChf(summary.totalVatCents)}</dd>
              </div>
            </dl>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Richtwert: Bestellungen am Tisch 8.1%, alle anderen 2.6%. Alkohol zum Mitnehmen (8.1%) wird nicht
              getrennt. Bitte mit Ihrer Buchhaltung abstimmen.
            </p>

            <h3 className="font-black mt-5">Meistverkaufte Artikel</h3>
            {summary.topItems.length === 0 ? (
              <p className="text-gray-500 mt-2">Keine Bestellungen an diesem Tag.</p>
            ) : (
              <ol className="mt-2 flex flex-col">
                {summary.topItems.map((item, index) => (
                  <li key={item.name} className="flex items-center gap-3 py-2 border-b last:border-b-0">
                    <span className="w-6 shrink-0 font-black">{index + 1}.</span>
                    <span className="flex-1 min-w-0 font-semibold truncate">{item.name}</span>
                    <span className="shrink-0 text-right">
                      <span className="font-black">{item.quantity}×</span>
                      <span className="text-sm text-gray-500"> · {formatChf(item.revenueCents)}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}

            <p className="text-xs text-gray-500 mt-5">Erstellt am {formatPrintedAt()} (Schweizer Zeit)</p>
          </>
        )}
      </article>
    </section>
  );
}
