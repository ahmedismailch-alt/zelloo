"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import {
  DAY_LABELS_DE,
  defaultOpeningHours,
  parseOpeningHours,
  type OpeningHours,
} from "../../lib/restaurant-settings";

function centsToInput(cents: unknown) {
  const value = Number(cents);
  return Number.isFinite(value) && value > 0 ? (value / 100).toFixed(2) : "";
}

function inputToCents(value: string) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) : 0;
}

export function OperationsSettings({ restaurantId }: { restaurantId: number | string }) {
  const [useHours, setUseHours] = useState(false);
  const [hours, setHours] = useState<OpeningHours>(defaultOpeningHours());
  const [fee, setFee] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [zones, setZones] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error: readError } = await supabase
        .from("restaurants")
        .select("opening_hours, delivery_fee_cents, delivery_min_order_cents, delivery_zones")
        .eq("id", restaurantId)
        .maybeSingle();
      if (cancelled) return;
      if (readError) {
        setUnavailable(true);
        return;
      }
      const parsed = parseOpeningHours(data?.opening_hours);
      if (parsed) {
        setHours(parsed);
        setUseHours(true);
      }
      setFee(centsToInput(data?.delivery_fee_cents));
      setMinOrder(centsToInput(data?.delivery_min_order_cents));
      setZones(typeof data?.delivery_zones === "string" ? data.delivery_zones : "");
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  function updateDay(index: number, patch: Partial<OpeningHours[number]>) {
    setHours((current) =>
      current.map((day, i) => (i === index ? { ...day, ...patch } : day))
    );
    setSaved(false);
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const { error: updateError } = await supabase
      .from("restaurants")
      .update({
        opening_hours: useHours ? hours : null,
        delivery_fee_cents: inputToCents(fee),
        delivery_min_order_cents: inputToCents(minOrder),
        delivery_zones: zones.trim(),
      })
      .eq("id", restaurantId);

    setSaving(false);
    if (updateError) {
      setError("Speichern nicht möglich. Bitte später erneut versuchen.");
      return;
    }
    setSaved(true);
  }

  if (unavailable) return null;

  return (
    <form
      onSubmit={handleSave}
      className="bg-white border rounded-2xl p-4 flex flex-col gap-5 mt-4"
    >
      <section className="flex flex-col gap-3" aria-labelledby="hours-title">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 id="hours-title" className="text-base font-bold">
              Öffnungszeiten
            </h2>
            <p className="text-xs text-gray-500">
              Ausserhalb dieser Zeiten werden keine Bestellungen angenommen.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={useHours}
            aria-label="Öffnungszeiten aktivieren"
            onClick={() => {
              setUseHours((v) => !v);
              setSaved(false);
            }}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
              useHours ? "bg-orange-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 size-6 rounded-full bg-white transition-all ${
                useHours ? "left-[1.4rem]" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {useHours && (
          <ul className="flex flex-col gap-2">
            {hours.map((day, index) => (
              <li
                key={DAY_LABELS_DE[index]}
                className="flex flex-wrap items-center gap-2 rounded-xl bg-gray-50 p-2"
              >
                <span className="w-24 text-sm font-semibold">{DAY_LABELS_DE[index]}</span>
                {day.closed ? (
                  <span className="flex-1 text-sm text-gray-500">Geschlossen</span>
                ) : (
                  <span className="flex flex-1 items-center gap-1">
                    <input
                      type="time"
                      value={day.open}
                      onChange={(e) => updateDay(index, { open: e.target.value })}
                      aria-label={`${DAY_LABELS_DE[index]} Öffnung`}
                      className="min-h-11 w-full min-w-0 rounded-lg border border-gray-300 px-2 text-base"
                    />
                    <span aria-hidden="true">–</span>
                    <input
                      type="time"
                      value={day.close}
                      onChange={(e) => updateDay(index, { close: e.target.value })}
                      aria-label={`${DAY_LABELS_DE[index]} Schluss`}
                      className="min-h-11 w-full min-w-0 rounded-lg border border-gray-300 px-2 text-base"
                    />
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => updateDay(index, { closed: !day.closed })}
                  className="min-h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold"
                >
                  {day.closed ? "Öffnen" : "Schliessen"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="delivery-title">
        <h2 id="delivery-title" className="text-base font-bold">
          Lieferung
        </h2>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Liefergebühr (CHF)</span>
          <input
            inputMode="decimal"
            value={fee}
            onChange={(e) => {
              setFee(e.target.value);
              setSaved(false);
            }}
            placeholder="z. B. 3.00"
            className="min-h-12 rounded-xl border border-gray-300 px-4 text-base"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Mindestbestellwert (CHF)</span>
          <input
            inputMode="decimal"
            value={minOrder}
            onChange={(e) => {
              setMinOrder(e.target.value);
              setSaved(false);
            }}
            placeholder="z. B. 25.00"
            className="min-h-12 rounded-xl border border-gray-300 px-4 text-base"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Liefergebiete</span>
          <span className="text-xs text-gray-500">
            PLZ oder Ortsnamen, getrennt durch Komma. Leer lassen, um überall zu liefern.
          </span>
          <input
            value={zones}
            onChange={(e) => {
              setZones(e.target.value);
              setSaved(false);
            }}
            maxLength={300}
            placeholder="8001, 8002, Zürich Altstetten"
            className="min-h-12 rounded-xl border border-gray-300 px-4 text-base"
          />
        </label>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && !error && <p className="text-sm text-green-600">Gespeichert.</p>}

      <button
        type="submit"
        disabled={saving}
        className="min-h-12 rounded-xl bg-orange-500 text-white font-black text-base disabled:opacity-60"
      >
        {saving ? "Wird gespeichert..." : "Speichern"}
      </button>
    </form>
  );
}
