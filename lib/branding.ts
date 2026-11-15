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
};

export function readBrandColor(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = BRAND_COLORS.find((color) => color.hex === value.toLowerCase());
  return match ? match.hex : null;
}

export function readLogoUrl(value: unknown): string | null {
  return typeof value === "string" && /^https:\/\//.test(value) ? value : null;
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
