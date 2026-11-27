"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { monthFetchWindow, monthOptions, zurichDayKey } from "@/lib/order-stats";
import { orderTypeLabel, vatPartCents, vatRateFor } from "@/lib/vat";

const PAGE_SIZE = 1000;
const MAX_ORDERS = 10000;

type ExportOrder = {
  order_number: number | null;
  status: string;
  total_cents: number;
  created_at: string;
  paid_at?: string | null;
  table_number: string | number | null;
  order_type: string | null;
};

const zurichTime = new Intl.DateTimeFormat("de-CH", {
  timeZone: "Europe/Zurich",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function chf(cents: number) {
  return (cents / 100).toFixed(2);
}

function csvCell(value: string | number) {
  const text = String(value);
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function germanDate(dayKey: string) {
  const [year, month, day] = dayKey.split("-");
  return `${day}.${month}.${year}`;
}

async function fetchMonthOrders(restaurantId: number | string, monthKey: string) {
  const { fromIso, toIso } = monthFetchWindow(monthKey);
  const collected: ExportOrder[] = [];
  let columns = "order_number, status, total_cents, created_at, paid_at, table_number, order_type";

  for (let from = 0; from < MAX_ORDERS; from += PAGE_SIZE) {
    const fetchPage = (select: string) =>
      supabase
        .from("orders")
        .select(select)
        .eq("restaurant_id", restaurantId)
        .gte("created_at", fromIso)
        .lt("created_at", toIso)
        .order("created_at", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);

    let { data, error } = await fetchPage(columns);
    if (error) {
      // order_number / paid_at may not exist on older databases.
      columns = "status, total_cents, created_at, table_number, order_type";
      ({ data, error } = await fetchPage(columns));
    }
    if (error) throw error;
    collected.push(...((data || []) as unknown as ExportOrder[]));
    if (!data || data.length < PAGE_SIZE) break;
  }

  return collected.filter((order) => zurichDayKey(order.created_at).startsWith(monthKey));
}

function buildCsv(orders: ExportOrder[]) {
  const header = [
    "Datum",
    "Uhrzeit",
    "Nr.",
    "Typ",
    "Tisch",
    "Status",
    "Bezahlt",
    "Brutto CHF",
    "MWST-Satz %",
    "MWST CHF",
    "Netto CHF",
  ];

  let grossTotal = 0;
  let vatTotal = 0;

  const rows = orders.map((order) => {
    const cancelled = order.status === "cancelled";
    const gross = Number(order.total_cents) || 0;
    const rate = vatRateFor(order);
    const vat = vatPartCents(gross, rate);
    if (!cancelled) {
      grossTotal += gross;
      vatTotal += vat;
    }
    return [
      germanDate(zurichDayKey(order.created_at)),
      zurichTime.format(new Date(order.created_at)),
      order.order_number ?? "",
      orderTypeLabel(order),
      order.table_number ?? "",
      cancelled ? "storniert" : order.status,
      order.paid_at ? "ja" : "nein",
      chf(gross),
      rate,
      chf(vat),
      chf(gross - vat),
    ];
  });

  const totalRow = [
    "Total (ohne stornierte)",
    "",
    "",
    "",
    "",
    "",
    "",
    chf(grossTotal),
    "",
    chf(vatTotal),
    chf(grossTotal - vatTotal),
  ];

  const lines = [header, ...rows, totalRow].map((row) => row.map(csvCell).join(";"));
  return `\uFEFF${lines.join("\r\n")}`;
}

function downloadCsv(content: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function CsvExport({ restaurantId }: { restaurantId: number | string }) {
  const options = useMemo(() => monthOptions(12), []);
  const [monthKey, setMonthKey] = useState(options[0].key);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleExport() {
    setBusy(true);
    setMessage("");
    try {
      const orders = await fetchMonthOrders(restaurantId, monthKey);
      if (orders.length === 0) {
        setMessage("Keine Bestellungen in diesem Monat.");
        return;
      }
      downloadCsv(buildCsv(orders), `zelloo-bestellungen-${monthKey}.csv`);
    } catch (error) {
      console.error(error);
      setMessage("Export fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-5 bg-white border rounded-2xl p-5 print:hidden" aria-label="CSV-Export">
      <h2 className="text-lg font-black">Export für die Buchhaltung</h2>
      <p className="text-sm text-gray-500 mt-1 leading-relaxed">
        Alle Bestellungen eines Monats als CSV (Excel) inklusive MWST.
      </p>
      <div className="flex flex-col gap-3 mt-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="export-month" className="block text-sm font-semibold text-gray-600 mb-1">
            Monat
          </label>
          <select
            id="export-month"
            value={monthKey}
            onChange={(event) => setMonthKey(event.target.value)}
            className="w-full min-h-11 bg-white border rounded-xl px-3 text-base font-semibold"
          >
            {options.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={busy}
          className="min-h-11 bg-black text-white rounded-xl px-4 font-bold disabled:opacity-40"
        >
          {busy ? "Wird erstellt..." : "CSV exportieren"}
        </button>
      </div>
      {message && (
        <p role="status" className="mt-3 text-sm text-gray-700">
          {message}
        </p>
      )}
    </section>
  );
}
