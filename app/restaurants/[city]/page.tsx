import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/logo";
import { listDirectoryRestaurants } from "@/lib/restaurant-directory";
import { SITE_URL } from "@/lib/restaurant-location";

export const revalidate = 3600;

type Props = { params: Promise<{ city: string }> };

async function loadCity(slug: string) {
  const all = await listDirectoryRestaurants();
  const restaurants = all.filter((restaurant) => restaurant.citySlug === slug);
  return { restaurants, cityName: restaurants[0]?.city ?? null };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const { cityName } = await loadCity(city);
  if (!cityName) return { title: "Restaurants · Zelloo", robots: { index: false } };

  return {
    title: `Restaurants und Cafés in ${cityName} direkt bestellen · Zelloo`,
    description: `Restaurants und Cafés in ${cityName}, bei denen Sie direkt bestellen können – ohne App, ohne Wartezeit und ohne Plattform-Kommission.`,
    alternates: { canonical: `${SITE_URL}/restaurants/${city}` },
  };
}

export default async function CityPage({ params }: Props) {
  const { city } = await params;
  const { restaurants, cityName } = await loadCity(city);
  if (!cityName) notFound();

  return (
    <div className="bg-white min-h-screen">
      <header className="max-w-[720px] mx-auto px-5 py-4 flex justify-between items-center">
        <Link href="/" aria-label="ZELLOO.CH">
          <Logo size="md" label="ZELLOO.CH" />
        </Link>
      </header>

      <main className="max-w-[720px] mx-auto px-5 pt-8 pb-16">
        <Link href="/restaurants" className="text-sm font-semibold text-gray-500 hover:text-black">
          Alle Städte
        </Link>
        <h1 className="text-[32px] md:text-[44px] font-black leading-[1.05] mt-3 text-balance">
          Direkt bestellen in {cityName}
        </h1>
        <p className="text-gray-600 text-base leading-relaxed mt-4 text-pretty">
          Restaurants und Cafés in {cityName}, bei denen Sie ohne App und ohne Wartezeit bestellen
          können.
        </p>

        <ul className="mt-8 divide-y divide-black/10 border-y border-black/10">
          {restaurants.map((restaurant) => (
            <li key={restaurant.id}>
              <Link
                href={`/r/${restaurant.slug ?? restaurant.id}`}
                className="flex items-center justify-between gap-4 min-h-14 py-3 hover:bg-gray-50"
              >
                <span className="min-w-0">
                  <span className="block font-semibold truncate">{restaurant.name}</span>
                  {restaurant.address ? (
                    <span className="block text-sm text-gray-500 truncate">{restaurant.address}</span>
                  ) : null}
                </span>
                <span className="shrink-0 text-sm font-semibold text-[#c41e24]">Bestellen</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
