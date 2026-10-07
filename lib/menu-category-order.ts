// Determines a logical display order for menu categories on the customer
// order page (Vorspeisen -> Hauptgerichte -> Getränke -> Desserts -> Snacks),
// regardless of what free-text category name the restaurant owner typed in.
// Categories that don't match any known keyword keep their original relative
// order and are shown after the recognized ones.

const CATEGORY_RANK_KEYWORDS: Array<{ rank: number; keywords: string[] }> = [
  {
    rank: 0,
    keywords: [
      "vorspeise",
      "antipasti",
      "starter",
      "appetizer",
      "salat",
      "salad",
      "suppe",
      "soup",
      "entrée",
      "entree",
    ],
  },
  {
    rank: 1,
    keywords: [
      "hauptgericht",
      "hauptspeise",
      "main",
      "pizza",
      "pasta",
      "burger",
      "steak",
      "fleisch",
      "meat",
      "fisch",
      "fish",
      "gericht",
      "plat",
    ],
  },
  {
    rank: 2,
    keywords: [
      "getr",
      "drink",
      "beverage",
      "cola",
      "kaffee",
      "coffee",
      "tee",
      "tea",
      "bier",
      "beer",
      "wein",
      "wine",
      "wasser",
      "water",
      "saft",
      "juice",
      "softdrink",
      "limonade",
      "cocktail",
      "aperitif",
      "spirituosen",
      "boisson",
      "bevande",
    ],
  },
  {
    rank: 3,
    keywords: [
      "dessert",
      "nachspeise",
      "süss",
      "suess",
      "kuchen",
      "cake",
      "eis",
      "glace",
      "tiramisu",
      "gelato",
      "torte",
      "dolci",
    ],
  },
  {
    rank: 4,
    keywords: ["snack", "pommes", "fries", "fingerfood", "beilage", "side"],
  },
];

const UNKNOWN_RANK = 5;

function categoryRank(category: string): number {
  const normalized = category.toLowerCase();
  for (const group of CATEGORY_RANK_KEYWORDS) {
    if (group.keywords.some((keyword) => normalized.includes(keyword))) {
      return group.rank;
    }
  }
  return UNKNOWN_RANK;
}

/**
 * Sorts category names into the logical menu order (Vorspeisen, Hauptgerichte,
 * Getränke, Desserts, Snacks), keeping unrecognized categories afterward in
 * their original relative order.
 */
export function sortCategoriesByMenuOrder(categories: string[]): string[] {
  return categories
    .map((category, index) => ({ category, index, rank: categoryRank(category) }))
    .sort((a, b) => (a.rank !== b.rank ? a.rank - b.rank : a.index - b.index))
    .map((entry) => entry.category);
}
