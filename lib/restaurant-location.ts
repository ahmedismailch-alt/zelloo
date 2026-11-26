export type RestaurantLocation = {
  city: string | null;
  address: string | null;
};

export const SITE_URL = "https://zelloo.ch";

function readText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

export function readCity(value: unknown): string | null {
  return readText(value, 60);
}

export function readAddress(value: unknown): string | null {
  return readText(value, 120);
}

export function citySlug(city: string): string {
  return city
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function restaurantUrl(id: string | number): string {
  return `${SITE_URL}/r/${id}`;
}
