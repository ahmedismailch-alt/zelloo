"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "../../../lib/supabase";
import {
  GeneralQrCard,
  TableQrGrid,
} from "../../../components/dashboard/table-qr-grid";
import { DashboardShell } from "../../../components/dashboard/dashboard-shell";

const MIN_TABLES = 1;
const MAX_TABLES = 100;

type Restaurant = { id: number | string; name: string };

export default function TablesPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [origin, setOrigin] = useState("");
  const [pageError, setPageError] = useState("");
  const [tableInput, setTableInput] = useState("10");
  const [copied, setCopied] = useState(false);
  const generalQrRef = useRef<HTMLDivElement>(null);

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

        const { data, error } = await supabase
          .from("restaurants")
          .select("id, name")
          .eq("owner_id", user.id)
          .maybeSingle();

        if (error) throw error;
        if (cancelled) return;

        setOrigin(window.location.origin);
        setRestaurant(data as Restaurant | null);
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

  const parsedCount = Number.parseInt(tableInput, 10);
  const tableCount = Number.isFinite(parsedCount)
    ? Math.min(MAX_TABLES, Math.max(MIN_TABLES, parsedCount))
    : MIN_TABLES;

  const restaurantLink = `${origin}/r/${encodeURIComponent(
    String(restaurant.id)
  )}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(restaurantLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error(error);
    }
  }

  function downloadGeneralQrPng() {
    const canvas = generalQrRef.current?.querySelector("canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "zelloo-restaurant-qr.png";
    link.click();
  }

  return (
    <>
    <DashboardShell restaurantName={restaurant.name} />
    <main className="min-h-screen bg-[#f8f9fb] text-black p-5 md:pl-[17rem] print:bg-white print:p-0 print:md:pl-0">
      <div className="max-w-5xl mx-auto">
        <div className="print:hidden">
          <Link
            href="/dashboard"
            className="inline-flex items-center min-h-11 text-sm font-semibold text-gray-600"
          >
            {"← Zurück zum Dashboard"}
          </Link>

          <p className="text-sm font-bold text-orange-500 mt-2">ZELLOO</p>
          <h1 className="text-3xl font-black mt-1 text-balance">
            QR-Codes für Tische
          </h1>
          <p className="text-gray-500 mt-2 leading-relaxed text-pretty">
            Jeder QR-Code öffnet Ihre Speisekarte mit der richtigen
            Tischnummer. Bestellungen erscheinen danach im Dashboard.
          </p>

          <section className="bg-white border rounded-2xl p-5 mt-6">
            <h2 className="text-lg font-black">Ihr Restaurant-Link</h2>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Für Abholung oder Bestellungen ohne feste Tischnummer.
            </p>
            <p className="font-mono text-sm break-all bg-gray-50 rounded-xl p-3 mt-3">
              {restaurantLink}
            </p>
            <div className="flex gap-3 mt-3">
              <button
                type="button"
                onClick={() => void copyLink()}
                className="flex-1 min-h-11 bg-black text-white rounded-xl px-4 font-bold"
              >
                {copied ? "Kopiert" : "Kopieren"}
              </button>
              <a
                href={restaurantLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-h-11 inline-flex items-center justify-center border border-gray-300 rounded-xl px-4 font-semibold"
              >
                Öffnen
              </a>
            </div>
            <p role="status" className="sr-only">
              {copied ? "Link kopiert" : ""}
            </p>

            <div className="mt-4 max-w-44">
              <GeneralQrCard
                url={restaurantLink}
                restaurantName={restaurant.name}
              />
            </div>
          </section>

          <section className="bg-white border rounded-2xl p-5 mt-4 mb-6">
            <label htmlFor="table-count" className="text-lg font-black">
              Anzahl Tische
            </label>
            <p className="text-sm text-gray-500 mt-1">
              {`Zwischen ${MIN_TABLES} und ${MAX_TABLES}`}
            </p>
            <div className="flex gap-3 mt-3">
              <input
                id="table-count"
                type="number"
                inputMode="numeric"
                min={MIN_TABLES}
                max={MAX_TABLES}
                value={tableInput}
                onChange={(event) => setTableInput(event.target.value)}
                className="w-24 min-h-11 border rounded-xl px-3 text-base font-bold"
              />
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 min-h-11 bg-orange-500 text-black rounded-xl px-4 font-bold hover:bg-orange-400 transition-colors"
              >
                {`Alle drucken (${tableCount})`}
              </button>
            </div>
          </section>
        </div>

        <TableQrGrid
          baseUrl={restaurantLink}
          tableCount={tableCount}
          restaurantName={restaurant.name}
        />
      </div>
    </main>
    </>
  );
}
