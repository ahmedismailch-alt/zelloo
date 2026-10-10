"use client";

import { Logo } from "@/components/logo";
import { useEffect, useMemo, useState } from "react";
import type { PublicMenuItem } from "../../lib/supabase-server";
import {
  LANG_LABELS,
  LANG_STORAGE_KEY,
  ORDER_LANGS,
  ORDER_STRINGS,
  detectLang,
  isOrderLang,
  type OrderLang,
} from "../../lib/order-i18n";
import { AiOrderBox, type ParsedItem } from "./ai-order-box";
import {
  Cart,
  cartLineKey,
  lastOrderStorageKey,
  type CartLine,
  type DeliveryInfo,
} from "./cart";
import { MenuList } from "./menu-list";
import { OptionsSheet } from "./options-sheet";
import { hasRequiredOptions } from "../../lib/menu-options";
import {
  canOrder,
  type Availability,
  type NextOpening,
} from "../../lib/restaurant-settings";

const MAX_QUANTITY = 20;

const DEMO_BANNER: Record<OrderLang, string> = {
  de: "Demo: keine echte Bestellung",
  fr: "Démo : pas de vraie commande",
  it: "Demo: nessun ordine reale",
  en: "Demo: not a real order",
  ar: "تجريبي: مو طلب حقيقي",
};

const DRINK_KEYWORDS = [
  "getränk",
  "getraenk",
  "drink",
  "boisson",
  "bevand",
  "beverage",
  "مشروب",
];

function isDrinkCategory(category: string | null | undefined) {
  const value = (category ?? "").toLowerCase();
  return DRINK_KEYWORDS.some((keyword) => value.includes(keyword));
}

type Props = {
  restaurantId: string;
  isDemo?: boolean;
  availability?: Availability;
  nextOpening?: NextOpening | null;
  delivery?: DeliveryInfo;
  restaurantName: string;
  restaurantPhone: string | null;
  table: string | null;
  menu: PublicMenuItem[];
  categoryAr: Record<string, string>;
  popularItemNames?: string[];
};

