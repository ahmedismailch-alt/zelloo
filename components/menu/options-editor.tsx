"use client";

import { useState } from "react";
import type { OptionGroup } from "../../lib/menu-options";

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatPrice(cents: number) {
  return cents > 0 ? (cents / 100).toFixed(2) : "";
}

export function OptionsEditor({
  value,
  onChange,
}: {
  value: OptionGroup[];
  onChange: (groups: OptionGroup[]) => void;
}) {
  const [open, setOpen] = useState(value.length > 0);

  function updateGroup(groupId: string, patch: Partial<OptionGroup>) {
    onChange(value.map((g) => (g.id === groupId ? { ...g, ...patch } : g)));
  }

  function updateChoice(
    groupId: string,
    choiceId: string,
    patch: Partial<OptionGroup["choices"][number]>
  ) {
    onChange(
      value.map((g) =>
        g.id === groupId
          ? {
              ...g,
              choices: g.choices.map((c) => (c.id === choiceId ? { ...c, ...patch } : c)),
            }
          : g
      )
    );
  }

  function addGroup(preset?: { name: string; required: boolean; names: string[] }) {
    if (value.length >= 6) return;
    const choices = (preset?.names ?? ["", ""]).map((name) => ({
      id: newId("c"),
      name,
      priceCents: 0,
    }));
    onChange([
      ...value,
      {
        id: newId("g"),
        name: preset?.name ?? "",
        required: preset?.required ?? false,
        multiple: false,
        choices,
      },
    ]);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full min-h-11 rounded-xl border border-dashed border-gray-400 px-4 text-sm font-bold"
      >
        Grössen, Extras und Saucen hinzufügen
      </button>
    );
  }

  return (
    <fieldset className="flex flex-col gap-3 rounded-xl border p-3">
      <legend className="px-1 text-sm font-bold">Optionen</legend>

      {value.map((group) => (
        <div key={group.id} className="flex flex-col gap-2 rounded-xl bg-gray-50 p-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-600">Gruppenname</span>
            <input
              value={group.name}
              onChange={(e) => updateGroup(group.id, { name: e.target.value })}
              maxLength={40}
              placeholder="z. B. Grösse, Extras, Sauce"
              className="min-h-11 rounded-lg border border-gray-300 px-3 text-base"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={group.required}
              onClick={() => updateGroup(group.id, { required: !group.required })}
              className={`min-h-11 rounded-lg border px-3 text-sm font-semibold ${
                group.required ? "bg-black text-white" : "bg-white"
              }`}
            >
              {group.required ? "Pflichtauswahl" : "Optional"}
            </button>
            <button
              type="button"
              role="switch"
              aria-checked={group.multiple}
              onClick={() => updateGroup(group.id, { multiple: !group.multiple })}
              className={`min-h-11 rounded-lg border px-3 text-sm font-semibold ${
                group.multiple ? "bg-black text-white" : "bg-white"
              }`}
            >
              {group.multiple ? "Mehrfach wählbar" : "Eine Auswahl"}
            </button>
          </div>

          <ul className="flex flex-col gap-2">
            {group.choices.map((choice) => (
              <li key={choice.id} className="flex items-center gap-2">
                <input
                  value={choice.name}
                  onChange={(e) => updateChoice(group.id, choice.id, { name: e.target.value })}
                  maxLength={40}
                  aria-label="Name der Auswahl"
                  placeholder="Name"
                  className="min-h-11 min-w-0 flex-1 rounded-lg border border-gray-300 px-3 text-base"
                />
                <input
                  defaultValue={formatPrice(choice.priceCents)}
                  onBlur={(e) => {
                    const parsed = Number(e.target.value.replace(",", "."));
                    updateChoice(group.id, choice.id, {
                      priceCents:
                        Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) : 0,
                    });
                  }}
                  inputMode="decimal"
                  aria-label="Aufpreis in CHF"
                  placeholder="+ CHF"
                  className="min-h-11 w-24 rounded-lg border border-gray-300 px-3 text-base"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateGroup(group.id, {
                      choices: group.choices.filter((c) => c.id !== choice.id),
                    })
                  }
                  aria-label="Auswahl entfernen"
                  className="min-h-11 min-w-11 rounded-lg border bg-white font-bold"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                updateGroup(group.id, {
                  choices: [...group.choices, { id: newId("c"), name: "", priceCents: 0 }].slice(
                    0,
                    20
                  ),
                })
              }
              className="min-h-11 flex-1 rounded-lg border bg-white text-sm font-bold"
            >
              Auswahl hinzufügen
            </button>
            <button
              type="button"
              onClick={() => onChange(value.filter((g) => g.id !== group.id))}
              className="min-h-11 rounded-lg border bg-white px-3 text-sm font-bold text-red-700"
            >
              Gruppe löschen
            </button>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            addGroup({ name: "Grösse", required: true, names: ["Klein", "Gross"] })
          }
          className="min-h-11 rounded-lg border px-3 text-sm font-bold"
        >
          Grösse
        </button>
        <button
          type="button"
          onClick={() => addGroup({ name: "Extras", required: false, names: ["Extra Käse"] })}
          className="min-h-11 rounded-lg border px-3 text-sm font-bold"
        >
          Extras
        </button>
        <button
          type="button"
          onClick={() =>
            addGroup({ name: "Sauce", required: true, names: ["Knoblauch", "Scharf"] })
          }
          className="min-h-11 rounded-lg border px-3 text-sm font-bold"
        >
          Sauce
        </button>
        <button
          type="button"
          onClick={() => addGroup()}
          className="min-h-11 rounded-lg border px-3 text-sm font-bold"
        >
          Eigene Gruppe
        </button>
      </div>
    </fieldset>
  );
}
