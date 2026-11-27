import type { MetadataRoute } from "next"
import { listDirectoryRestaurants } from "@/lib/restaurant-directory"

const BASE_URL = "https://zelloo.ch"

const publicPages: {
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
  priority: number
}[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/signup", changeFrequency: "monthly", priority: 0.7 },
  { path: "/login", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/impressum", changeFrequency: "yearly", priority: 0.3 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = publicPages.map(({ path, changeFrequency, priority }) => ({
    url: `${BASE_URL}${path}`,
    changeFrequency,
    priority,
  }))

  try {
    const restaurants = await listDirectoryRestaurants()
    const citySlugs = [...new Set(restaurants.map((restaurant) => restaurant.citySlug))]

    pages.push({ url: `${BASE_URL}/restaurants`, changeFrequency: "daily", priority: 0.8 })
    for (const slug of citySlugs) {
      pages.push({ url: `${BASE_URL}/restaurants/${slug}`, changeFrequency: "daily", priority: 0.7 })
    }
    for (const restaurant of restaurants) {
      pages.push({ url: `${BASE_URL}/r/${restaurant.slug ?? restaurant.id}`, changeFrequency: "weekly", priority: 0.6 })
    }
  } catch {
    return pages
  }

  return pages
}
