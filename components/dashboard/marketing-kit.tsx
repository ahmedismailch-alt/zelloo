"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { QRCodeCanvas } from "qrcode.react";
import { drawTemplate, TEMPLATES, type TemplateId } from "@/lib/marketing-templates";

type Props = {
  restaurantName: string;
  restaurantLink: string;
  logoUrl: string | null;
  brandColor: string | null;
};

const DEFAULT_BRAND = "#f97316";

function loadLogo(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

const PDF_PAGE_MM: Record<string, [number, number]> = {
  A6: [105, 148],
  A4: [210, 297],
};

function subscribeNever() {
  return () => {};
}

function isTouchDevice() {
  return window.matchMedia("(pointer: coarse)").matches;
}

function canShareImageFile() {
  if (typeof navigator.canShare !== "function") return false;
  const probe = new File([""], "probe.png", { type: "image/png" });
  return navigator.canShare({ files: [probe] });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

export function MarketingKit({
  restaurantName,
  restaurantLink,
  logoUrl,
  brandColor,
}: Props) {
  const [templateId, setTemplateId] = useState<TemplateId>("table");
  const [tableInput, setTableInput] = useState("");
  const [poweredBy, setPoweredBy] = useState(true);
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [logoState, setLogoState] = useState<"idle" | "loading" | "failed">(
    logoUrl ? "loading" : "idle"
  );
  const [copied, setCopied] = useState(false);
  const [printSrc, setPrintSrc] = useState<string | null>(null);
  const [busy, setBusy] = useState<"pdf" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saveSheetSrc, setSaveSheetSrc] = useState<string | null>(null);
  const shareFileRef = useRef<File | null>(null);

  const isTouch = useSyncExternalStore(subscribeNever, isTouchDevice, () => false);
  const canShare = useSyncExternalStore(subscribeNever, canShareImageFile, () => false);

  const previewRef = useRef<HTMLCanvasElement>(null);
  const qrWrapperRef = useRef<HTMLDivElement>(null);

  const template = TEMPLATES.find((item) => item.id === templateId) ?? TEMPLATES[0];

  const parsedTable = Number.parseInt(tableInput, 10);
  const tableNumber =
    templateId === "table" && Number.isFinite(parsedTable) && parsedTable > 0
      ? Math.min(parsedTable, 999)
      : null;

  const qrUrl =
    tableNumber !== null ? `${restaurantLink}?table=${tableNumber}` : restaurantLink;
  const displayUrl = restaurantLink.replace(/^https?:\/\//, "");

  useEffect(() => {
    if (!logoUrl) return;
    let cancelled = false;
    void loadLogo(logoUrl).then((image) => {
      if (cancelled) return;
      setLogo(image);
      setLogoState(image ? "idle" : "failed");
    });
    return () => {
      cancelled = true;
    };
  }, [logoUrl]);

  const render = useCallback(
    async (canvas: HTMLCanvasElement) => {
      await document.fonts.ready;
      const qr = qrWrapperRef.current?.querySelector("canvas") ?? null;
      drawTemplate(canvas, templateId, {
        name: restaurantName,
        brandColor: brandColor ?? DEFAULT_BRAND,
        logo,
        qr,
        displayUrl,
        tableNumber,
        poweredBy,
        fontFamily: getComputedStyle(document.body).fontFamily || "sans-serif",
      });
    },
    [templateId, restaurantName, brandColor, logo, displayUrl, tableNumber, poweredBy]
  );

  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    let cancelled = false;
    shareFileRef.current = null;
    const filename = template.filename;
    void render(canvas).then(async () => {
      const blob = await canvasToBlob(canvas);
      if (!cancelled && blob) {
        shareFileRef.current = new File([blob], filename, { type: "image/png" });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [render, qrUrl, template.filename]);

  useEffect(() => {
    if (!saveSheetSrc) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSaveSheetSrc(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saveSheetSrc]);

  function download() {
    const canvas = previewRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = template.filename;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  }

  function openSaveSheet() {
    const canvas = previewRef.current;
    if (!canvas) return;
    setSaveSheetSrc(canvas.toDataURL("image/png"));
  }

  function share() {
    const file = shareFileRef.current;
    setActionError(null);
    if (!file) {
      openSaveSheet();
      return;
    }
    navigator.share({ files: [file], title: restaurantName }).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error(error);
      openSaveSheet();
    });
  }

  async function savePdf() {
    const canvas = previewRef.current;
    if (!canvas) return;
    setActionError(null);
    setBusy("pdf");
    try {
      const { jsPDF } = await import("jspdf");
      const [pageWidth, pageHeight] = PDF_PAGE_MM[template.pageSize ?? "A4"] ?? PDF_PAGE_MM.A4;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pageWidth, pageHeight],
      });
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pageWidth, pageHeight);
      pdf.save(template.filename.replace(/\.png$/, ".pdf"));
    } catch (error) {
      console.error(error);
      setActionError("Das PDF konnte nicht erstellt werden. Bitte versuchen Sie es erneut.");
    } finally {
      setBusy(null);
    }
  }

  function print() {
    const canvas = previewRef.current;
    if (!canvas) return;
    setPrintSrc(canvas.toDataURL("image/png"));
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => window.print());
    });
  }

  const caption = `Bestellt jetzt direkt bei uns, ohne App und ohne Wartezeit: ${restaurantLink}`;

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error(error);
    }
  }

  const isPortraitTall = template.height / template.width > 1.2;

  return (
    <>
      <div className="print:hidden">
        <div
          role="tablist"
          aria-label="Vorlage wählen"
          className="mt-5 grid grid-cols-2 gap-2"
        >
          {TEMPLATES.map((item) => {
            const active = item.id === templateId;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTemplateId(item.id)}
                className={`min-h-14 rounded-xl border px-3 py-2 text-left transition-colors ${
                  active
                    ? "border-orange-500 bg-orange-50 text-black"
                    : "border-gray-200 bg-white text-gray-700"
                }`}
              >
                <span className="block text-sm font-bold leading-tight">
                  {item.label}
                </span>
                <span className="block text-xs text-gray-500">{item.size}</span>
              </button>
            );
          })}
        </div>

        <section className="mt-4 rounded-2xl border bg-white p-4">
          <div
            className={`mx-auto overflow-hidden rounded-xl border bg-gray-100 ${
              isPortraitTall ? "max-w-72" : "max-w-sm"
            }`}
          >
            <canvas
              ref={previewRef}
              role="img"
              aria-label={`Vorschau: ${template.label}`}
              className="block h-auto w-full"
            />
          </div>

          {templateId === "table" && (
            <div className="mt-4">
              <label htmlFor="kit-table" className="text-sm font-bold">
                Tischnummer (optional)
              </label>
              <p className="mt-0.5 text-xs text-gray-500">
                Leer lassen für einen allgemeinen Aufsteller.
              </p>
              <input
                id="kit-table"
                type="number"
                inputMode="numeric"
                min={1}
                max={999}
                value={tableInput}
                onChange={(event) => setTableInput(event.target.value)}
                className="mt-2 min-h-11 w-28 rounded-xl border px-3 text-base font-bold"
              />
            </div>
          )}

          <label className="mt-4 flex min-h-11 items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={poweredBy}
              onChange={(event) => setPoweredBy(event.target.checked)}
              className="h-5 w-5 accent-orange-500"
            />
            <span>{"„Powered by zelloo.ch“ anzeigen"}</span>
          </label>

          {logoState === "failed" && (
            <p role="status" className="mt-2 text-xs text-amber-700">
              Das Logo konnte nicht geladen werden. Die Vorlage wird ohne Logo erstellt.
            </p>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {isTouch ? (
              <button
                type="button"
                onClick={canShare ? share : openSaveSheet}
                className="min-h-12 flex-1 rounded-xl bg-orange-500 px-4 font-bold text-black transition-colors hover:bg-orange-400"
              >
                {canShare ? "Teilen / Speichern" : "Bild speichern"}
              </button>
            ) : (
              <button
                type="button"
                onClick={download}
                className="min-h-12 flex-1 rounded-xl bg-orange-500 px-4 font-bold text-black transition-colors hover:bg-orange-400"
              >
                Als Bild speichern
              </button>
            )}
            {template.printable &&
              (isTouch ? (
                <button
                  type="button"
                  onClick={() => void savePdf()}
                  disabled={busy !== null}
                  className="min-h-12 flex-1 rounded-xl border border-gray-300 px-4 font-semibold disabled:opacity-60"
                >
                  {busy === "pdf" ? "Wird erstellt…" : `Als PDF speichern (${template.size})`}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={print}
                  className="min-h-12 flex-1 rounded-xl border border-gray-300 px-4 font-semibold"
                >
                  {`Drucken (${template.size})`}
                </button>
              ))}
          </div>
          {actionError && (
            <p role="alert" className="mt-2 text-xs text-red-700">
              {actionError}
            </p>
          )}
          <p className="mt-3 text-xs leading-relaxed text-gray-500">
            {template.printable
              ? isTouch
                ? "Das PDF können Sie an eine Druckerei senden oder von einem Gerät mit Drucker ausdrucken. Farben und Logo stammen aus Ihren Einstellungen."
                : "Beim Drucken Seitengrösse und „Originalgrösse“ prüfen. Farben und Logo stammen aus Ihren Einstellungen."
              : "Teilen Sie das Bild direkt auf Instagram, Facebook oder WhatsApp. Ein Bild selbst ist nicht klickbar: Fügen Sie in der Instagram-Story den Sticker „Link“ ein und kopieren Sie den Text unten. Auf Facebook und TikTok gehört der Link in die Beschreibung."}
          </p>
          {isTouch && (
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              {canShare
                ? "Tipp: Auf dem iPhone wählen Sie in der Auswahl „Bild sichern“, um das Bild in Ihren Fotos zu speichern."
                : "Das Bild öffnet sich in Grossansicht. Halten Sie es gedrückt, um es in Ihren Fotos zu speichern."}
            </p>
          )}
        </section>

        <section className="mt-4 mb-6 rounded-2xl border bg-white p-4">
          <h2 className="text-lg font-black">Text zum Kopieren</h2>
          <p className="mt-1 text-sm text-gray-500">
            Für Beschreibung, Story oder Nachricht.
          </p>
          <p className="mt-3 break-words rounded-xl bg-gray-50 p-3 text-sm leading-relaxed">
            {caption}
          </p>
          <button
            type="button"
            onClick={() => void copyCaption()}
            className="mt-3 min-h-11 w-full rounded-xl bg-black px-4 font-bold text-white"
          >
            {copied ? "Kopiert" : "Text kopieren"}
          </button>
          <p role="status" className="sr-only">
            {copied ? "Text kopiert" : ""}
          </p>
        </section>

        <div ref={qrWrapperRef} aria-hidden="true" className="hidden">
          <QRCodeCanvas value={qrUrl} size={1024} marginSize={0} level="M" />
        </div>

        {saveSheetSrc && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Bild speichern"
            className="fixed inset-0 z-50 flex flex-col items-center gap-4 overflow-y-auto bg-black/90 p-4"
          >
            <p className="mt-2 max-w-sm text-center text-base font-bold leading-relaxed text-white text-balance">
              Halten Sie das Bild gedrückt und wählen Sie „Zu Fotos hinzufügen“ oder „Bild sichern“.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={saveSheetSrc}
              alt={`${template.label} zum Speichern`}
              className="h-auto w-full max-w-xs rounded-xl bg-white"
            />
            <button
              type="button"
              onClick={() => setSaveSheetSrc(null)}
              className="mb-4 min-h-12 w-full max-w-xs rounded-xl bg-white px-4 font-bold text-black"
            >
              Schliessen
            </button>
          </div>
        )}
      </div>

      {printSrc && (
        <div className="hidden print:block">
          <style>{`@page { size: ${template.pageSize ?? "A4"}; margin: 0 }`}</style>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={printSrc}
            alt=""
            className="block h-screen w-full object-contain"
          />
        </div>
      )}
    </>
  );
}
