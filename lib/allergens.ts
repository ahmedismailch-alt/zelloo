import type { OrderLang } from "./order-i18n";

export const ALLERGEN_KEYS = [
  "gluten",
  "crustaceans",
  "eggs",
  "fish",
  "peanuts",
  "soy",
  "milk",
  "nuts",
  "celery",
  "mustard",
  "sesame",
  "sulphites",
  "lupin",
  "molluscs",
] as const;

export const DIET_KEYS = ["vegetarian", "vegan", "halal"] as const;

export type AllergenKey = (typeof ALLERGEN_KEYS)[number];
export type DietKey = (typeof DIET_KEYS)[number];

type Labels = Record<OrderLang, string>;

export const ALLERGEN_LABELS: Record<AllergenKey, Labels> = {
  gluten: { de: "Gluten", fr: "Gluten", it: "Glutine", en: "Gluten", ar: "الغلوتين" },
  crustaceans: { de: "Krebstiere", fr: "Crustacés", it: "Crostacei", en: "Crustaceans", ar: "القشريات" },
  eggs: { de: "Eier", fr: "Œufs", it: "Uova", en: "Eggs", ar: "البيض" },
  fish: { de: "Fisch", fr: "Poisson", it: "Pesce", en: "Fish", ar: "السمك" },
  peanuts: { de: "Erdnüsse", fr: "Arachides", it: "Arachidi", en: "Peanuts", ar: "الفول السوداني" },
  soy: { de: "Soja", fr: "Soja", it: "Soia", en: "Soy", ar: "الصويا" },
  milk: { de: "Milch", fr: "Lait", it: "Latte", en: "Milk", ar: "الحليب" },
  nuts: { de: "Schalenfrüchte", fr: "Fruits à coque", it: "Frutta a guscio", en: "Tree nuts", ar: "المكسرات" },
  celery: { de: "Sellerie", fr: "Céleri", it: "Sedano", en: "Celery", ar: "الكرفس" },
  mustard: { de: "Senf", fr: "Moutarde", it: "Senape", en: "Mustard", ar: "الخردل" },
  sesame: { de: "Sesam", fr: "Sésame", it: "Sesamo", en: "Sesame", ar: "السمسم" },
  sulphites: { de: "Sulfite", fr: "Sulfites", it: "Solfiti", en: "Sulphites", ar: "الكبريتيت" },
  lupin: { de: "Lupinen", fr: "Lupin", it: "Lupini", en: "Lupin", ar: "الترمس" },
  molluscs: { de: "Weichtiere", fr: "Mollusques", it: "Molluschi", en: "Molluscs", ar: "الرخويات" },
};

export const DIET_LABELS: Record<DietKey, Labels> = {
  vegetarian: { de: "Vegetarisch", fr: "Végétarien", it: "Vegetariano", en: "Vegetarian", ar: "نباتي" },
  vegan: { de: "Vegan", fr: "Végétalien", it: "Vegano", en: "Vegan", ar: "نباتي صرف" },
  halal: { de: "Halal", fr: "Halal", it: "Halal", en: "Halal", ar: "حلال" },
};

export type FilterStrings = {
  button: string;
  diet: string;
  withoutAllergens: string;
  contains: string;
  reset: string;
  disclaimer: string;
};

export const FILTER_STRINGS: Record<OrderLang, FilterStrings> = {
  de: {
    button: "Allergene & Ernährung",
    diet: "Ernährung",
    withoutAllergens: "Ohne diese Allergene",
    contains: "Enthält",
    reset: "Filter zurücksetzen",
    disclaimer: "Angaben ohne Gewähr. Bei Allergien bitte das Personal fragen.",
  },
  fr: {
    button: "Allergènes & régime",
    diet: "Régime",
    withoutAllergens: "Sans ces allergènes",
    contains: "Contient",
    reset: "Réinitialiser les filtres",
    disclaimer: "Sans garantie. En cas d'allergie, demandez au personnel.",
  },
  it: {
    button: "Allergeni e dieta",
    diet: "Dieta",
    withoutAllergens: "Senza questi allergeni",
    contains: "Contiene",
    reset: "Azzera i filtri",
    disclaimer: "Senza garanzia. In caso di allergie chiedete al personale.",
  },
  en: {
    button: "Allergens & diet",
    diet: "Diet",
    withoutAllergens: "Without these allergens",
    contains: "Contains",
    reset: "Reset filters",
    disclaimer: "No guarantee. If you have allergies, please ask the staff.",
  },
  ar: {
    button: "الحساسية والنظام الغذائي",
    diet: "النظام الغذائي",
    withoutAllergens: "بدون مسببات الحساسية هذه",
    contains: "يحتوي على",
    reset: "إعادة ضبط الفلاتر",
    disclaimer: "المعلومات غير مضمونة. إذا عندك حساسية اسأل الموظفين.",
  },
};

function readKeys<T extends string>(value: unknown, allowed: readonly T[]): T[] {
  if (!Array.isArray(value)) return [];
  const result: T[] = [];
  for (const entry of value) {
    if (typeof entry === "string" && (allowed as readonly string[]).includes(entry)) {
      const key = entry as T;
      if (!result.includes(key)) result.push(key);
    }
  }
  return result;
}

export function readAllergens(value: unknown): AllergenKey[] {
  return readKeys(value, ALLERGEN_KEYS);
}

export function readDietTags(value: unknown): DietKey[] {
  return readKeys(value, DIET_KEYS);
}
