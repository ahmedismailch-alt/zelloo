"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const POLL_MS = 15000;
const SHOW_SINCE_MS = 3 * 60 * 60 * 1000;

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
