"use client";

import { useEffect, useRef, useState } from "react";
import type { OrderStrings } from "../../lib/order-i18n";
import { resolveSelection } from "../../lib/menu-options";
import type { PublicMenuItem } from "../../lib/supabase-server";
import { formatChf } from "./format";

type Props = {
  item: PublicMenuItem;
  t: OrderStrings;
  showArabic: boolean;
  onConfirm: (optionIds: string[]) => void;
  onClose: () => void;
};

export function OptionsSheet({ item, t, showArabic, onConfirm, onClose }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const resolved = resolveSelection(item.options, selected);
  const total = item.priceCents + (resolved.ok ? resolved.extraCents : 0);
  const title = showArabic && item.nameAr ? item.nameAr : item.name;

  function toggle(groupId: string, choiceId: string, multiple: boolean, required: boolean) {
    setSelected((current) => {
      const group = item.options.find((entry) => entry.id === groupId);
      if (!group) return current;
      const groupChoiceIds = new Set(group.choices.map((choice) => choice.id));
      const has = current.includes(choiceId);

      if (multiple) {
        return has
          ? current.filter((id) => id !== choiceId)
          : [...current, choiceId];
      }
      const withoutGroup = current.filter((id) => !groupChoiceIds.has(id));
      if (has && !required) return withoutGroup;
      return [...withoutGroup, choiceId];
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.chooseOptions}
        className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-t-3xl bg-white"
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b">
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-widest text-orange-600">
              {t.chooseOptions}
            </p>
            <h2 className="text-xl font-black break-words" dir="auto">
              {title}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t.closeCart}
            className="shrink-0 size-11 rounded-full border text-xl font-bold flex items-center justify-center"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
          {item.options.map((group) => (
            <fieldset key={group.id} className="flex flex-col gap-2">
              <legend className="flex items-center gap-2 font-bold" dir="auto">
                {group.name}
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    group.required
                      ? "bg-orange-100 text-orange-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {group.required ? t.requiredOption : t.optionalOption}
                </span>
              </legend>
              <p className="text-xs text-gray-500">
                {group.multiple ? t.pickAny : t.pickOne}
              </p>
              <ul className="flex flex-col gap-2">
                {group.choices.map((choice) => {
                  const checked = selected.includes(choice.id);
                  return (
                    <li key={choice.id}>
                      <label
                        className={`flex min-h-12 items-center justify-between gap-3 rounded-xl border px-4 py-2 cursor-pointer ${
                          checked ? "border-black bg-gray-50" : "border-gray-300"
                        }`}
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <input
                            type={group.multiple ? "checkbox" : "radio"}
                            name={group.id}
                            checked={checked}
                            onChange={() =>
                              toggle(group.id, choice.id, group.multiple, group.required)
                            }
                            className="size-5 accent-black"
                          />
                          <span className="break-words" dir="auto">
                            {choice.name}
                          </span>
                        </span>
                        {choice.priceCents > 0 && (
                          <span className="shrink-0 text-sm font-semibold" dir="ltr">
                            +{formatChf(choice.priceCents)}
                          </span>
                        )}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          ))}
        </div>

        <div className="border-t px-5 pt-3 pb-6 flex flex-col gap-2">
          {!resolved.ok && (
            <p role="status" className="text-sm text-amber-800">
              {t.optionsMissingError}
            </p>
          )}
          <button
            type="button"
            disabled={!resolved.ok}
            onClick={() => onConfirm(selected)}
            className="min-h-12 rounded-xl bg-orange-500 px-4 py-3 font-black text-black disabled:opacity-50"
          >
            <span dir="ltr">{t.addToCart(formatChf(total))}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
