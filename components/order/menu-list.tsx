"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthHeaders, useDealOwner } from "../../lib/use-deal-owner";
import { DealSheet } from "./deal-sheet";
import type { OrderStrings } from "../../lib/order-i18n";
import type { PublicMenuItem } from "../../lib/supabase-server";
import type { CartLine } from "./cart";
import { formatChf } from "./format";
import { isDealCategory, sortCategoriesByMenuOrder } from "../../lib/menu-category-order";

type Props = {
  menu: PublicMenuItem[];
  cart: Record<string, CartLine>;
  t: OrderStrings;
  showArabic: boolean;
  categoryAr: Record<string, string>;
  compact?: boolean;
  categoryImages?: Record<string, string>;
  onSetQuantity: (id: string, quantity: number) => void;
  onSetNote: (id: string, note: string) => void;
  onPickOptions: (item: PublicMenuItem) => void;
  popularItemNames?: string[];
  restaurantId?: string;
};

export function MenuList({
  menu,
  cart,
  t,
  showArabic,
  categoryAr,
  compact = false,
  categoryImages = {},
  onSetQuantity,
  onSetNote,
  onPickOptions,
  popularItemNames = [],
  restaurantId,
}: Props) {
  const popularSet = useMemo(() => new Set(popularItemNames), [popularItemNames]);
  const router = useRouter();
  const isDealOwner = useDealOwner(restaurantId);
  const [dealSheetOpen, setDealSheetOpen] = useState(false);
  const [endingDealId, setEndingDealId] = useState<string | null>(null);
  const [endingBusy, setEndingBusy] = useState(false);
  const [dealError, setDealError] = useState("");

  async function endDeal(itemId: string) {
    setEndingBusy(true);
    setDealError("");
    const headers = await getAuthHeaders();
    if (!headers) {
      setDealError("Bitte melden Sie sich erneut an.");
      setEndingBusy(false);
      return;
    }
    const response = await fetch("/api/deal", {
      method: "DELETE",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    }).catch(() => null);
    setEndingBusy(false);
    if (!response?.ok) {
      setDealError("Angebot konnte nicht beendet werden.");
      return;
    }
    setEndingDealId(null);
    router.refresh();
  }
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  function markImageLoaded(id: string) {
    setLoadedImages((current) => new Set(current).add(id));
  }

  function markImageFailed(id: string) {
    setFailedImages((current) => new Set(current).add(id));
  }

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
    return sortCategoriesByMenuOrder(list);
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

  const popularItems = useMemo(
    () => menu.filter((item) => popularSet.has(item.name)).slice(0, 6),
    [menu, popularSet]
  );
  const showPopularRow =
    compact && popularItems.length >= 2 && !query.trim() && activeCategory === null;

  const groups = new Map<string, PublicMenuItem[]>();
  for (const item of filteredMenu) {
    const key = item.category?.trim() || "";
    groups.set(key, [...(groups.get(key) || []), item]);
  }

  function quantityOf(itemId: string) {
    return Object.values(cart)
      .filter((line) => line.menuItemId === itemId)
      .reduce((sum, line) => sum + line.quantity, 0);
  }

  function groupBySubcategory(items: PublicMenuItem[]) {
    const subgroups = new Map<string, PublicMenuItem[]>();
    for (const item of items) {
      const key = item.subcategory?.trim() || "";
      subgroups.set(key, [...(subgroups.get(key) || []), item]);
    }
    return [...subgroups.entries()];
  }

  return (
    <section aria-label={t.menuLabel} className="flex flex-col gap-4">
      <div
        className={
          compact
            ? "order-first sticky top-0 z-10 -mx-4 flex flex-col gap-3 bg-[#f8f9fb] px-4 py-2"
            : "order-first flex flex-col gap-3"
        }
      >
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

      {showPopularRow && (
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-black" dir="auto">
            {t.popularBadge}
          </h2>
          <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1" dir="ltr">
            {popularItems.map((item) => {
              const quantity = quantityOf(item.id);
              const label = showArabic && item.nameAr ? item.nameAr : item.name;
              const hasOptions = item.options.length > 0;
              return (
                <li
                  key={item.id}
                  className="flex w-40 shrink-0 flex-col justify-between gap-3 rounded-2xl border bg-white p-3"
                >
                  <p
                    className="line-clamp-2 min-h-10 font-bold leading-tight break-words"
                    dir="auto"
                  >
                    {label}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{formatChf(item.priceCents)}</p>
                    <button
                      type="button"
                      onClick={() =>
                        hasOptions
                          ? onPickOptions(item)
                          : onSetQuantity(item.id, quantity + 1)
                      }
                      aria-label={t.add(label)}
                      className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-black text-2xl font-bold text-white"
                    >
                      +
                      {quantity > 0 && (
                        <span
                          aria-hidden="true"
                          className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand,#f97316)] px-1 text-xs font-black text-[var(--brand-fg,#000)]"
                        >
                          {quantity}
                        </span>
                      )}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {isDealOwner &&
        !query.trim() &&
        activeCategory === null &&
        ![...groups.keys()].some((key) => isDealCategory(key)) && (
          <div
            className="order-[-1] flex flex-col gap-3 rounded-2xl border-2 border-[var(--brand,#f97316)] p-3"
            style={{
              background: "color-mix(in srgb, var(--brand,#f97316) 10%, white)",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black">Tagesangebote</h2>
              <button
                type="button"
                onClick={() => setDealSheetOpen(true)}
                className="min-h-11 shrink-0 rounded-full bg-[var(--brand,#f97316)] px-4 text-sm font-black text-[var(--brand-fg,#000)]"
              >
                + Angebot hinzufügen
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Nur Sie sehen diesen Bereich. Gäste sehen ihn erst, wenn ein Angebot aktiv ist.
            </p>
          </div>
        )}

      {filteredMenu.length === 0 ? (
        <div className="bg-white border rounded-2xl p-6 text-center">
          <p className="font-bold">{t.searchNoResults}</p>
        </div>
      ) : (
      sortCategoriesByMenuOrder([...groups.keys()])
        .map((category) => [category, groups.get(category)!] as const)
        .map(([category, items]) => (
        <div
          key={category || "__other"}
          className={
            isDealCategory(category)
              ? "order-[-1] flex flex-col gap-3 rounded-2xl border-2 border-[var(--brand,#f97316)] p-3"
              : "flex flex-col gap-3"
          }
          style={
            isDealCategory(category)
              ? { background: "color-mix(in srgb, var(--brand,#f97316) 10%, white)" }
              : undefined
          }
        >
          <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
          {(() => {
            const coverUrl =
              compact && category && !failedImages.has(`cat:${category}`)
                ? categoryImages[category]
                : undefined;
            const onImage = Boolean(coverUrl);
            const heading =
              showArabic && category && categoryAr[category] ? (
                <div className="flex flex-col">
                  <h2 className="text-lg font-black" dir="rtl" lang="ar">
                    {categoryAr[category]}
                  </h2>
                  <p
                    className={`text-xs ${onImage ? "text-white/80" : "text-gray-400"}`}
                    dir="ltr"
                    lang="de"
                  >
                    {category}
                  </p>
                </div>
              ) : (
                <h2
                  className={`text-lg font-black${compact ? " menu-section-title" : ""}`}
                  dir="auto"
                >
                  {category || t.otherCategory}
                </h2>
              );

            if (!coverUrl) return heading;

            return (
              <div className="relative h-36 overflow-hidden rounded-2xl bg-gray-200 text-white">
                <img
                  src={coverUrl}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                  onError={() => markImageFailed(`cat:${category}`)}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-4">{heading}</div>
              </div>
            );
          })()}
          </div>
          {isDealOwner && isDealCategory(category) && (
            <button
              type="button"
              onClick={() => setDealSheetOpen(true)}
              className="min-h-11 shrink-0 rounded-full bg-[var(--brand,#f97316)] px-4 text-sm font-black text-[var(--brand-fg,#000)]"
            >
              + Angebot hinzufügen
            </button>
          )}
          </div>
          {isDealOwner && isDealCategory(category) && dealError && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">
              {dealError}
            </p>
          )}
          {groupBySubcategory(items).map(([subcategory, subItems]) => (
          <div key={subcategory || "__no_sub"} className="flex flex-col gap-2">
            {subcategory && (
              <h3 className="text-sm font-bold text-gray-500" dir="auto">
                {subcategory}
              </h3>
            )}
          <ul
            className={
              compact
                ? "menu-frame flex flex-col bg-white border rounded-2xl divide-y overflow-hidden"
                : "flex flex-col gap-2"
            }
          >
            {subItems.map((item) => {
              const hasOptions = item.options.length > 0;
              const quantity = quantityOf(item.id);
              const label = showArabic && item.nameAr ? item.nameAr : item.name;
              const note = cart[item.id]?.note ?? "";
              const isDeal = isDealCategory(category);
              const photoSize = isDeal ? "size-20" : "size-16";
              const usingRealPhoto = Boolean(item.imageUrl) && !failedImages.has(item.id);
              const imageLoaded = !usingRealPhoto || loadedImages.has(item.id);
              const canOpenSheet = compact && !hasOptions && usingRealPhoto;
              const openSheet = () => onPickOptions(item);
              return (
                <li
                  key={item.id}
                  className={
                    compact
                      ? "p-4 flex flex-col gap-3"
                      : "bg-white border rounded-2xl p-4 flex flex-col gap-3"
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    {usingRealPhoto && (
                      <div className={`relative ${photoSize} shrink-0`}>
                        {!imageLoaded && (
                          <span
                            aria-hidden="true"
                            className="absolute inset-0 animate-pulse rounded-xl bg-gray-200"
                          />
                        )}
                        <img
                          src={item.imageUrl as string}
                          alt=""
                          className={`${photoSize} rounded-xl object-cover border transition-opacity duration-200 ${
                            imageLoaded ? "opacity-100" : "opacity-0"
                          }`}
                          ref={(node) => {
                            // Images can finish loading before React attaches onLoad.
                            if (!node || !node.complete || loadedImages.has(item.id)) return;
                            if (node.naturalWidth > 0) markImageLoaded(item.id);
                            else markImageFailed(item.id);
                          }}
                          onLoad={() => markImageLoaded(item.id)}
                          onError={() => markImageFailed(item.id)}
                        />
                        {canOpenSheet && (
                          <button
                            type="button"
                            onClick={openSheet}
                            aria-label={label}
                            className="absolute inset-0 rounded-xl"
                          />
                        )}
                      </div>
                    )}
                    <div className="min-w-0 flex flex-col gap-1 flex-1" dir="auto">
                      {isDealCategory(category) ? (
                        <span className="self-start inline-flex items-center rounded-full bg-[var(--brand,#f97316)] px-2 py-0.5 text-[11px] font-bold text-[var(--brand-fg,#000)]">
                          {t.dealBadge}
                        </span>
                      ) : popularSet.has(item.name) && (
                        <span className="self-start inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                          {t.popularBadge}
                        </span>
                      )}
                      {(() => {
                        const nameBlock =
                          showArabic && item.nameAr ? (
                            <>
                              <p className="font-bold break-words" dir="rtl" lang="ar">
                                {item.nameAr}
                              </p>
                              <p className="text-xs text-gray-400 break-words" dir="ltr" lang="de">
                                {item.name}
                              </p>
                            </>
                          ) : (
                            <p className="menu-item-name font-bold break-words" dir="auto">
                              {item.name}
                            </p>
                          );
                        return canOpenSheet ? (
                          <button
                            type="button"
                            onClick={openSheet}
                            className="flex flex-col gap-1 text-start"
                          >
                            {nameBlock}
                          </button>
                        ) : (
                          nameBlock
                        );
                      })()}
                      {item.description && (
                        <p className="text-sm text-gray-500 leading-relaxed" dir="auto">
                          {item.description}
                        </p>
                      )}
                      {item.comparePriceCents ? (
                        <p className="flex items-baseline gap-2" dir="ltr">
                          <span className="text-sm text-gray-400 line-through">
                            <span className="sr-only">{t.dealWasPrice} </span>
                            {formatChf(item.comparePriceCents)}
                          </span>
                          <span className="text-base font-black text-[var(--brand,#f97316)]">
                            <span className="sr-only">{t.dealNowPrice} </span>
                            {formatChf(item.priceCents)}
                          </span>
                        </p>
                      ) : (
                        <p className="menu-price text-sm font-semibold" dir="ltr">
                          {formatChf(item.priceCents)}
                        </p>
                      )}
                      {isDealOwner && isDeal && (
                        endingDealId === item.id ? (
                          <div className="mt-1 flex flex-wrap items-center gap-2" dir="ltr">
                            <button
                              type="button"
                              disabled={endingBusy}
                              onClick={() => void endDeal(item.id)}
                              className="min-h-11 rounded-full bg-red-600 px-4 text-sm font-bold text-white disabled:opacity-60"
                            >
                              {endingBusy ? "Wird beendet..." : "Ja, beenden"}
                            </button>
                            <button
                              type="button"
                              disabled={endingBusy}
                              onClick={() => setEndingDealId(null)}
                              className="min-h-11 rounded-full border bg-white px-4 text-sm font-bold"
                            >
                              Abbrechen
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setDealError("");
                              setEndingDealId(item.id);
                            }}
                            className="mt-1 min-h-11 self-start rounded-full border bg-white px-4 text-sm font-bold text-red-600"
                            dir="ltr"
                          >
                            Angebot beenden
                          </button>
                        )
                      )}
                    </div>

                    {hasOptions ? (
                      <button
                        type="button"
                        onClick={() => onPickOptions(item)}
                        aria-label={t.add(label)}
                        className="menu-add relative shrink-0 size-11 rounded-full bg-black text-white text-2xl font-bold flex items-center justify-center"
                      >
                        +
                        {quantity > 0 && (
                          <span
                            aria-hidden="true"
                            className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full bg-[var(--brand,#f97316)] px-1 text-xs font-black text-[var(--brand-fg,#000)] flex items-center justify-center"
                          >
                            {quantity}
                          </span>
                        )}
                      </button>
                    ) : quantity === 0 ? (
                      <button
                        type="button"
                        onClick={() => onSetQuantity(item.id, 1)}
                        aria-label={t.add(label)}
                        className="menu-add shrink-0 size-11 rounded-full bg-black text-white text-2xl font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                    ) : (
                      <div
                        dir="ltr"
                        className="shrink-0 flex items-center gap-1 bg-[var(--brand,#f97316)] text-[var(--brand-fg,#000)] rounded-full p-1"
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

                  {quantity > 0 && !hasOptions && (
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
          ))}
        </div>
      )))}
      {isDealOwner && (
        <DealSheet
          open={dealSheetOpen}
          onClose={() => setDealSheetOpen(false)}
          onCreated={() => router.refresh()}
        />
      )}
    </section>
  );
}
