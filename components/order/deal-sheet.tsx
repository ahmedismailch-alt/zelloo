"use client";

import { useEffect, useId, useState } from "react";
import { getAuthHeaders } from "../../lib/use-deal-owner";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function DealSheet({ open, onClose, onCreated }: Props) {
  const formId = useId();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function reset() {
    setName("");
    setPrice("");
    setComparePrice("");
    setImageUrl("");
    setError("");
  }

  async function uploadImage(file: File) {
    setError("");
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Das Bild ist zu gross (max. 5 MB).");
      return;
    }
    const headers = await getAuthHeaders();
    if (!headers) {
      setError("Bitte melden Sie sich erneut an.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    const response = await fetch("/api/menu-image-upload", {
      method: "POST",
      headers,
      body: formData,
    }).catch(() => null);
    const json = response
      ? ((await response.json().catch(() => null)) as { url?: string; error?: string } | null)
      : null;
    setUploading(false);
    if (!response?.ok || !json?.url) {
      setError(json?.error || "Bild konnte nicht hochgeladen werden.");
      return;
    }
    setImageUrl(json.url);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (saving || uploading) return;
    setError("");

    const headers = await getAuthHeaders();
    if (!headers) {
      setError("Bitte melden Sie sich erneut an.");
      return;
    }

    setSaving(true);
    const response = await fetch("/api/deal", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ name, price, comparePrice, imageUrl }),
    }).catch(() => null);
    const json = response
      ? ((await response.json().catch(() => null)) as { error?: string } | null)
      : null;
    setSaving(false);

    if (!response?.ok) {
      setError(json?.error || "Angebot konnte nicht gespeichert werden.");
      return;
    }

    reset();
    onCreated();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-title`}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id={`${formId}-title`} className="text-lg font-black">
            Neues Angebot
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schliessen"
            className="flex size-11 items-center justify-center rounded-full bg-gray-100 text-xl font-bold"
          >
            {"×"}
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-bold">Name des Angebots</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="z.B. Kaffee + Croissant"
              maxLength={80}
              required
              autoFocus
              className="h-12 rounded-xl border bg-white px-4 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-bold">Angebotspreis (CHF)</span>
              <input
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="6.50"
                required
                className="h-12 rounded-xl border bg-white px-4 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-bold">Normaler Preis</span>
              <input
                type="text"
                inputMode="decimal"
                value={comparePrice}
                onChange={(event) => setComparePrice(event.target.value)}
                placeholder="7.50 (optional)"
                className="h-12 rounded-xl border bg-white px-4 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </label>
          </div>
          <p className="-mt-2 text-xs text-gray-500">
            Der normale Preis erscheint durchgestrichen. Bezahlt wird der Angebotspreis.
          </p>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold">Foto (optional)</span>
            {imageUrl ? (
              <div className="flex items-center gap-3">
                <img
                  src={imageUrl}
                  alt="Vorschau des Angebots"
                  className="size-20 rounded-xl border object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="min-h-11 rounded-xl border px-4 text-sm font-bold"
                >
                  Foto entfernen
                </button>
              </div>
            ) : (
              <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-dashed px-4 text-sm font-bold text-gray-600">
                {uploading ? "Wird hochgeladen..." : "Foto aufnehmen oder auswählen"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={uploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) void uploadImage(file);
                  }}
                />
              </label>
            )}
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving || uploading || !name.trim() || !price.trim()}
            className="min-h-12 rounded-2xl bg-black px-4 font-black text-white disabled:opacity-50"
          >
            {saving ? "Wird gespeichert..." : "Angebot veröffentlichen"}
          </button>
        </form>
      </div>
    </div>
  );
}
