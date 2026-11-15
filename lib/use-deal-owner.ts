"use client";

import useSWR from "swr";
import { supabase } from "./supabase";

export async function getAuthHeaders(): Promise<Record<string, string> | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;
  return { Authorization: `Bearer ${session.access_token}` };
}

/** True only when the visitor is logged in as the owner of this restaurant. */
export function useDealOwner(restaurantId: string | undefined): boolean {
  const { data } = useSWR(
    restaurantId ? ["deal-owner", restaurantId] : null,
    async ([, id]: [string, string]) => {
      const headers = await getAuthHeaders();
      if (!headers) return false;
      const response = await fetch(`/api/deal?restaurantId=${encodeURIComponent(id)}`, {
        headers,
      });
      if (!response.ok) return false;
      const json = (await response.json()) as { owner?: boolean };
      return Boolean(json.owner);
    },
    { revalidateOnFocus: false }
  );
  return Boolean(data);
}
