const FALLBACK_IMAGES: { keywords: string[]; src: string }[] = [
  { keywords: ["pizza"], src: "/images/menu-fallback/pizza.png" },
  { keywords: ["burger", "hamburger"], src: "/images/menu-fallback/burger.png" },
  {
    keywords: ["salat", "salad", "insalata", "salade"],
    src: "/images/menu-fallback/salad.png",
  },
  {
    keywords: ["dessert", "nachspeise", "nachtisch", "dolci", "suess", "sweet"],
    src: "/images/menu-fallback/dessert.png",
  },
  {
    keywords: ["getraenk", "drink", "boisson", "bevand", "softdrink", "beverage"],
    src: "/images/menu-fallback/drinks.png",
  },
  {
    keywords: ["snack", "vorspeise", "starter", "antipasto", "entree"],
    src: "/images/menu-fallback/snacks.png",
  },
];

const DEFAULT_IMAGE = "/images/menu-fallback/maindish.png";

/**
 * Generic category photo shown next to a dish when the restaurant hasn't
 * added a real photo of their own, so the menu never looks empty.
 */
export function getMenuItemFallbackImage(category: string | null | undefined): string {
  const normalized = (category || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  for (const entry of FALLBACK_IMAGES) {
    if (entry.keywords.some((keyword) => normalized.includes(keyword))) {
      return entry.src;
    }
  }

  return DEFAULT_IMAGE;
}
