import { getSupabaseAdmin } from "./supabase-server";
import { ABSOLUTE_MAX_PARTY, DEFAULT_MAX_PARTY } from "./reservations";

export type ReservationConfig = { enabled: boolean; maxParty: number };

// Disabled until the reservations SQL migration has been run.
export async function getReservationConfig(
  restaurantId: string | number
): Promise<ReservationConfig> {
  const { data, error } = await getSupabaseAdmin()
    .from("restaurants")
    .select("reservations_enabled, reservation_max_party")
    .eq("id", restaurantId)
    .maybeSingle();

  if (error || !data) return { enabled: false, maxParty: DEFAULT_MAX_PARTY };

  const max = Number(data.reservation_max_party);
  return {
    enabled: data.reservations_enabled === true,
    maxParty:
      Number.isInteger(max) && max >= 1 && max <= ABSOLUTE_MAX_PARTY
        ? max
        : DEFAULT_MAX_PARTY,
  };
}
