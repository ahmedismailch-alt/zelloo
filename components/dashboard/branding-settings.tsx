"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  BRAND_COLORS,
  readBrandColor,
  readGoogleReviewUrl,
  readLogoUrl,
  readableTextColor,
} from "../../lib/branding";

const MAX_LOGO_SIDE = 512;

async function shrinkLogo(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_LOGO_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    return blob ? new File([blob], "logo.png", { type: "image/png" }) : file;
  } catch {
    return file;
  }
}

export function BrandingSettings({
  restaurantId,
}: {
  restaurantId: number | string;
}) {
  const [available, setAvailable] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [brandColor, setBrandColor] = useState<string | null>(null);
  const [googleAvailable, setGoogleAvailable] = useState(false);
  const [googleSaved, setGoogleSaved] = useState("");
  const [googleDraft, setGoogleDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error: readError } = await supabase
        .from("restaurants")
        .select("logo_url, brand_color")
        .eq("id", restaurantId)
        .maybeSingle();

      // The columns may not exist yet; keep the card hidden.
      if (cancelled || readError || !data) return;
      setLogoUrl(readLogoUrl(data.logo_url));
      setBrandColor(readBrandColor(data.brand_color));
      setAvailable(true);

      // Separate read: a missing google_review_url column must not hide the card.
      const { data: google, error: googleError } = await supabase
        .from("restaurants")
        .select("google_review_url")
        .eq("id", restaurantId)
        .maybeSingle();

      if (cancelled || googleError || !google) return;
      const url = readGoogleReviewUrl(google.google_review_url) ?? "";
      setGoogleSaved(url);
      setGoogleDraft(url);
      setGoogleAvailable(true);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  async function save(change: {
    logoUrl?: string | null;
    brandColor?: string | null;
    googleReviewUrl?: string | null;
  }) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("Nicht angemeldet.");

    const response = await fetch("/api/restaurant-branding", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(change),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.error || "Speichern fehlgeschlagen.");
    }
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await action();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  function handleLogoPicked(file: File | undefined) {
    if (!file) return;
    void run(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Nicht angemeldet.");

      const formData = new FormData();
      formData.append("image", await shrinkLogo(file));

      const response = await fetch("/api/menu-image-upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || typeof data?.url !== "string") {
        throw new Error(data?.error || "Logo konnte nicht hochgeladen werden.");
      }

      await save({ logoUrl: data.url });
      setLogoUrl(data.url);
    });
    if (fileInput.current) fileInput.current.value = "";
  }

  function handleLogoRemove() {
    void run(async () => {
      await save({ logoUrl: null });
      setLogoUrl(null);
    });
  }

  function handleColor(hex: string | null) {
    void run(async () => {
      await save({ brandColor: hex });
      setBrandColor(hex);
    });
  }

  function handleGoogleSave(next: string) {
    void run(async () => {
      const value = next.trim();
      await save({ googleReviewUrl: value || null });
      setGoogleSaved(value);
      setGoogleDraft(value);
    });
  }

  if (!available) return null;

  return (
    <section
      aria-labelledby="branding-title"
      className="bg-white border rounded-2xl p-4 flex flex-col gap-4 mt-4"
    >
      <div className="flex flex-col gap-1">
        <h2 id="branding-title" className="text-base font-bold">
          Logo und Farbe
        </h2>
        <p className="text-xs text-gray-500">
          Ihr Logo und Ihre Farbe erscheinen auf der Bestellseite Ihrer Kunden.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="size-16 shrink-0 overflow-hidden rounded-xl border border-gray-300 bg-gray-50 flex items-center justify-center">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Ihr Logo" className="size-full object-contain" />
          ) : (
            <span className="text-xs text-gray-500">Kein Logo</span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            tabIndex={-1}
            aria-label="Logo auswählen"
            onChange={(e) => handleLogoPicked(e.target.files?.[0])}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => fileInput.current?.click()}
            className="min-h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm font-bold disabled:opacity-60"
          >
            {logoUrl ? "Logo ändern" : "Logo hochladen"}
          </button>
          {logoUrl && (
            <button
              type="button"
              disabled={busy}
              onClick={handleLogoRemove}
              className="min-h-11 rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-600 disabled:opacity-60"
            >
              Logo entfernen
            </button>
          )}
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold mb-1">Farbe</legend>
        <div className="flex flex-wrap gap-3">
          {BRAND_COLORS.map((color) => {
            const active = brandColor === color.hex;
            return (
              <button
                key={color.hex}
                type="button"
                disabled={busy}
                onClick={() => handleColor(color.hex)}
                aria-label={color.label}
                aria-pressed={active}
                style={{
                  backgroundColor: color.hex,
                  color: readableTextColor(color.hex),
                }}
                className={`size-11 rounded-full text-lg font-black flex items-center justify-center disabled:opacity-60 ${
                  active ? "ring-2 ring-offset-2 ring-black" : ""
                }`}
              >
                {active ? "\u2713" : ""}
              </button>
            );
          })}
        </div>
        {brandColor && (
          <button
            type="button"
            disabled={busy}
            onClick={() => handleColor(null)}
            className="self-start min-h-11 text-sm font-semibold text-gray-600 underline disabled:opacity-60"
          >
            Standardfarbe verwenden
          </button>
        )}
      </fieldset>

      {googleAvailable && (
        <div className="flex flex-col gap-2">
          <label htmlFor="google-review-url" className="text-sm font-semibold">
            Google-Bewertungslink
          </label>
          <p className="text-xs text-gray-500">
            Kunden sehen nach der Bestellung den Button &quot;Auch auf Google
            bewerten&quot;. Den Link finden Sie in Ihrem Google Business Profil
            unter &quot;Bewertungen einholen&quot; (beginnt mit https://g.page/r/).
          </p>
          <input
            id="google-review-url"
            type="url"
            inputMode="url"
            autoComplete="off"
            placeholder="https://g.page/r/..."
            value={googleDraft}
            onChange={(e) => setGoogleDraft(e.target.value)}
            className="min-h-11 rounded-xl border border-gray-300 bg-white px-4 text-base"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy || googleDraft.trim() === googleSaved}
              onClick={() => handleGoogleSave(googleDraft)}
              className="min-h-11 flex-1 rounded-xl bg-black px-4 text-sm font-bold text-white disabled:opacity-40"
            >
              Link speichern
            </button>
            {googleSaved && (
              <button
                type="button"
                disabled={busy}
                onClick={() => handleGoogleSave("")}
                className="min-h-11 rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-600 disabled:opacity-60"
              >
                Entfernen
              </button>
            )}
          </div>
        </div>
      )}

      <p role="status" className="text-sm min-h-5">
        {busy && <span className="text-gray-500">Wird gespeichert...</span>}
        {!busy && error && <span className="text-red-600">{error}</span>}
        {!busy && !error && saved && (
          <span className="text-green-600">Gespeichert.</span>
        )}
      </p>
    </section>
  );
}
