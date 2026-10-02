"use client";

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
import { Cart, type CartLine } from "./cart";
import { MenuList } from "./menu-list";

const MAX_QUANTITY = 20;

type Props = {
  restaurantId: string;
  restaurantName: string;
  table: string | null;
  menu: PublicMenuItem[];
};

export function OrderApp({ restaurantId, restaurantName, table, menu }: Props) {
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [lang, setLang] = useState<OrderLang>("de");

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

  const menuById = useMemo(
    () => new Map(menu.map((item) => [item.id, item])),
    [menu]
  );

  function setQuantity(id: string, quantity: number) {
    setCart((current) => {
      const next = { ...current };
      const clamped = Math.min(Math.max(quantity, 0), MAX_QUANTITY);
      if (clamped === 0) {
        delete next[id];
      } else {
        next[id] = { quantity: clamped, note: current[id]?.note ?? null };
      }
      return next;
    });
  }

  function addParsed(items: ParsedItem[]) {
    setCart((current) => {
      const next = { ...current };
      for (const item of items) {
        if (!menuById.has(item.menuItemId)) continue;
        const existing = next[item.menuItemId];
        next[item.menuItemId] = {
          quantity: Math.min((existing?.quantity ?? 0) + item.quantity, MAX_QUANTITY),
          note: item.note ?? existing?.note ?? null,
        };
      }
      return next;
    });
  }

  return (
    <main lang={lang} dir={dir} className="min-h-screen bg-[#f8f9fb] text-black">
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
            <p className="text-xs font-bold tracking-widest text-orange-500" dir="ltr">
              ZELLOO
            </p>
            <h1 className="text-3xl font-black text-balance break-words">
              {restaurantName}
            </h1>
            <p className="text-sm text-gray-400">
              {table ? `${t.table(table)} · ${t.payAtCounter}` : t.payAtCounter}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto flex flex-col gap-6 px-4 pt-5 pb-40">
        <AiOrderBox
          restaurantId={restaurantId}
          t={t}
          lang={lang}
          showArabic={lang === "ar"}
          onItems={addParsed}
        />

        {menu.length === 0 ? (
          <div className="bg-white border rounded-2xl p-6 text-center">
            <p className="font-bold">{t.menuUnavailableTitle}</p>
            <p className="text-sm text-gray-500 mt-2">{t.menuUnavailableText}</p>
          </div>
        ) : (
          <MenuList
            menu={menu}
            cart={cart}
            t={t}
            showArabic={lang === "ar"}
            onSetQuantity={setQuantity}
          />
        )}
      </div>

      <Cart
        restaurantId={restaurantId}
        table={table}
        cart={cart}
        menuById={menuById}
        t={t}
        dir={dir}
        showArabic={lang === "ar"}
        onSetQuantity={setQuantity}
        onOrdered={() => setCart({})}
      />
    </main>
  );
}
