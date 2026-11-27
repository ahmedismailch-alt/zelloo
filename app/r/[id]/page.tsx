import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { OrderApp } from "../../../components/order/order-app";
import {
  ensureRestaurantSlug,
  findRestaurantIdBySlug,
  isNumericRestaurantId,
} from "../../../lib/restaurant-slug";
import {
  getNextOpening,
  type OpeningHours,
} from "../../../lib/restaurant-settings";
import { getRestaurantLocation } from "../../../lib/restaurant-directory";
import { restaurantUrl } from "../../../lib/restaurant-location";
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

const WEEKDAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function zurichWeekdayIndex() {
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "Europe/Zurich",
  }).format(new Date());
  return WEEKDAYS_EN.indexOf(weekday);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: param } = await params;
  if (!isValidRestaurantId(param)) return {};

  const isSlug = !isNumericRestaurantId(param);
  const id = isSlug ? await findRestaurantIdBySlug(param) : param;
  if (!id) return {};
  const urlKey = isSlug ? param : id;

  const [restaurant, location] = await Promise.all([
    getRestaurant(id).catch(() => null),
    getRestaurantLocation(id).catch(() => ({ city: null, address: null })),
  ]);
  if (!restaurant?.name) return {};

  const inCity = location.city ? ` in ${location.city}` : "";
  const title = `${restaurant.name}${inCity} – Menü und online bestellen`;
  const description = location.city
    ? `Menü von ${restaurant.name} in ${location.city} ansehen und direkt online bestellen. Ohne App, ohne Wartezeit.`
    : `Menü von ${restaurant.name} ansehen und direkt online bestellen. Ohne App, ohne Wartezeit.`;

  return {
    title,
    description,
    alternates: { canonical: restaurantUrl(urlKey) },
    openGraph: {
      title,
      description,
      url: restaurantUrl(urlKey),
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
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id: param } = await params;
  const query = await searchParams;
  const table = query.table;

  if (!isValidRestaurantId(param)) notFound();

  let id = param;
  let slug: string | null = null;
  if (isNumericRestaurantId(param)) {
    slug = await ensureRestaurantSlug(param).catch(() => null);
    if (slug) {
      const forwarded = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) {
        for (const entry of Array.isArray(value) ? value : value ? [value] : []) {
          forwarded.append(key, entry);
        }
      }
      const suffix = forwarded.size > 0 ? `?${forwarded.toString()}` : "";
      redirect(`/r/${slug}${suffix}`);
    }
  } else {
    const resolved = await findRestaurantIdBySlug(param).catch(() => null);
    if (!resolved) notFound();
    id = resolved;
    slug = param;
  }

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
    location,
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
    getRestaurantLocation(id).catch(() => ({ city: null, address: null })),
  ]);

  if (!restaurant) notFound();

  const structuredData = isDemo
    ? null
    : buildRestaurantJsonLd({
        id: slug ?? id,
        name: restaurant.name,
        phone: restaurant.phone,
        city: location.city,
        address: location.address,
        logoUrl: branding.logoUrl,
        openingHours: settings.openingHours,
      });

  return (
    <>
    {structuredData && (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
    )}
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
      waitMinutes={settings.waitMinutes}
      info={
        isDemo
          ? null
          : {
              address: location.address,
              city: location.city,
              openingHours: settings.openingHours,
              todayIndex: zurichWeekdayIndex(),
            }
      }
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
    </>
  );
}

const SCHEMA_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function buildRestaurantJsonLd(input: {
  id: string;
  name: string;
  phone: string | null;
  city: string | null;
  address: string | null;
  logoUrl: string | null;
  openingHours: OpeningHours | null;
}) {
  const url = restaurantUrl(input.id);
  const hours = (input.openingHours ?? [])
    .map((day, index) =>
      day.closed
        ? null
        : {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: SCHEMA_DAYS[index],
            opens: day.open,
            closes: day.close,
          }
    )
    .filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${url}#restaurant`,
    name: input.name,
    url,
    hasMenu: url,
    acceptsReservations: false,
    ...(input.phone ? { telephone: input.phone } : {}),
    ...(input.logoUrl ? { image: input.logoUrl } : {}),
    ...(input.city || input.address
      ? {
          address: {
            "@type": "PostalAddress",
            ...(input.address ? { streetAddress: input.address } : {}),
            ...(input.city ? { addressLocality: input.city } : {}),
            addressCountry: "CH",
          },
        }
      : {}),
    ...(hours.length > 0 ? { openingHoursSpecification: hours } : {}),
    potentialAction: {
      "@type": "OrderAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: url,
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
    },
  };
}
