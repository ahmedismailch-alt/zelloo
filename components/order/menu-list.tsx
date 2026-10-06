"use client";

import { useMemo, useState } from "react";
import type { OrderStrings } from "../../lib/order-i18n";
import type { PublicMenuItem } from "../../lib/supabase-server";
import type { CartLine } from "./cart";
import { formatChf } from "./format";

type Props = {
  menu: PublicMenuItem[];
  cart: Record<string, CartLine>;
  t: OrderStrings;
  showArabic: boolean;
  categoryAr: Record<string, string>;
  onSetQuantity: (id: string, quantity: number) => void;
  onSetNote: (id: string, note: string) => void;
};

export function MenuList({ menu, cart, t, showArabic, categoryAr, onSetQuantity, onSetNote }: Props) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const item of menu) {
      const key = item.category?.trim() || "";
      if (!seen.has(key)) {
        seen.add(key);
        list.push(key);
      }
    }
    return list;
  }, [menu]);

  const filteredMenu = useMemo(() => {
    const q = query.trim().toLowerCase();
    return menu.filter((item) => {
      if (activeCategory !== null && (item.category?.trim() || "") !== activeCategory) {
        return false;
      }
      if (!q) return true;
      const haystack = [item.name, item.nameAr, item.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [menu, query, activeCategory]);

  const groups = new Map<string, PublicMenuItem[]>();
  for (const item of filteredMenu) {
    const key = item.category?.trim() || "";
    groups.set(key, [...(groups.get(key) || []), item]);
  }

  return (
    <section aria-label={t.menuLabel} className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <label className="relative block">
          <span className="sr-only">{t.searchPlaceholder}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.searchPlaceholder}
            dir="auto"
            className="w-full h-12 rounded-2xl border bg-white pl-11 pr-4 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </label>

        {categories.length > 1 && (
          <ul className="flex gap-2 overflow-x-auto -mx-1 px-1" dir="ltr">
            <li>
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                aria-pressed={activeCategory === null}
                className={`min-h-9 shrink-0 whitespace-nowrap rounded-full px-4 text-sm font-bold ${
                  activeCategory === null
                    ? "bg-black text-white"
                    : "bg-white border text-gray-600"
                }`}
              >
                {t.allCategories}
              </button>
            </li>
            {categories.map((category) => {
              const active = activeCategory === category;
              const label =
                showArabic && category && categoryAr[category]
                  ? categoryAr[category]
                  : category || t.otherCategory;
              return (
                <li key={category || "__other"}>
                  <button
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    aria-pressed={active}
                    dir="auto"
                    className={`min-h-9 shrink-0 whitespace-nowrap rounded-full px-4 text-sm font-bold ${
                      active ? "bg-black text-white" : "bg-white border text-gray-600"
                    }`}
                  >
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {filteredMenu.length === 0 ? (
        <div className="bg-white border rounded-2xl p-6 text-center">
          <p className="font-bold">{t.searchNoResults}</p>
        </div>
      ) : (
      [...groups.entries()].map(([category, items]) => (
        <div key={category || "__other"} className="flex flex-col gap-3">
          {showArabic && category && categoryAr[category] ? (
            <div className="flex flex-col">
              <h2 className="text-lg font-black" dir="rtl" lang="ar">
                {categoryAr[category]}
              </h2>
              <p className="text-xs text-gray-400" dir="ltr" lang="de">
                {category}
              </p>
            </div>
          ) : (
            <h2 className="text-lg font-black" dir="auto">{category || t.otherCategory}</h2>
          )}
          <ul className="flex flex-col gap-2">
            {items.map((item) => {
              const quantity = cart[item.id]?.quantity ?? 0;
              const label = showArabic && item.nameAr ? item.nameAr : item.name;
              const note = cart[item.id]?.note ?? "";
              return (
                <li
                  key={item.id}
                  className="bg-white border rounded-2xl p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl || "/placeholder.svg"}
                        alt=""
                        className="size-16 shrink-0 rounded-xl object-cover border"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : null}
                    <div className="min-w-0 flex flex-col gap-1 flex-1" dir="auto">
                      {showArabic && item.nameAr ? (
                        <>
                          <p className="font-bold break-words" dir="rtl" lang="ar">
                            {item.nameAr}
                          </p>
                          <p className="text-xs text-gray-400 break-words" dir="ltr" lang="de">
                            {item.name}
                          </p>
                        </>
                      ) : (
                        <p className="font-bold break-words" dir="auto">{item.name}</p>
                      )}
                      {item.description && (
                        <p className="text-sm text-gray-500 leading-relaxed" dir="auto">
                          {item.description}
                        </p>
                      )}
                      <p className="text-sm font-semibold" dir="ltr">
                        {formatChf(item.priceCents)}
                      </p>
                    </div>

                    {quantity === 0 ? (
                      <button
                        type="button"
                        onClick={() => onSetQuantity(item.id, 1)}
                        aria-label={t.add(label)}
                        className="shrink-0 size-11 rounded-full bg-black text-white text-2xl font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                    ) : (
                      <div
                        dir="ltr"
                        className="shrink-0 flex items-center gap-1 bg-orange-500 rounded-full p-1"
                      >
                        <button
                          type="button"
                          onClick={() => onSetQuantity(item.id, quantity - 1)}
                          aria-label={t.remove(label)}
                          className="size-11 rounded-full bg-black/10 text-xl font-bold flex items-center justify-center"
                        >
                          {"−"}
                        </button>
                        <span className="w-6 text-center font-black" aria-live="polite">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onSetQuantity(item.id, quantity + 1)}
                          aria-label={t.add(label)}
                          className="size-11 rounded-full bg-black/10 text-xl font-bold flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>

                  {quantity > 0 && (
                    <input
                      type="text"
                      value={note}
                      onChange={(event) => onSetNote(item.id, event.target.value)}
                      placeholder={t.itemNotePlaceholder}
                      maxLength={120}
                      dir="auto"
                      className="w-full h-10 rounded-xl border bg-gray-50 px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )))}
    </section>
  );
}