export function OrderApp({
  restaurantId,
  isDemo = false,
  availability = "open",
  nextOpening = null,
  delivery = { feeCents: 0, minCents: 0 },
  restaurantName,
  restaurantPhone,
  table,
  menu,
  categoryAr,
  popularItemNames = [],
}: Props) {
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [lang, setLang] = useState<OrderLang>("de");
  const [shareCopied, setShareCopied] = useState(false);
  const [pendingItem, setPendingItem] = useState<PublicMenuItem | null>(null);
  const [savedOrder, setSavedOrder] = useState<CartLine[]>([]);
  const [reorderNotice, setReorderNotice] = useState("");
  const acceptingOrders = canOrder(availability);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(lastOrderStorageKey(restaurantId));
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return;
      const lines: CartLine[] = [];
      for (const entry of parsed.slice(0, 30)) {
        if (!entry || typeof entry !== "object") continue;
        const line = entry as Record<string, unknown>;
        if (typeof line.menuItemId !== "string") continue;
        const quantity = Number(line.quantity);
        if (!Number.isInteger(quantity) || quantity < 1) continue;
        lines.push({
          menuItemId: line.menuItemId,
          options: Array.isArray(line.options)
            ? line.options.filter((id): id is string => typeof id === "string")
            : [],
          quantity: Math.min(quantity, MAX_QUANTITY),
          note: typeof line.note === "string" ? line.note : null,
        });
      }
      setSavedOrder(lines);
    } catch {
      // Storage can be blocked or corrupt; reordering is optional.
    }
  }, [restaurantId]);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    } catch {
      // Storage can be blocked (private mode); fall back to the browser language.
    }
    setLang(isOrderLang(saved) ? saved : detectLang(navigator.languages ?? [navigator.language]));
  }, []);

  function chooseLang(next: OrderLang) {
    setLang(next);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // Ignore: the choice still applies for this visit.
    }
  }

  const t = ORDER_STRINGS[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const opensLabel = (() => {
    if (!nextOpening) return "";
    if (nextOpening.daysAhead === 0) return t.opensToday(nextOpening.time);
    if (nextOpening.daysAhead === 1) return t.opensTomorrow(nextOpening.time);
    // 2024-01-01 is a Monday, so weekday 0 maps to Monday.
    const dayName = new Intl.DateTimeFormat(lang, {
      weekday: "long",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(2024, 0, 1 + nextOpening.weekday)));
    return t.opensOnDay(dayName, nextOpening.time);
  })();

  const menuById = useMemo(
    () => new Map(menu.map((item) => [item.id, item])),
    [menu]
  );

  const drinkItems = useMemo(
    () => menu.filter((item) => isDrinkCategory(item.category)),
    [menu]
  );

  const hasNonDrinkInCart = Object.values(cart).some((line) => {
    const item = menuById.get(line.menuItemId);
    return item && !isDrinkCategory(item.category);
  });

  const hasDrinkInCart = Object.values(cart).some((line) => {
    const item = menuById.get(line.menuItemId);
    return item && isDrinkCategory(item.category);
  });

  const showUpsell = drinkItems.length > 0 && hasNonDrinkInCart && !hasDrinkInCart;

  function setQuantity(key: string, quantity: number) {
    setCart((current) => {
      const next = { ...current };
      const clamped = Math.min(Math.max(quantity, 0), MAX_QUANTITY);
      if (clamped === 0) {
        delete next[key];
      } else {
        const existing = current[key];
        next[key] = {
          menuItemId: existing?.menuItemId ?? key,
          options: existing?.options ?? [],
          quantity: clamped,
          note: existing?.note ?? null,
        };
      }
      return next;
    });
  }

  function addWithOptions(item: PublicMenuItem, options: string[]) {
    const key = cartLineKey(item.id, options);
    setCart((current) => ({
      ...current,
      [key]: {
        menuItemId: item.id,
        options,
        quantity: Math.min((current[key]?.quantity ?? 0) + 1, MAX_QUANTITY),
        note: current[key]?.note ?? null,
      },
    }));
    setPendingItem(null);
  }

  function reorderLast() {
    const next: Record<string, CartLine> = {};
    let skipped = false;
    for (const line of savedOrder) {
      const item = menuById.get(line.menuItemId);
      if (!item) {
        skipped = true;
        continue;
      }
      const validOptions = line.options.filter((id) =>
        item.options.some((group) => group.choices.some((choice) => choice.id === id))
      );
      if (validOptions.length !== line.options.length && hasRequiredOptions(item.options)) {
        skipped = true;
        continue;
      }
      next[cartLineKey(item.id, validOptions)] = { ...line, options: validOptions };
    }
    setCart(next);
    setReorderNotice(skipped ? t.reorderUnavailable : t.reorderAdded);
  }

  function setNote(id: string, note: string) {
    setCart((current) => {
      if (!current[id]) return current;
      return { ...current, [id]: { ...current[id], note: note.trim() ? note : null } };
    });
  }

  function addParsed(items: ParsedItem[]) {
    const needsOptions: PublicMenuItem[] = [];
    setCart((current) => {
      const next = { ...current };
      for (const item of items) {
        const menuItem = menuById.get(item.menuItemId);
        if (!menuItem) continue;
        if (hasRequiredOptions(menuItem.options)) {
          needsOptions.push(menuItem);
          continue;
        }
        const existing = next[item.menuItemId];
        next[item.menuItemId] = {
          menuItemId: item.menuItemId,
          options: [],
          quantity: Math.min((existing?.quantity ?? 0) + item.quantity, MAX_QUANTITY),
          note: item.note ?? existing?.note ?? null,
        };
      }
      return next;
    });
    if (needsOptions[0]) setPendingItem(needsOptions[0]);
  }

  async function shareRestaurant() {
    const url = window.location.href.split("?")[0];
    const text = t.shareMessage(restaurantName);

    if (navigator.share) {
      try {
        await navigator.share({ title: restaurantName, text, url });
        return;
      } catch {
        // User cancelled the native share sheet; fall through to clipboard copy.
      }
    }

    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2500);
    } catch {
      // Clipboard access can be blocked; nothing further we can do.
    }
  }

  return (
    <main lang={lang} dir={dir} className="min-h-screen bg-[#f8f9fb] text-black">
      {isDemo && (
        <p
          role="note"
          className="bg-orange-500 px-4 py-2 text-center text-sm font-bold text-black"
        >
          {DEMO_BANNER[lang]}
        </p>
      )}
      <header className="bg-black text-white px-5 pt-6 pb-6">
        <div className="max-w-xl mx-auto flex flex-col gap-4">
          <nav aria-label={t.languageLabel}>
            <ul className="flex flex-wrap gap-1" dir="ltr">
              {ORDER_LANGS.map((code) => {
                const active = code === lang;
                return (
                  <li key={code}>
                    <button
                      type="button"
                      lang={code}
                      onClick={() => chooseLang(code)}
                      aria-pressed={active}
                      className={`min-h-11 min-w-11 rounded-full px-3 text-sm font-bold ${
                        active
                          ? "bg-orange-500 text-black"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      {LANG_LABELS[code]}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex flex-col gap-1">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <Logo size="sm" className="text-orange-500" />
                <h1 className="text-3xl font-black text-balance break-words">
                  {restaurantName}
                </h1>
              </div>
              <button
                type="button"
                onClick={shareRestaurant}
                aria-label={t.shareButton}
                className="shrink-0 flex items-center gap-2 h-11 min-w-11 rounded-full border border-white/20 bg-white/10 px-3 text-sm font-bold text-white"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                <span className="hidden sm:inline">
                  {shareCopied ? t.shareCopied : t.shareButton}
                </span>
              </button>
            </div>
            <p className="text-sm text-gray-400">
              {table ? `${t.table(table)} · ${t.payAtCounter}` : t.payAtCounter}
            </p>
            {restaurantPhone && (
              <a
                href={`tel:${restaurantPhone}`}
                className="text-sm text-orange-500 font-semibold underline"
              >
                {t.contactPhone(restaurantPhone)}
              </a>
            )}
            {shareCopied && (
              <p className="text-xs font-semibold text-orange-400" role="status">
                {t.shareCopied}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto flex flex-col gap-6 px-4 pt-5 pb-40">
        {!acceptingOrders && (
          <div
            role="status"
            className="bg-amber-50 border border-amber-300 rounded-2xl p-4"
          >
            <p className="font-black text-amber-900">
              {availability === "closed"
                ? t.closedTitle
                : availability === "unavailable"
                  ? t.unavailableTitle
                  : t.pausedTitle}
            </p>
            <p className="text-sm text-amber-900/80 mt-1">
              {availability === "closed"
                ? t.closedText
                : availability === "unavailable"
                  ? t.unavailableText
                  : t.pausedText}
            </p>
            {availability === "closed" && opensLabel && (
              <p className="text-sm font-bold text-amber-900 mt-2">{opensLabel}</p>
            )}
          </div>
        )}

        {availability === "busy" && (
          <div
            role="status"
            className="bg-orange-50 border border-orange-300 rounded-2xl p-4 text-sm font-semibold text-orange-900"
          >
            {t.busyNotice}
          </div>
        )}

        {acceptingOrders && savedOrder.length > 0 && Object.keys(cart).length === 0 && (
          <button
            type="button"
            onClick={reorderLast}
            className="min-h-12 rounded-2xl border border-black bg-white px-4 py-3 font-bold"
          >
            {t.reorderButton}
          </button>
        )}

        {reorderNotice && (
          <p role="status" className="text-sm font-semibold text-gray-700">
            {reorderNotice}
          </p>
        )}

        {acceptingOrders && (
          <AiOrderBox
            restaurantId={restaurantId}
            t={t}
            lang={lang}
            showArabic={lang === "ar"}
            onItems={addParsed}
          />
        )}

        {menu.length === 0 ? (
          <div className="bg-white border rounded-2xl p-6 text-center">
            <p className="font-bold">{t.menuUnavailableTitle}</p>
            <p className="text-sm text-gray-500 mt-2">{t.menuUnavailableText}</p>
          </div>
        ) : (
          <div
            inert={!acceptingOrders}
            className={acceptingOrders ? undefined : "opacity-60"}
          >
            <MenuList
              menu={menu}
              cart={cart}
              t={t}
              showArabic={lang === "ar"}
              categoryAr={categoryAr}
              onSetQuantity={setQuantity}
              onSetNote={setNote}
              onPickOptions={setPendingItem}
              popularItemNames={popularItemNames}
            />
          </div>
        )}

        {showUpsell && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col gap-3">
            <p className="font-bold" dir="auto">
              {t.upsellTitle}
            </p>
            <ul className="flex gap-2 overflow-x-auto -mx-1 px-1" dir="ltr">
              {drinkItems.map((item) => {
                const label = lang === "ar" && item.nameAr ? item.nameAr : item.name;
                return (
                  <li key={item.id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        item.options.length > 0
                          ? setPendingItem(item)
                          : setQuantity(item.id, (cart[item.id]?.quantity ?? 0) + 1)
                      }
                      aria-label={t.add(label)}
                      className="flex items-center gap-2 h-11 rounded-full border border-amber-300 bg-white pl-4 pr-3 text-sm font-bold whitespace-nowrap"
                    >
                      <span dir="auto">{label}</span>
                      <span className="flex items-center justify-center size-6 rounded-full bg-black text-white text-base font-bold">
                        +
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <Cart
        restaurantId={restaurantId}
        table={table}
        cart={cart}
        menuById={menuById}
        t={t}
        lang={lang}
        dir={dir}
        showArabic={lang === "ar"}
        delivery={delivery}
        isDemo={isDemo}
        onSetQuantity={setQuantity}
        onOrdered={() => {
          setCart({});
          setReorderNotice("");
        }}
      />

      {pendingItem && (
        <OptionsSheet
          item={pendingItem}
          t={t}
          showArabic={lang === "ar"}
          onConfirm={(options) => addWithOptions(pendingItem, options)}
          onClose={() => setPendingItem(null)}
        />
      )}
    </main>
  );
}
