"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";

const subscribeNothing = () => () => {};
const getOrigin = () => window.location.origin;
const getServerOrigin = () => "";

type Props = {
  restaurantId: number | string;
};

export function GooglePresence({ restaurantId }: Props) {
  const origin = useSyncExternalStore(subscribeNothing, getOrigin, getServerOrigin);
  const orderLink = origin
    ? `${origin}/r/${restaurantId}?utm_source=google&utm_medium=business-profile`
    : "";

  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [available, setAvailable] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error: readError } = await supabase
        .from("restaurants")
        .select("city, address")
        .eq("id", restaurantId)
        .maybeSingle();

      // The city / address columns may not exist yet; keep the form hidden.
      if (cancelled || readError || !data) return;
      setCity(data.city || "");
      setAddress(data.address || "");
      setAvailable(true);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const trimmedCity = city.trim();
    const trimmedAddress = address.trim();

    const { error: updateError } = await supabase
      .from("restaurants")
      .update({
        city: trimmedCity || null,
        address: trimmedAddress || null,
      })
      .eq("id", restaurantId);

    setSaving(false);

    if (updateError) {
      setError("Speichern fehlgeschlagen. Bitte erneut versuchen.");
      return;
    }

    setCity(trimmedCity);
    setAddress(trimmedAddress);
    setSaved(true);
  }

  async function handleCopy() {
    if (!orderLink) return;
    try {
      await navigator.clipboard.writeText(orderLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable: the link stays visible for manual copying.
    }
  }

  return (
    <section className="bg-white border rounded-2xl p-4 flex flex-col gap-4 mt-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-bold">Auf Google gefunden werden</h2>
        <p className="text-xs text-gray-500">
          Wer in Ihrer Nähe nach einem Restaurant oder Café sucht, soll Sie
          finden und direkt bestellen können.
        </p>
      </div>

      {available && (
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">Ort</span>
            <input
              type="text"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setSaved(false);
              }}
              maxLength={60}
              placeholder="z.B. Zürich"
              autoComplete="address-level2"
              className="min-h-12 rounded-xl border border-gray-300 px-4 text-base"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">Adresse</span>
            <input
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setSaved(false);
              }}
              maxLength={120}
              placeholder="z.B. Langstrasse 12, 8004 Zürich"
              autoComplete="street-address"
              className="min-h-12 rounded-xl border border-gray-300 px-4 text-base"
            />
          </label>

          <p className="text-xs text-gray-500">
            Mit einem Ort erscheint Ihre Bestellseite besser in der Google-Suche
            und im öffentlichen Zelloo-Verzeichnis. Leer lassen, um beides zu
            vermeiden.
          </p>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {saved && !error && (
            <p className="text-sm text-green-600">Gespeichert.</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="min-h-12 rounded-xl bg-orange-500 text-white font-black text-base disabled:opacity-60"
          >
            {saving ? "Wird gespeichert..." : "Speichern"}
          </button>
        </form>
      )}

      <div className="flex flex-col gap-3 border-t border-gray-200 pt-4">
        <h3 className="text-sm font-bold">Bestell-Link für Google Maps</h3>
        <div className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm break-all">
          {orderLink || "..."}
        </div>
        <button
          type="button"
          onClick={() => void handleCopy()}
          disabled={!orderLink}
          className="min-h-12 rounded-xl border border-gray-300 bg-white font-black text-base disabled:opacity-60"
        >
          {copied ? "Kopiert!" : "Link kopieren"}
        </button>

        <ol className="list-decimal pl-5 flex flex-col gap-1.5 text-sm text-gray-700">
          <li>
            Öffnen Sie Ihr kostenloses Google-Unternehmensprofil auf{" "}
            <a
              href="https://business.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-orange-600 underline"
            >
              business.google.com
            </a>
            . Falls Sie noch keines haben, legen Sie es dort an.
          </li>
          <li>Wählen Sie «Profil bearbeiten».</li>
          <li>
            Fügen Sie den Link oben bei «Bestell-Link» und «Speisekarte» ein
            und speichern Sie.
          </li>
          <li>
            Bis der Button in Google Maps erscheint, kann es einige Tage dauern.
          </li>
        </ol>
      </div>
    </section>
  );
}
