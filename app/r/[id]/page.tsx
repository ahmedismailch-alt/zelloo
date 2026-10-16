import { notFound } from "next/navigation";
import { OrderApp } from "../../../components/order/order-app";
import { getNextOpening } from "../../../lib/restaurant-settings";
import { getReservationConfig } from "../../../lib/reservations-server";
import {
  getCategoryTranslations,
  getOrderableMenu,
  getPopularItemNames,
  getRestaurant,
  getOrderAvailability,
  isDemoRestaurant,
  isValidRestaurantId,
  normalizeTable,
} from "../../../lib/supabase-server";

export const dynamic = "force-dynamic";

const DEMO_MAX_PARTY = 12;

export default async function RestaurantOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ table?: string | string[] }>;
}) {
  const { id } = await params;
  const { table } = await searchParams;

  if (!isValidRestaurantId(id)) notFound();

  const isDemoPromise = isDemoRestaurant(id);

  const [
    restaurant,
    menu,
    categoryAr,
    popularItemNames,
    { availability, settings },
    isDemo,
    reservationConfig,
  ] = await Promise.all([
    getRestaurant(id),
    getOrderableMenu(id),
    getCategoryTranslations(id),
    isDemoPromise.then((demo) =>
      demo ? [] : getPopularItemNames(id).catch(() => [])
    ),
    getOrderAvailability(id),
    isDemoPromise,
    getReservationConfig(id).catch(() => null),
  ]);

  if (!restaurant) notFound();

  return (
    <OrderApp
      restaurantId={id}
      isDemo={isDemo}
      availability={availability}
      nextOpening={
        availability === "closed" ? getNextOpening(settings.openingHours) : null
      }
      delivery={{
        feeCents: settings.deliveryFeeCents,
        minCents: settings.deliveryMinCents,
      }}
      restaurantName={restaurant.name}
      restaurantPhone={restaurant.phone}
      table={normalizeTable(Array.isArray(table) ? table[0] : table)}
      menu={menu}
      categoryAr={categoryAr}
      popularItemNames={popularItemNames}
      reservation={
        isDemo
          ? { maxParty: DEMO_MAX_PARTY, openingHours: settings.openingHours }
          : reservationConfig?.enabled
            ? {
                maxParty: reservationConfig.maxParty,
                openingHours: settings.openingHours,
              }
            : null
      }
    />
  );
}
