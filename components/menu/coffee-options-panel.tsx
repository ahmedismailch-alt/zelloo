"use client";

import { useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { OptionGroup } from "../../lib/menu-options";

type TemplateChoice = { id: string; name: string; price: string };
type TemplateGroup = {
  id: string;
  name: string;
  hint: string;
  required: boolean;
  multiple: boolean;
  enabled: boolean;
  choices: TemplateChoice[];
};

const INITIAL_GROUPS: TemplateGroup[] = [
  {
    id: "kaffee-groesse",
    name: "Grösse",
    hint: "Gast wählt eine Grösse (Pflicht)",
    required: true,
    multiple: false,
    enabled: true,
    choices: [
      { id: "kaffee-groesse-klein", name: "Klein", price: "0" },
      { id: "kaffee-groesse-mittel", name: "Mittel", price: "0.50" },
      { id: "kaffee-groesse-gross", name: "Gross", price: "1.00" },
    ],
  },
  {
    id: "kaffee-milch",
    name: "Milch",
    hint: "Optional, eine Milchsorte",
    required: false,
    multiple: false,
    enabled: true,
    choices: [
      { id: "kaffee-milch-hafer", name: "Hafermilch", price: "0.50" },
      { id: "kaffee-milch-soja", name: "Sojamilch", price: "0.50" },
      { id: "kaffee-milch-mandel", name: "Mandelmilch", price: "0.50" },
    ],
  },
  {
    id: "kaffee-extras",
    name: "Extras",
    hint: "Optional, mehrere möglich",
    required: false,
    multiple: true,
    enabled: true,
    choices: [
      { id: "kaffee-extras-shot", name: "Extra Shot", price: "1.00" },
      { id: "kaffee-extras-sirup", name: "Sirup", price: "0.50" },
      { id: "kaffee-extras-zucker", name: "Zucker", price: "0" },
    ],
  },
];

type Props = {
  categories: string[];
  items: Array<{ id: string; category: string | null }>;
  onApplied: (updated: Array<{ id: string; options: OptionGroup[] }>) => void;
};

function priceToCents(value: string) {
  const parsed = Number(value.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}

export function CoffeeOptionsPanel({ categories, items, onApplied }: Props) {
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<TemplateGroup[]>(INITIAL_GROUPS);
  const [category, setCategory] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");

  const targetIds = useMemo(
    () =>
      items
        .filter((item) => (item.category?.trim() || "") === category)
        .map((item) => item.id),
    [items, category]
  );
  const enabledGroups = groups.filter((group) => group.enabled);

  function updateGroup(groupId: string, patch: Partial<TemplateGroup>) {
    setConfirming(false);
    setGroups((current) =>
      current.map((group) =>
        group.id === groupId ? { ...group, ...patch } : group
      )
    );
  }

  function updatePrice(groupId: string, choiceId: string, price: string) {
    setConfirming(false);
    setGroups((current) =>
      current.map((group) =>
        group.id === groupId
          ? {
              ...group,
              choices: group.choices.map((choice) =>
                choice.id === choiceId ? { ...choice, price } : choice
              ),
            }
          : group
      )
    );
  }

  async function apply() {
    const payload: OptionGroup[] = [];
    for (const group of enabledGroups) {
      const choices = [];
      for (const choice of group.choices) {
        const cents = priceToCents(choice.price);
        if (cents === null) {
          setMessage(`Ungültiger Preis bei «${choice.name}».`);
          setConfirming(false);
          return;
        }
        choices.push({ id: choice.id, name: choice.name, priceCents: cents });
      }
      payload.push({
        id: group.id,
        name: group.name,
        required: group.required,
        multiple: group.multiple,
        choices,
      });
    }

    setApplying(true);
    setMessage("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Nicht angemeldet.");

      const response = await fetch("/api/menu-bulk-options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ itemIds: targetIds, groups: payload }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Optionen konnten nicht gespeichert werden.");
      }

      onApplied(data.updated || []);
      setMessage(
        `Optionen wurden bei ${(data.updated || []).length} Artikeln in «${category}» gespeichert.`
      );
      setConfirming(false);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Optionen konnten nicht gespeichert werden."
      );
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="border rounded-xl bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="w-full min-h-11 flex items-center justify-between gap-3 px-4 py-3 text-left font-bold"
      >
        <span>Kaffee-Optionen hinzufügen</span>
        <span aria-hidden="true" className="text-gray-500">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="flex flex-col gap-4 px-4 pb-4">
          <p className="text-sm text-gray-500">
            Grösse, Milch und Extras für alle Artikel einer Kategorie in einem
            Schritt. Preise sind Aufpreise in CHF und können Sie anpassen.
          </p>

          {groups.map((group) => (
            <fieldset
              key={group.id}
              className="flex flex-col gap-2 border rounded-xl p-3"
            >
              <legend className="sr-only">{group.name}</legend>
              <label className="flex items-center gap-3 min-h-11 font-bold">
                <input
                  type="checkbox"
                  checked={group.enabled}
                  onChange={(e) =>
                    updateGroup(group.id, { enabled: e.target.checked })
                  }
                  className="size-5"
                />
                <span className="flex flex-col">
                  {group.name}
                  <span className="text-xs font-normal text-gray-500">
                    {group.hint}
                  </span>
                </span>
              </label>

              {group.enabled && (
                <div className="flex flex-col gap-2">
                  {group.choices.map((choice) => (
                    <div
                      key={choice.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-sm font-semibold">
                        {choice.name}
                      </span>
                      <label className="flex items-center gap-2 text-sm">
                        <span className="sr-only">
                          Aufpreis {choice.name} in CHF
                        </span>
                        <span aria-hidden="true">+ CHF</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={choice.price}
                          onChange={(e) =>
                            updatePrice(group.id, choice.id, e.target.value)
                          }
                          className="w-20 border rounded-lg px-3 py-2 text-base min-h-11 text-right"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </fieldset>
          ))}

          <div className="flex flex-col gap-2">
            <label htmlFor="coffee-options-category" className="text-sm font-bold">
              Auf welche Kategorie anwenden?
            </label>
            <select
              id="coffee-options-category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setConfirming(false);
                setMessage("");
              }}
              className="w-full border rounded-xl px-4 py-3 text-base min-h-11 bg-white"
            >
              <option value="">Kategorie wählen</option>
              {categories.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {category && enabledGroups.length > 0 && !confirming && (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={targetIds.length === 0}
              className="w-full min-h-11 rounded-xl border-2 border-black font-bold px-4 disabled:opacity-50"
            >
              Auf {targetIds.length} Artikel in «{category}» anwenden
            </button>
          )}

          {category && enabledGroups.length > 0 && confirming && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">
                {enabledGroups.map((group) => group.name).join(", ")} bei{" "}
                {targetIds.length} Artikeln hinzufügen? Gleiche Optionen werden
                ersetzt, andere bleiben erhalten.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={applying}
                  onClick={apply}
                  className="flex-1 min-h-11 rounded-xl bg-black text-white font-bold px-4 disabled:opacity-50"
                >
                  {applying ? "Speichere..." : "Ja, anwenden"}
                </button>
                <button
                  type="button"
                  disabled={applying}
                  onClick={() => setConfirming(false)}
                  className="flex-1 min-h-11 rounded-xl border font-bold px-4"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}

          {message && (
            <p role="status" className="text-sm font-semibold">
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
