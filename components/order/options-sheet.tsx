"use client";

import { useEffect, useRef, useState } from "react";
import type { OrderStrings } from "../../lib/order-i18n";
import { resolveSelection, type OptionGroup } from "../../lib/menu-options";
import { getMenuItemFallbackImage } from "../../lib/menu-item-fallback-image";
import type { PublicMenuItem } from "../../lib/supabase-server";
import { formatChf } from "./format";

const MAX_QUANTITY = 20;
const MAX_NOTE_LENGTH = 200;

export type OptionsConfirm = {
  options: string[];
  note: string | null;
  quantity: number;
  extras: { itemId: string; quantity: number }[];
};

type Props = {
  item: PublicMenuItem;
  drinks: PublicMenuItem[];
  t: OrderStrings;
  showArabic: boolean;
  onConfirm: (result: OptionsConfirm) => void;
  onClose: () => void;
};

function groupHint(group: OptionGroup, t: OrderStrings) {
  if (!group.multiple) return t.pickOne;
  return group.maxSelect ? t.pickUpTo(group.maxSelect) : t.pickAny;
}

export function OptionsSheet({
  item,
  drinks,
  t,
  showArabic,
  onConfirm,
  onClose,
}: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [drinkQuantities, setDrinkQuantities] = useState<Record<string, number>>({});
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const resolved = resolveSelection(item.options, selected);
  const unitCents = item.priceCents + (resolved.ok ? resolved.extraCents : 0);
  const drinksCents = drinks.reduce(
    (sum, drink) => sum + (drinkQuantities[drink.id] ?? 0) * drink.priceCents,
    0
  );
  const totalCents = unitCents * quantity + drinksCents;
  const nameOf = (entry: PublicMenuItem) =>
    showArabic && entry.nameAr ? entry.nameAr : entry.name;
  const title = nameOf(item);
  const hasPhoto = Boolean(item.imageUrl);

  function toggle(group: OptionGroup, choiceId: string) {
    setSelected((current) => {
      const groupChoiceIds = new Set(group.choices.map((choice) => choice.id));
      const has = current.includes(choiceId);

      if (group.multiple) {
        if (has) return current.filter((id) => id !== choiceId);
        const inGroup = current.filter((id) => groupChoiceIds.has(id)).length;
        if (group.maxSelect && inGroup >= group.maxSelect) return current;
        return [...current, choiceId];
      }
      const withoutGroup = current.filter((id) => !groupChoiceIds.has(id));
      if (has && !group.required) return withoutGroup;
      return [...withoutGroup, choiceId];
    });
  }

  function setDrinkQuantity(id: string, next: number) {
    setDrinkQuantities((current) => ({
      ...current,
      [id]: Math.min(Math.max(next, 0), MAX_QUANTITY),
    }));
  }

  function confirm() {
    if (!resolved.ok) return;
    onConfirm({
      options: selected,
      note: note.trim() ? note.trim() : null,
      quantity,
      extras: Object.entries(drinkQuantities)
        .filter(([, count]) => count > 0)
        .map(([itemId, count]) => ({ itemId, quantity: count })),
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[94vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl bg-white"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t.closeCart}
          className="absolute start-3 top-3 z-10 flex size-11 items-center justify-center rounded-full bg-white text-2xl font-bold shadow-md"
        >
          <span aria-hidden="true">×</span>
        </button>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {hasPhoto && (
            <img
              src={item.imageUrl as string}
              alt=""
              className="h-56 w-full object-cover"
            />
          )}

          <div className={`px-5 pb-4 ${hasPhoto ? "pt-5" : "pt-16"}`}>
            <h2 className="text-2xl font-black break-words" dir="auto">
              {title}
            </h2>
            <p className="mt-1 text-lg font-bold" dir="ltr">
              {formatChf(item.priceCents)}
            </p>
          </div>

          {item.options.map((group) => {
            const pickedInGroup = group.choices.filter((choice) =>
              selected.includes(choice.id)
            ).length;
            const limitReached =
              group.multiple && !!group.maxSelect && pickedInGroup >= group.maxSelect;
            return (
              <fieldset
                key={group.id}
                className="border-t-8 border-gray-100 px-5 pb-2 pt-5"
              >
                <legend className="sr-only">{group.name}</legend>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-xl font-black break-words" dir="auto">
                      {group.name}
                    </h3>
                    <p className="text-sm text-gray-500">{groupHint(group, t)}</p>
                  </div>
                  {group.required && (
                    <span className="shrink-0 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-bold">
                      {t.requiredOption}
                    </span>
                  )}
                </div>

                <ul className="mt-2">
                  {group.choices.map((choice) => {
                    const checked = selected.includes(choice.id);
                    const disabled = !checked && limitReached;
                    return (
                      <li key={choice.id} className="border-b border-gray-200 last:border-b-0">
                        <label
                          className={`flex min-h-14 cursor-pointer items-center justify-between gap-3 py-3 ${
                            disabled ? "opacity-40" : ""
                          }`}
                        >
                          <span className="min-w-0 flex flex-col">
                            <span className="break-words" dir="auto">
                              {choice.name}
                            </span>
                            {choice.priceCents > 0 && (
                              <span className="text-sm text-gray-600" dir="ltr">
                                +{formatChf(choice.priceCents)}
                              </span>
                            )}
                          </span>
                          <input
                            type={group.multiple ? "checkbox" : "radio"}
                            name={group.id}
                            checked={checked}
                            disabled={disabled}
                            onChange={() => toggle(group, choice.id)}
                            className={`size-6 shrink-0 accent-black ${
                              group.multiple ? "rounded" : ""
                            }`}
                          />
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            );
          })}

          <div className="border-t-8 border-gray-100 px-5 pb-5 pt-5">
            <label htmlFor="options-note" className="text-xl font-black">
              {t.noteLabel}
            </label>
            <textarea
              id="options-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={MAX_NOTE_LENGTH}
              rows={3}
              placeholder={t.notePlaceholder}
              dir="auto"
              className="mt-3 w-full resize-none rounded-xl bg-gray-100 p-4 text-base"
            />
            <p className="mt-2 text-sm text-gray-500">{t.extraCostNote}</p>

            <div
              className="mt-4 inline-flex items-center rounded-full bg-gray-100"
              dir="ltr"
            >
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(current - 1, 1))}
                disabled={quantity <= 1}
                aria-label={t.remove(title)}
                className="flex size-12 items-center justify-center text-2xl font-bold disabled:opacity-30"
              >
                {"−"}
              </button>
              <span className="w-8 text-center text-lg font-black" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((current) => Math.min(current + 1, MAX_QUANTITY))
                }
                disabled={quantity >= MAX_QUANTITY}
                aria-label={t.add(title)}
                className="flex size-12 items-center justify-center text-2xl font-bold disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>

          {drinks.length > 0 && (
            <section className="border-t-8 border-gray-100 px-5 pb-6 pt-5">
              <h3 className="text-xl font-black">{t.drinksTitle}</h3>
              <ul className="mt-2">
                {drinks.map((drink) => {
                  const count = drinkQuantities[drink.id] ?? 0;
                  const drinkName = nameOf(drink);
                  return (
                    <li
                      key={drink.id}
                      className="flex items-center gap-3 border-b border-gray-200 py-3 last:border-b-0"
                    >
                      <img
                        src={drink.imageUrl || getMenuItemFallbackImage(drink.category)}
                        alt=""
                        className="size-16 shrink-0 rounded-xl border object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold break-words" dir="auto">
                          {drinkName}
                        </p>
                        <p className="text-sm text-gray-600" dir="ltr">
                          {formatChf(drink.priceCents)}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1" dir="ltr">
                        {count > 0 && (
                          <>
                            <button
                              type="button"
                              onClick={() => setDrinkQuantity(drink.id, count - 1)}
                              aria-label={t.remove(drinkName)}
                              className="flex size-11 items-center justify-center rounded-full bg-gray-100 text-xl font-bold"
                            >
                              {"−"}
                            </button>
                            <span className="w-6 text-center font-black">{count}</span>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => setDrinkQuantity(drink.id, count + 1)}
                          aria-label={t.add(drinkName)}
                          className="flex size-11 items-center justify-center rounded-full bg-white text-xl font-bold shadow-md ring-1 ring-black/5"
                        >
                          +
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t bg-white px-5 pb-6 pt-3">
          {!resolved.ok && (
            <p role="status" className="text-sm text-amber-800">
              {t.optionsMissingError}
            </p>
          )}
          <button
            type="button"
            disabled={!resolved.ok}
            onClick={confirm}
            className="min-h-14 rounded-xl bg-orange-500 px-4 py-3 text-base font-black text-black disabled:opacity-50"
          >
            <span dir="ltr">{t.addQtyToCart(quantity, formatChf(totalCents))}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
