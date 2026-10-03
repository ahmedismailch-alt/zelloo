import { notFound } from "next/navigation";
import { OrderApp } from "../../../components/order/order-app";
import {
  getCategoryTranslations,
  getOrderableMenu,
  getRestaurant,
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

  const [menu, categoryAr] = await Promise.all([
    getOrderableMenu(id),
    getCategoryTranslations(id),
  ]);

  return (
    <OrderApp
      restaurantId={id}
      restaurantName={restaurant.name}
      table={normalizeTable(Array.isArray(table) ? table[0] : table)}
      menu={menu}
      categoryAr={categoryAr}
    />
  );
}
