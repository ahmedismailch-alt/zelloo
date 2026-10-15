"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { supabase } from "@/lib/supabase";

const POLL_MS = 15000;
const SHOW_SINCE_MS = 3 * 60 * 60 * 1000;

async function fetchOwnRestaurantId(): Promise<number | string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  return data?.id ?? null;
}

export function useOwnNewReservations() {
  const { data: restaurantId } = useSWR("own-restaurant-id", fetchOwnRestaurantId, {
    revalidateOnFocus: false,
  });
  return useNewReservations(restaurantId ?? undefined);
}

export function useNewReservations(restaurantId: number | string | undefined) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (restaurantId === undefined) return;
    let cancelled = false;

    async function load() {
      const since = new Date(Date.now() - SHOW_SINCE_MS).toISOString();
      const { count: found, error } = await supabase
        .from("reservations")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurantId)
        .eq("status", "new")
        .gte("reserved_at", since);
      if (cancelled || error) return;
      setCount(found ?? 0);
    }

    void load();
    const timer = window.setInterval(() => void load(), POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [restaurantId]);

  return count;
}
