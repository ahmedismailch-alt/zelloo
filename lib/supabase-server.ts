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
    .select("id, name")
    .eq("id", restaurantId)
    .maybeSingle();

  if (error) throw error;
  return data as { id: number | string; name: string } | null;
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
