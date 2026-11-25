"use client";

import { useEffect, useState } from "react";
import { isAutoPrintEnabled, setAutoPrintEnabled } from "../../lib/auto-print";

export function PrintSettings() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(isAutoPrintEnabled());
  }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    setAutoPrintEnabled(next);
  }

  return (
    <section
      className="bg-white border rounded-2xl p-4 flex flex-col gap-3 mt-4"
      aria-labelledby="print-title"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="print-title" className="text-base font-bold">
            Automatischer Bon-Druck
          </h2>
          <p className="text-xs text-gray-500">
            Neue Bestellungen werden auf diesem Gerät automatisch gedruckt. Aktivieren Sie
            dies nur auf dem Gerät, das mit dem Drucker verbunden ist.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Automatischer Bon-Druck"
          onClick={toggle}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
            enabled ? "bg-orange-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 size-6 rounded-full bg-white transition-all ${
              enabled ? "left-[1.4rem]" : "left-0.5"
            }`}
          />
        </button>
      </div>

      <details className="rounded-xl bg-gray-50 p-3 text-sm">
        <summary className="min-h-11 cursor-pointer font-semibold flex items-center">
          So verbinden Sie einen Drucker
        </summary>
        <ol className="mt-2 flex list-decimal flex-col gap-2 pl-5 text-gray-700">
          <li>
            Drucker (z. B. Bon-Drucker mit WLAN oder USB) am Tablet oder Computer einrichten, wie
            jeden normalen Drucker.
          </li>
          <li>
            Zelloo-Dashboard auf diesem Gerät öffnen und den Schalter oben aktivieren. Das
            Dashboard muss geöffnet bleiben.
          </li>
          <li>
            Bei jeder neuen Bestellung öffnet sich der Druckdialog. Für Druck ohne Nachfrage
            Chrome mit der Einstellung &quot;kiosk-printing&quot; starten (Windows/Android-Tablet).
          </li>
        </ol>
      </details>
    </section>
  );
}
