export type OptionChoice = { id: string; name: string; priceCents: number };

export type OptionGroup = {
  id: string;
  name: string;
  required: boolean;
  multiple: boolean;
  choices: OptionChoice[];
};

const MAX_GROUPS = 6;
const MAX_CHOICES = 20;

function cleanName(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// Sanitises whatever is stored in menu_items.options so the rest of the app
// can rely on the shape. Choice ids are unique across all groups.
export function parseOptionGroups(value: unknown): OptionGroup[] {
  if (!Array.isArray(value)) return [];

  const usedChoiceIds = new Set<string>();
  const groups: OptionGroup[] = [];

  for (const rawGroup of value.slice(0, MAX_GROUPS)) {
    if (!rawGroup || typeof rawGroup !== "object") continue;
    const group = rawGroup as Record<string, unknown>;
    const name = cleanName(group.name, 40);
    const id = cleanName(group.id, 40);
    if (!name || !id || !Array.isArray(group.choices)) continue;

    const choices: OptionChoice[] = [];
    for (const rawChoice of group.choices.slice(0, MAX_CHOICES)) {
      if (!rawChoice || typeof rawChoice !== "object") continue;
      const choice = rawChoice as Record<string, unknown>;
      const choiceName = cleanName(choice.name, 40);
      const choiceId = cleanName(choice.id, 40);
      const cents = Number(choice.priceCents);
      if (!choiceName || !choiceId || usedChoiceIds.has(choiceId)) continue;
      if (!Number.isInteger(cents) || cents < 0 || cents > 100000) continue;
      usedChoiceIds.add(choiceId);
      choices.push({ id: choiceId, name: choiceName, priceCents: cents });
    }

    if (choices.length === 0) continue;
    groups.push({
      id,
      name,
      required: group.required === true,
      multiple: group.multiple === true,
      choices,
    });
  }

  return groups;
}

export function optionsKey(choiceIds: string[]) {
  return [...choiceIds].sort().join(",");
}

export function hasRequiredOptions(groups: OptionGroup[]) {
  return groups.some((group) => group.required);
}

type Resolved =
  | { ok: true; choices: OptionChoice[]; extraCents: number }
  | { ok: false };

// Validates a customer's selection against the menu item's option groups.
// The price is always computed from the stored choices, never from the client.
export function resolveSelection(
  groups: OptionGroup[],
  selectedIds: string[]
): Resolved {
  const selected = new Set(selectedIds);
  const choices: OptionChoice[] = [];
  let matched = 0;

  for (const group of groups) {
    const picked = group.choices.filter((choice) => selected.has(choice.id));
    matched += picked.length;
    if (group.required && picked.length === 0) return { ok: false };
    if (!group.multiple && picked.length > 1) return { ok: false };
    choices.push(...picked);
  }

  if (matched !== selected.size) return { ok: false };

  return {
    ok: true,
    choices,
    extraCents: choices.reduce((sum, choice) => sum + choice.priceCents, 0),
  };
}

export function formatItemNameWithOptions(name: string, choices: OptionChoice[]) {
  return choices.length > 0
    ? `${name} (${choices.map((choice) => choice.name).join(", ")})`
    : name;
}
