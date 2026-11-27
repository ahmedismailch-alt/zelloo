import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { listDirectoryRestaurants } from "@/lib/restaurant-directory";
import { SITE_URL } from "@/lib/restaurant-location";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Restaurants und Cafés direkt bestellen · Zelloo",
  description:
    "Restaurants und Cafés in der Schweiz, bei denen Sie direkt bestellen können – ohne App, ohne Wartezeit und ohne Plattform-Kommission.",
  alternates: { canonical: `${SITE_URL}/restaurants` },
};

export default async function RestaurantsPage() {
  const restaurants = await listDirectoryRestaurants();

  const cities = new Map<string, { name: string; slug: string; count: number }>();
  for (const restaurant of restaurants) {
    const entry = cities.get(restaurant.citySlug);
    if (entry) entry.count += 1;
    else cities.set(restaurant.citySlug, { name: restaurant.city, slug: restaurant.citySlug, count: 1 });
  }
  const cityList = [...cities.values()].sort((a, b) => a.name.localeCompare(b.name, "de"));

  return (
    <div className="bg-white min-h-screen">
      <header className="max-w-[720px] mx-auto px-5 py-4 flex justify-between items-center">
        <Link href="/" aria-label="ZELLOO.CH">
          <Logo size="md" label="ZELLOO.CH" />
        </Link>
      </header>

      <main className="max-w-[720px] mx-auto px-5 pt-8 pb-16">
        <h1 className="text-[32px] md:text-[44px] font-black leading-[1.05] text-balance">
          Direkt bestellen in Ihrer Stadt
        </h1>
        <p className="text-gray-600 text-base leading-relaxed mt-4 text-pretty">
          Restaurants und Cafés, bei denen Sie ohne App und ohne Wartezeit bestellen können. Keine
          Plattform dazwischen, keine Kommission – Ihre Bestellung geht direkt an das Lokal.
        </p>

        {cityList.length === 0 ? (
          <p className="mt-10 text-gray-500">Noch keine Restaurants eingetragen.</p>
        ) : (
          <>
            <h2 className="text-lg font-bold mt-10">Städte</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {cityList.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/restaurants/${city.slug}`}
                    className="inline-flex items-center min-h-11 px-4 rounded-full border border-black/10 text-sm font-semibold hover:bg-gray-50"
                  >
                    {city.name}
                    <span className="ml-2 text-gray-500 font-normal">{city.count}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <h2 className="text-lg font-bold mt-10">Alle Restaurants</h2>
            <ul className="mt-3 divide-y divide-black/10 border-y border-black/10">
              {restaurants.map((restaurant) => (
                <li key={restaurant.id}>
                  <Link
                    href={`/r/${restaurant.slug ?? restaurant.id}`}
                    className="flex items-center justify-between gap-4 min-h-14 py-3 hover:bg-gray-50"
                  >
                    <span className="min-w-0">
                      <span className="block font-semibold truncate">{restaurant.name}</span>
                      <span className="block text-sm text-gray-500 truncate">
                        {restaurant.address ? `${restaurant.address}, ` : ""}
                        {restaurant.city}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-[#c41e24]">Bestellen</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <p className="mt-12 text-sm text-gray-500">
          Sie führen ein Restaurant oder Café?{" "}
          <Link href="/signup" className="font-semibold text-[#c41e24] underline underline-offset-2">
            Jetzt kostenlos testen
          </Link>
        </p>
      </main>
    </div>
  );
}
