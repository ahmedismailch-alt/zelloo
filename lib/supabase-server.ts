import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseOptionGroups, type OptionGroup } from "./menu-options";
import {
  DEFAULT_SETTINGS,
  canOrder,
  getAvailability,
  parseOpeningHours,
  type Availability,
  type RestaurantSettings,
} from "./restaurant-settings";

// Only Zelloo's own account may use admin-only endpoints.
export const ADMIN_EMAIL = "ahmed.ismail.ch@gmail.com";

type AdminAuthResult =
  | { ok: true; supabase: ReturnType<typeof getSupabaseAdmin>; userId: string }
  | { ok: false; response: NextResponse };

export async function requireAdmin(request: Request): Promise<AdminAuthResult> {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 }),
    };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 }),
    };
  }

  if (data.user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Kein Zugriff." }, { status: 403 }),
    };
  }

  return { ok: true, supabase, userId: data.user.id };
}

export type PublicMenuItem = {
  id: string;
  name: string;
  category: string | null;
  subcategory: string | null;
  description: string | null;
  priceCents: number;
  nameAr: string | null;
  imageUrl: string | null;
  options: OptionGroup[];
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

export type RestaurantRecord = {
  id: number | string;
  name: string;
  phone: string | null;
  loyalty_enabled: boolean | null;
  loyalty_target: number | null;
  loyalty_reward: string | null;
};

// Falls back to loyalty-disabled if the loyalty_* columns do not exist yet.
export async function getRestaurant(restaurantId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("restaurants")
    .select("id, name, phone, loyalty_enabled, loyalty_target, loyalty_reward")
    .eq("id", restaurantId)
    .maybeSingle();

  if (error) {
    const { data: fallback, error: fallbackError } = await getSupabaseAdmin()
      .from("restaurants")
      .select("id, name, phone")
      .eq("id", restaurantId)
      .maybeSingle();
    if (fallbackError) throw fallbackError;
    return fallback
      ? {
          ...fallback,
          loyalty_enabled: false,
          loyalty_target: null,
          loyalty_reward: null,
        }
      : null;
  }
  return data as RestaurantRecord | null;
}

function readCents(value: unknown) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : 0;
}

// Falls back to progressively fewer columns so the site keeps working until
// every SQL migration has been run.
export async function getRestaurantSettings(
  restaurantId: string | number
): Promise<RestaurantSettings> {
  const supabase = getSupabaseAdmin();

  const full = await supabase
    .from("restaurants")
    .select(
      "accepting_orders, busy, opening_hours, delivery_fee_cents, delivery_min_order_cents, delivery_zones"
    )
    .eq("id", restaurantId)
    .maybeSingle();

  if (!full.error) {
    const row = full.data;
    return {
      accepting: row?.accepting_orders !== false,
      busy: row?.busy === true,
      openingHours: parseOpeningHours(row?.opening_hours),
      deliveryFeeCents: readCents(row?.delivery_fee_cents),
      deliveryMinCents: readCents(row?.delivery_min_order_cents),
      deliveryZones:
        typeof row?.delivery_zones === "string" ? row.delivery_zones : "",
    };
  }

  const basic = await supabase
    .from("restaurants")
    .select("accepting_orders")
    .eq("id", restaurantId)
    .maybeSingle();

  if (basic.error) {
    console.error("Zelloo settings unavailable:", basic.error.message);
    return DEFAULT_SETTINGS;
  }
  return { ...DEFAULT_SETTINGS, accepting: basic.data?.accepting_orders !== false };
}

export async function getOrderAvailability(
  restaurantId: string | number
): Promise<{ availability: Availability; settings: RestaurantSettings }> {
  const settings = await getRestaurantSettings(restaurantId);
  return { availability: getAvailability(settings), settings };
}

export async function isAcceptingOrders(
  restaurantId: string | number
): Promise<boolean> {
  const { availability } = await getOrderAvailability(restaurantId);
  return canOrder(availability);
}

// Counts this phone's non-cancelled orders at this restaurant (loyalty progress).
export async function getLoyaltyOrderCount(
  restaurantId: string,
  phone: string
): Promise<number> {
  const normalized = phone.trim();
  if (!normalized) return 0;

  const { count, error } = await getSupabaseAdmin()
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId)
    .eq("customer_phone", normalized)
    .neq("status", "cancelled");

  if (error) throw error;
  return count ?? 0;
}

export async function getPopularItemNames(
  restaurantId: string,
  limit = 3
): Promise<string[]> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .select("status, created_at, order_items (item_name, quantity)")
    .eq("restaurant_id", restaurantId)
    .neq("status", "cancelled")
    .gte("created_at", since);

  if (error) throw error;

  const counts = new Map<string, number>();
  for (const order of data || []) {
    for (const item of (order as { order_items: { item_name: string; quantity: number }[] | null }).order_items || []) {
      counts.set(item.item_name, (counts.get(item.item_name) || 0) + item.quantity);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => name);
}

export async function getOrderableMenu(
  restaurantId: string
): Promise<PublicMenuItem[]> {
  const baseColumns =
    "id, name, category, subcategory, description, price, is_available, name_translations, image_url";

  function query(columns: string) {
    return getSupabaseAdmin()
      .from("menu_items")
      .select(columns)
      .eq("restaurant_id", restaurantId)
      .eq("is_confirmed", true)
      .order("category", { ascending: true })
      .order("subcategory", { ascending: true })
      .order("name", { ascending: true });
  }

  // The options column may not exist until the SQL migration has been run.
  let result = await query(`${baseColumns}, options`);
  if (result.error) result = await query(baseColumns);
  if (result.error) throw result.error;

  const rows = (result.data || []) as unknown as Record<string, any>[];

  return rows
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
      subcategory: typeof item.subcategory === "string" && item.subcategory.trim() ? item.subcategory : null,
      description: item.description,
      priceCents: Math.round(Number(item.price) * 100),
      nameAr: readArabicName(item.name_translations),
      imageUrl: typeof item.image_url === "string" && item.image_url.trim() ? item.image_url : null,
      options: parseOptionGroups(item.options),
    }));
}
