"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

function TableQrCard({
  url,
  table,
  restaurantName,
}: {
  url: string;
  table: number;
  restaurantName: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  function downloadPng() {
    const canvas = wrapperRef.current?.querySelector("canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `zelloo-tisch-${table}.png`;
    link.click();
  }

  return (
    <article className="min-w-0 bg-white border rounded-2xl p-4 flex flex-col items-center text-center break-inside-avoid print:border-gray-400">
      <p className="text-xs font-bold text-orange-500 tracking-wide">
        {restaurantName}
      </p>
      <p className="text-2xl font-black mt-1">Tisch {table}</p>

      <div ref={wrapperRef} className="mt-3 w-full max-w-44">
        <QRCodeCanvas
          value={url}
          size={512}
          marginSize={2}
          level="M"
          title={`QR-Code für Tisch ${table}`}
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>

      <p className="text-sm text-gray-600 mt-2 leading-relaxed">
        Scannen und bestellen
      </p>

      <button
        type="button"
        onClick={downloadPng}
        className="mt-3 w-full min-h-11 border border-gray-300 rounded-xl px-3 text-sm font-semibold print:hidden"
      >
        Als Bild speichern
      </button>
    </article>
  );
}

export function TableQrGrid({
  baseUrl,
  tableCount,
  restaurantName,
}: {
  baseUrl: string;
  tableCount: number;
  restaurantName: string;
}) {
  const tables = Array.from({ length: tableCount }, (_, index) => index + 1);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 print:grid-cols-3 print:gap-4">
      {tables.map((table) => (
        <TableQrCard
          key={table}
          table={table}
          url={`${baseUrl}?table=${table}`}
          restaurantName={restaurantName}
        />
      ))}
    </div>
  );
}
