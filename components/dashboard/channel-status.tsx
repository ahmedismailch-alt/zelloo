"use client";

import { useRef, useState } from "react";
import { OrderBell } from "../../lib/order-bell";

type Props = {
  restaurantId: number | string;
  whatsappConnected: boolean | null;
};

export function ChannelStatus({ restaurantId, whatsappConnected }: Props) {
  const bellRef = useRef<OrderBell | null>(null);
  const [alertTested, setAlertTested] = useState(false);

  async function testAlert() {
    if (!bellRef.current) bellRef.current = new OrderBell();
    await bellRef.current.enable();
    bellRef.current.ring();
    setAlertTested(true);
  }

  const statusLabel =
    whatsappConnected === null
      ? "Wird geprüft..."
      : whatsappConnected
        ? "Verbunden"
        : "Nicht eingerichtet";

  return (
    <section
      aria-labelledby="channels-title"
      className="bg-white border rounded-2xl p-4 flex flex-col gap-3 mt-4"
    >
      <h2 id="channels-title" className="text-base font-bold">
        Kanäle und Tests
      </h2>

      <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-3">
        <span className="text-sm font-semibold">WhatsApp</span>
        <span
          role="status"
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            whatsappConnected
              ? "bg-green-100 text-green-800"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <a
          href={`/r/${restaurantId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-h-12 rounded-xl bg-orange-500 text-white font-black text-base flex items-center justify-center"
        >
          Testbestellung aufgeben
        </a>
        <button
          type="button"
          onClick={() => void testAlert()}
          className="flex-1 min-h-12 rounded-xl border border-gray-300 bg-white font-black text-base"
        >
          Alarm testen
        </button>
      </div>
      {alertTested && (
        <p role="status" className="text-xs text-gray-500">
          Alarm abgespielt. Hörten Sie nichts, prüfen Sie die Lautstärke.
        </p>
      )}
    </section>
  );
}
