"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  BRAND_COLORS,
  THEME_PRESETS,
  contrastRatio,
  readBrandColor,
  readGoogleReviewUrl,
  readHexColor,
  readLogoUrl,
  readableTextColor,
} from "../../lib/branding";

type ThemeColors = {
  bg: string | null;
  text: string | null;
  accent: string | null;
};

const EMPTY_THEME: ThemeColors = { bg: null, text: null, accent: null };

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
  const [savedTheme, setSavedTheme] = useState<ThemeColors>(EMPTY_THEME);
  const [draftTheme, setDraftTheme] = useState<ThemeColors>(EMPTY_THEME);
  const [themeAvailable, setThemeAvailable] = useState(false);
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
      const accent = readBrandColor(data.brand_color);
      setAvailable(true);

      // Separate read: missing theme columns must not hide the card.
      const { data: theme, error: themeError } = await supabase
        .from("restaurants")
        .select("theme_bg, theme_text")
        .eq("id", restaurantId)
        .maybeSingle();

      if (cancelled) return;
      const loaded: ThemeColors = {
        bg: themeError || !theme ? null : readHexColor(theme.theme_bg),
        text: themeError || !theme ? null : readHexColor(theme.theme_text),
        accent,
      };
      setSavedTheme(loaded);
      setDraftTheme(loaded);
      setThemeAvailable(!themeError && Boolean(theme));

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
    themeBg?: string | null;
    themeText?: string | null;
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

  function handleThemeSave() {
    void run(async () => {
      await save(
        themeAvailable
          ? {
              brandColor: draftTheme.accent,
              themeBg: draftTheme.bg,
              themeText: draftTheme.text,
            }
          : { brandColor: draftTheme.accent }
      );
      setSavedTheme(draftTheme);
    });
  }

  function handleThemeReset() {
    setDraftTheme(EMPTY_THEME);
  }

  const themeDirty =
    draftTheme.bg !== savedTheme.bg ||
    draftTheme.text !== savedTheme.text ||
    draftTheme.accent !== savedTheme.accent;

  const previewBg = draftTheme.bg ?? "#f8f9fb";
  const previewText = draftTheme.text ?? "#000000";
  const previewAccent = draftTheme.accent ?? "#f97316";
  const textContrastLow =
    Boolean(draftTheme.bg && draftTheme.text) &&
    contrastRatio(previewBg, previewText) < 4.5;
  const accentContrastLow =
    Boolean(draftTheme.bg && draftTheme.accent) &&
    contrastRatio(previewBg, previewAccent) < 3;

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

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-semibold mb-1">Farben</legend>

        {themeAvailable && (
          <>
            <p className="text-xs text-gray-500">
              Wählen Sie ein Design oder stellen Sie Hintergrund, Schrift und
              Akzent selbst ein.
            </p>
            <ul className="flex flex-wrap gap-2">
              {THEME_PRESETS.map((preset) => {
                const active =
                  draftTheme.bg === preset.bg &&
                  draftTheme.text === preset.text &&
                  draftTheme.accent === preset.accent;
                return (
                  <li key={preset.label}>
                    <button
                      type="button"
                      disabled={busy}
                      aria-pressed={active}
                      onClick={() =>
                        setDraftTheme({
                          bg: preset.bg,
                          text: preset.text,
                          accent: preset.accent,
                        })
                      }
                      style={{
                        backgroundColor: preset.bg,
                        color: preset.text,
                        borderColor: preset.accent,
                      }}
                      className={`min-h-11 rounded-xl border-2 px-3 text-sm font-bold disabled:opacity-60 ${
                        active ? "ring-2 ring-offset-2 ring-black" : ""
                      }`}
                    >
                      {preset.label}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
                Hintergrund
                <input
                  type="color"
                  value={draftTheme.bg ?? "#ffffff"}
                  disabled={busy}
                  onChange={(e) =>
                    setDraftTheme((prev) => ({ ...prev, bg: e.target.value }))
                  }
                  className="h-11 w-full rounded-xl border border-gray-300 bg-white p-1"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
                Schrift
                <input
                  type="color"
                  value={draftTheme.text ?? "#000000"}
                  disabled={busy}
                  onChange={(e) =>
                    setDraftTheme((prev) => ({ ...prev, text: e.target.value }))
                  }
                  className="h-11 w-full rounded-xl border border-gray-300 bg-white p-1"
                />
              </label>
            </div>
          </>
        )}

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-gray-600">
            Akzent (Rahmen, Preise, Knöpfe)
          </span>
          <div className="flex flex-wrap items-center gap-3">
            {BRAND_COLORS.map((color) => {
              const active = draftTheme.accent === color.hex;
              return (
                <button
                  key={color.hex}
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    setDraftTheme((prev) => ({ ...prev, accent: color.hex }))
                  }
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
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <span className="sr-only">Eigene Akzentfarbe</span>
              <input
                type="color"
                aria-label="Eigene Akzentfarbe"
                value={draftTheme.accent ?? "#f97316"}
                disabled={busy}
                onChange={(e) =>
                  setDraftTheme((prev) => ({ ...prev, accent: e.target.value }))
                }
                className="h-11 w-14 rounded-xl border border-gray-300 bg-white p-1"
              />
              Eigene
            </label>
          </div>
        </div>

        {themeAvailable && (draftTheme.bg || draftTheme.text) && (
          <div
            aria-label="Vorschau"
            role="img"
            style={{ backgroundColor: previewBg, color: previewText }}
            className="flex flex-col gap-3 rounded-2xl border border-gray-300 p-4"
          >
            <p
              style={{ borderColor: previewAccent }}
              className="self-start rounded-md border px-3 py-1 text-sm font-bold uppercase"
            >
              Getränke
            </p>
            <div className="flex items-end justify-between gap-3">
              <div className="flex flex-col">
                <span className="font-bold uppercase">Cappuccino</span>
                <span className="text-sm opacity-70">Espresso, Milch</span>
              </div>
              <span style={{ color: previewAccent }} className="font-bold">
                5.00 CHF
              </span>
            </div>
          </div>
        )}

        {textContrastLow && (
          <p role="alert" className="text-sm font-semibold text-red-600">
            Schrift und Hintergrund sind zu ähnlich. Ihre Kunden können den Text
            schlecht lesen.
          </p>
        )}
        {accentContrastLow && !textContrastLow && (
          <p role="alert" className="text-sm font-semibold text-amber-700">
            Der Akzent hebt sich kaum vom Hintergrund ab.
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy || !themeDirty}
            onClick={handleThemeSave}
            className="min-h-11 flex-1 rounded-xl bg-black px-4 text-sm font-bold text-white disabled:opacity-40"
          >
            Farben speichern
          </button>
          {(draftTheme.bg || draftTheme.text || draftTheme.accent) && (
            <button
              type="button"
              disabled={busy}
              onClick={handleThemeReset}
              className="min-h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm font-bold disabled:opacity-60"
            >
              Standard
            </button>
          )}
        </div>
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
