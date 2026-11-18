export const BRAND_COLORS = [
  { hex: "#f97316", label: "Orange" },
  { hex: "#dc2626", label: "Rot" },
  { hex: "#16a34a", label: "Grün" },
  { hex: "#2563eb", label: "Blau" },
  { hex: "#0d9488", label: "Türkis" },
  { hex: "#eab308", label: "Gelb" },
] as const;

export type Branding = {
  logoUrl: string | null;
  brandColor: string | null;
  themeBg: string | null;
  themeText: string | null;
};

export const THEME_PRESETS = [
  { label: "Schwarz & Gold", bg: "#0a0a0a", text: "#f5f5f5", accent: "#d4af37" },
  { label: "Nachtblau", bg: "#0b1a2e", text: "#f1f5f9", accent: "#38bdf8" },
  { label: "Waldgrün", bg: "#0f2a22", text: "#ecfdf5", accent: "#34d399" },
  { label: "Beige", bg: "#f5efe6", text: "#2b2118", accent: "#b45309" },
  { label: "Weiss", bg: "#ffffff", text: "#111111", accent: "#f97316" },
] as const;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

// Accepts any #rrggbb value so owners can pick their own colors.
export function readHexColor(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return HEX_COLOR.test(value) ? value.toLowerCase() : null;
}

export function readBrandColor(value: unknown): string | null {
  return readHexColor(value);
}

function relativeLuminance(hex: string): number {
  const value = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((start) => {
    const channel = parseInt(value.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x
  );
  return (light + 0.05) / (dark + 0.05);
}

export function readLogoUrl(value: unknown): string | null {
  return typeof value === "string" && /^https:\/\//.test(value) ? value : null;
}

const GOOGLE_REVIEW_HOSTS = [
  "g.page",
  "search.google.com",
  "www.google.com",
  "google.com",
  "maps.app.goo.gl",
  "goo.gl",
  "share.google",
];

const MAX_REVIEW_URL_LENGTH = 500;

// Accepts only https links on Google hosts, so no other site can be linked.
export function readGoogleReviewUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_REVIEW_URL_LENGTH) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") return null;
    return GOOGLE_REVIEW_HOSTS.includes(url.hostname.toLowerCase())
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

// Picks black or white text, whichever contrasts better with the background.
export function readableTextColor(hex: string): string {
  const value = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((start) => {
    const channel = parseInt(value.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.4 ? "#000000" : "#ffffff";
}
