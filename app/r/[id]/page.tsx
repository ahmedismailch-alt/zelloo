import { notFound } from "next/navigation";
import { OrderApp } from "../../../components/order/order-app";
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

  const restaurant = await getRestaurant(id);
  if (!restaurant) notFound();

  const [menu, categoryAr, popularItemNames, { availability, settings }, isDemo] =
    await Promise.all([
      getOrderableMenu(id),
      getCategoryTranslations(id),
      getPopularItemNames(id).catch(() => []),
      getOrderAvailability(id),
      isDemoRestaurant(id),
    ]);

  return (
    <OrderApp
      restaurantId={id}
      isDemo={isDemo}
      availability={availability}
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
    />
  );
}
