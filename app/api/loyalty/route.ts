import { NextResponse } from "next/server";
import {
  getLoyaltyOrderCount,
  getRestaurant,
  isValidRestaurantId,
} from "../../../lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get("restaurantId") || "";
  const phone = (searchParams.get("phone") || "").trim();

  if (!isValidRestaurantId(restaurantId) || !phone) {
    return NextResponse.json({ enabled: false });
  }

  try {
    const restaurant = await getRestaurant(restaurantId);
    const target = restaurant?.loyalty_target ?? 5;
    const reward = restaurant?.loyalty_reward ?? "";

    if (!restaurant || !restaurant.loyalty_enabled || !reward || target < 1) {
      return NextResponse.json({ enabled: false });
    }

    const count = await getLoyaltyOrderCount(restaurantId, phone);

    return NextResponse.json({ enabled: true, count, target, reward });
  } catch (error) {
    console.error("Zelloo loyalty status unavailable:", error);
    return NextResponse.json({ enabled: false });
  }
}
