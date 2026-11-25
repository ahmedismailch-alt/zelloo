"use client";

import { useState, useSyncExternalStore } from "react";

const subscribeNothing = () => () => {};
const getOrigin = () => window.location.origin;
const getServerOrigin = () => "";
const getCanShare = () => typeof navigator.share === "function";
const getServerCanShare = () => false;

type Props = {
  restaurantId: number | string;
  restaurantName?: string;
};

type Channel = {
  label: string;
  href: (url: string, text: string) => string;
};

const CHANNELS: Channel[] = [
  {
    label: "WhatsApp",
    href: (url, text) =>
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    label: "Telegram",
    href: (url, text) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    label: "Facebook",
    href: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    label: "SMS",
    href: (url, text) => `sms:?&body=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    label: "E-Mail",
    href: (url, text) =>
      `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text}\n${url}`)}`,
  },
];

export function ShareMenu({ restaurantId, restaurantName }: Props) {
  const [copied, setCopied] = useState(false);
  const origin = useSyncExternalStore(subscribeNothing, getOrigin, getServerOrigin);
  const canShare = useSyncExternalStore(
    subscribeNothing,
    getCanShare,
    getServerCanShare,
  );

  const url = origin ? `${origin}/r/${restaurantId}` : "";
  const text = restaurantName
    ? `Hier bestellen bei ${restaurantName}:`
    : "Hier können Sie direkt bei uns bestellen:";

  async function copyLink() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard access can be blocked; the link stays visible for manual copy.
    }
  }

  async function nativeShare() {
    if (!url) return;
    try {
      await navigator.share({ title: restaurantName, text, url });
    } catch {
      // User cancelled the share sheet.
    }
  }

  return (
    <section
      aria-labelledby="share-menu-title"
      className="bg-white border rounded-2xl p-4 flex flex-col gap-3 mt-4"
    >
      <h2 id="share-menu-title" className="text-base font-bold">
        Menü teilen
      </h2>
      <p className="text-xs text-gray-500">
        Teilen Sie den Link zu Ihrer Bestellseite überall: in WhatsApp-Status,
        Instagram-Bio, Facebook, Google-Profil oder per Nachricht. Ihre Gäste
        sehen das Menü, bevor sie bestellen.
      </p>

      <div className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm break-all min-h-12">
        {url || "Wird geladen..."}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {canShare && (
          <button
            type="button"
            onClick={() => void nativeShare()}
            disabled={!url}
            className="flex-1 min-h-12 rounded-xl bg-orange-500 text-white font-black text-base disabled:opacity-60"
          >
            Teilen
          </button>
        )}
        <button
          type="button"
          onClick={() => void copyLink()}
          disabled={!url}
          className="flex-1 min-h-12 rounded-xl border border-gray-300 bg-white font-black text-base disabled:opacity-60"
        >
          {copied ? "Kopiert!" : "Link kopieren"}
        </button>
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {CHANNELS.map((channel) => (
          <li key={channel.label}>
            <a
              href={url ? channel.href(url, text) : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!url}
              className="min-h-12 rounded-xl border border-gray-300 bg-white text-sm font-bold flex items-center justify-center"
            >
              {channel.label}
            </a>
          </li>
        ))}
      </ul>

      <p className="text-xs text-gray-500">
        Instagram und TikTok erlauben kein direktes Teilen von Links. Kopieren
        Sie den Link und fügen Sie ihn in Ihre Bio oder Story ein.
      </p>
    </section>
  );
}
