import { ADMIN_EMAIL, getSupabaseAdmin } from "./supabase-server";
import { computeAccess } from "./subscription";
import {
  citySlug,
  readAddress,
  readCity,
  type RestaurantLocation,
} from "./restaurant-location";

export type DirectoryRestaurant = {
  id: string;
  name: string;
  city: string;
  citySlug: string;
  address: string | null;
};

// Returns empty values if the city / address columns do not exist yet.
export async function getRestaurantLocation(
  restaurantId: string | number
): Promise<RestaurantLocation> {
  const { data, error } = await getSupabaseAdmin()
    .from("restaurants")
    .select("city, address")
    .eq("id", restaurantId)
    .maybeSingle();

  if (error || !data) return { city: null, address: null };
  return { city: readCity(data.city), address: readAddress(data.address) };
}

// Only restaurants that entered a city, are not demos and may still take orders.
export async function listDirectoryRestaurants(): Promise<DirectoryRestaurant[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("restaurants")
    .select(
      "id, name, city, address, subscription_status, trial_ends_at, is_demo, email"
    )
    .not("city", "is", null)
    .order("name", { ascending: true })
    .limit(1000);

  if (error || !data) return [];

  const restaurants: DirectoryRestaurant[] = [];
  for (const row of data) {
    const city = readCity(row.city);
    const name = typeof row.name === "string" ? row.name.trim() : "";
    if (!city || !name) continue;
    if (row.is_demo === true) continue;
    if (!computeAccess(row, ADMIN_EMAIL).allowed) continue;
    if (row.email?.trim().toLowerCase() === ADMIN_EMAIL) continue;

    restaurants.push({
      id: String(row.id),
      name,
      city,
      citySlug: citySlug(city),
      address: readAddress(row.address),
    });
  }
  return restaurants;
}
