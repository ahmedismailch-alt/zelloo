"use client";

import type { OrderStrings } from "../../lib/order-i18n";
import type { PublicMenuItem } from "../../lib/supabase-server";
import type { CartLine } from "./cart";
import { formatChf } from "./format";

type Props = {
  menu: PublicMenuItem[];
  cart: Record<string, CartLine>;
  t: OrderStrings;
  onSetQuantity: (id: string, quantity: number) => void;
};

export function MenuList({ menu, cart, t, onSetQuantity }: Props) {
  const groups = new Map<string, PublicMenuItem[]>();
  for (const item of menu) {
    const key = item.category?.trim() || "";
    groups.set(key, [...(groups.get(key) || []), item]);
  }

  return (
    <section aria-label={t.menuLabel} className="flex flex-col gap-6">
      {[...groups.entries()].map(([category, items]) => (
        <div key={category || "__other"} className="flex flex-col gap-3">
          <h2 className="text-lg font-black">{category || t.otherCategory}</h2>
          <ul className="flex flex-col gap-2">
            {items.map((item) => {
              const quantity = cart[item.id]?.quantity ?? 0;
              return (
                <li
                  key={item.id}
                  className="bg-white border rounded-2xl p-4 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex flex-col gap-1" dir="auto">
                    <p className="font-bold break-words" dir="auto">{item.name}</p>
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
                      aria-label={t.add(item.name)}
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
                        aria-label={t.remove(item.name)}
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
                        aria-label={t.add(item.name)}
                        className="size-11 rounded-full bg-black/10 text-xl font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
