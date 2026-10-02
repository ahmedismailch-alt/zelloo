"use client";

import { useMemo, useState } from "react";
import type { PublicMenuItem } from "../../lib/supabase-server";
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
    <main className="min-h-screen bg-[#f8f9fb] text-black">
      <header className="bg-black text-white px-5 pt-8 pb-6">
        <div className="max-w-xl mx-auto flex flex-col gap-1">
          <p className="text-xs font-bold tracking-widest text-orange-500">
            ZELLOO
          </p>
          <h1 className="text-3xl font-black text-balance break-words">
            {restaurantName}
          </h1>
          <p className="text-sm text-gray-400">
            {table ? `Tisch ${table} · Bezahlung an der Kasse` : "Bezahlung an der Kasse"}
          </p>
        </div>
      </header>

      <div className="max-w-xl mx-auto flex flex-col gap-6 px-4 pt-5 pb-40">
        <AiOrderBox restaurantId={restaurantId} onItems={addParsed} />

        {menu.length === 0 ? (
          <div className="bg-white border rounded-2xl p-6 text-center">
            <p className="font-bold">Speisekarte noch nicht verfügbar</p>
            <p className="text-sm text-gray-500 mt-2">
              Bitte bestellen Sie direkt beim Personal.
            </p>
          </div>
        ) : (
          <MenuList menu={menu} cart={cart} onSetQuantity={setQuantity} />
        )}
      </div>

      <Cart
        restaurantId={restaurantId}
        table={table}
        cart={cart}
        menuById={menuById}
        onSetQuantity={setQuantity}
        onOrdered={() => setCart({})}
      />
    </main>
  );
}
