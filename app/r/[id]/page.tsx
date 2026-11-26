import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderApp } from "../../../components/order/order-app";
import { getNextOpening } from "../../../lib/restaurant-settings";
import { getReservationConfig } from "../../../lib/reservations-server";
import {
  getBranding,
  getCategoryImages,
  getCategoryTranslations,
  getGoogleReviewUrl,
  getOrderableMenu,
  getVenueType,
  getPopularItemNames,
  getRestaurant,
  getOrderAvailability,
  isDemoRestaurant,
  isValidRestaurantId,
  normalizeTable,
} from "../../../lib/supabase-server";

export const dynamic = "force-dynamic";

const DEMO_MAX_PARTY = 12;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isValidRestaurantId(id)) return {};

  const restaurant = await getRestaurant(id).catch(() => null);
  if (!restaurant?.name) return {};

  const title = `${restaurant.name} – Menü und Bestellung`;
  const description = `Menü von ${restaurant.name} ansehen und direkt online bestellen. Ohne App, ohne Wartezeit.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: restaurant.name,
      locale: "de_CH",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

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
    venueType,
    categoryImages,
    branding,
    googleReviewUrl,
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
    getVenueType(id),
    getCategoryImages(id),
    getBranding(id),
    getGoogleReviewUrl(id),
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
      venueType={venueType}
      categoryImages={categoryImages}
      logoUrl={branding.logoUrl}
      brandColor={branding.brandColor}
      themeBg={branding.themeBg}
      themeText={branding.themeText}
      googleReviewUrl={googleReviewUrl}
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
