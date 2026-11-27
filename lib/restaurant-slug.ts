import { getSupabaseAdmin } from "./supabase-server";
import { citySlug } from "./restaurant-location";

const MAX_SLUG_LENGTH = 60;

export function isNumericRestaurantId(value: string): boolean {
  return /^\d+$/.test(value);
}

function buildSlug(...parts: Array<string | null | undefined>): string {
  const joined = parts.filter(Boolean).join(" ");
  const slug = citySlug(joined).slice(0, MAX_SLUG_LENGTH).replace(/-+$/g, "");
  return /[a-z]/.test(slug) ? slug : "restaurant";
}

// Returns null when the slug column does not exist yet or nothing matches.
export async function findRestaurantIdBySlug(
  slug: string
): Promise<string | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("restaurants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return String(data.id);
}

async function slugIsTaken(slug: string): Promise<boolean> {
  const { data } = await getSupabaseAdmin()
    .from("restaurants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  return Boolean(data);
}

// Reads the restaurant's slug and creates a stable one on first visit.
// Returns null when the slug column does not exist yet, so the old links keep working.
export async function ensureRestaurantSlug(
  restaurantId: string
): Promise<string | null> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("restaurants")
    .select("name, city, slug")
    .eq("id", restaurantId)
    .maybeSingle();
  if (error || !data) return null;

  const existing = typeof data.slug === "string" ? data.slug.trim() : "";
  if (existing) return existing;

  const name = typeof data.name === "string" ? data.name : "";
  const city = typeof data.city === "string" ? data.city : "";

  const candidates = [
    buildSlug(name),
    buildSlug(name, city),
    ...Array.from({ length: 5 }, (_, index) =>
      buildSlug(name, city, String(index + 2))
    ),
  ];

  for (const candidate of candidates) {
    if (await slugIsTaken(candidate)) continue;
    const { error: updateError } = await admin
      .from("restaurants")
      .update({ slug: candidate })
      .eq("id", restaurantId)
      .is("slug", null);
    if (!updateError) return candidate;
  }
  return null;
}
