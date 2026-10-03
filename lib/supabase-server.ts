import { createClient } from "@supabase/supabase-js";

export type PublicMenuItem = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  priceCents: number;
  nameAr: string | null;
};

export function readArabicName(translations: unknown): string | null {
  if (!translations || typeof translations !== "object") return null;
  const value = (translations as Record<string, unknown>).ar;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export type CategoryTranslations = Record<string, string>;

export function readCategoryTranslations(value: unknown): CategoryTranslations {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: CategoryTranslations = {};
  for (const [key, ar] of Object.entries(value as Record<string, unknown>)) {
    if (typeof ar === "string" && ar.trim()) result[key] = ar.trim();
  }
  return result;
}

// Returns {} if the category_translations column does not exist yet.
export async function getCategoryTranslations(
  restaurantId: string | number
): Promise<CategoryTranslations> {
  const { data, error } = await getSupabaseAdmin()
    .from("restaurants")
    .select("category_translations")
    .eq("id", restaurantId)
    .maybeSingle();

  if (error) {
    console.error("Zelloo category translations unavailable:", error.message);
    return {};
  }
  return readCategoryTranslations(data?.category_translations);
}

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error("Supabase server configuration missing.");
  }

  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isValidRestaurantId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9-]{1,64}$/.test(value);
}

export function normalizeTable(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^[A-Za-z0-9-]{1,10}$/.test(trimmed) ? trimmed : null;
}

export async function getRestaurant(restaurantId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("restaurants")
    .select("id, name, phone")
    .eq("id", restaurantId)
    .maybeSingle();

  if (error) throw error;
  return data as { id: number | string; name: string; phone: string | null } | null;
}

export async function getOrderableMenu(
  restaurantId: string
): Promise<PublicMenuItem[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("menu_items")
    .select("id, name, category, description, price, is_available, name_translations")
    .eq("restaurant_id", restaurantId)
    .eq("is_confirmed", true)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;

  return (data || [])
    .filter(
      (item) =>
        item.is_available !== false &&
        typeof item.price === "number" &&
        item.price > 0
    )
    .map((item) => ({
      id: String(item.id),
      name: item.name,
      category: item.category,
      description: item.description,
      priceCents: Math.round(Number(item.price) * 100),
      nameAr: readArabicName(item.name_translations),
    }));
}
