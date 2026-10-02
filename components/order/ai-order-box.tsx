"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import type { OrderStrings } from "../../lib/order-i18n";

export type ParsedItem = {
  menuItemId: string;
  quantity: number;
  note: string | null;
};

type SuggestionOption = {
  menuItemId: string;
  name: string;
  nameAr: string | null;
  priceCents: number;
};

type Suggestion = {
  query: string;
  quantity: number;
  note: string | null;
  options: SuggestionOption[];
};

type Props = {
  restaurantId: string;
  t: OrderStrings;
  showArabic: boolean;
  onItems: (items: ParsedItem[]) => void;
};

function formatChf(cents: number) {
  return `CHF ${(cents / 100).toFixed(2)}`;
}

export function AiOrderBox({ restaurantId, t, showArabic, onItems }: Props) {
  const labelFor = (option: SuggestionOption) =>
    showArabic && option.nameAr ? option.nameAr : option.name;
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const value = text.trim();
    if (!value || loading) return;

    setLoading(true);
    setError("");
    setMessage("");
    setSuggestions([]);

    try {
      const response = await fetch("/api/order-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, text: value }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(t.aiError);

      const items = (data.items || []) as ParsedItem[];
      const notFound = (data.notFound || []) as string[];
      const nextSuggestions = (data.suggestions || []) as Suggestion[];

      if (items.length > 0) onItems(items);
      setSuggestions(nextSuggestions);

      const parts: string[] = [];
      if (items.length > 0) {
        parts.push(t.aiAdded(items.length));
      }
      if (notFound.length > 0) {
        parts.push(t.aiNotFound(notFound.join(", ")));
      }
      if (parts.length === 0 && nextSuggestions.length === 0) {
        parts.push(t.aiNothing);
      }
      if (nextSuggestions.length === 0 && notFound.length === 0) {
        setText("");
      }
      setMessage(parts.join(" "));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.aiError);
    } finally {
      setLoading(false);
    }
  }

  function pickSuggestion(index: number, option: SuggestionOption) {
    const suggestion = suggestions[index];
    if (!suggestion) return;

    onItems([
      {
        menuItemId: option.menuItemId,
        quantity: suggestion.quantity,
        note: suggestion.note,
      },
    ]);

    const remaining = suggestions.filter((_, i) => i !== index);
    setSuggestions(remaining);
    setMessage(t.aiAddedOne(suggestion.quantity, labelFor(option)));
    if (remaining.length === 0) setText("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <section className="bg-white border-2 border-black rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="font-black">{t.aiTitle}</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          {t.aiExample}
        </p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <label htmlFor="ai-order" className="sr-only">
          {t.aiLabel}
        </label>
        <textarea
          id="ai-order"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={500}
          rows={2}
          placeholder={t.aiPlaceholder}
          dir="auto"
          className="w-full resize-none rounded-xl border bg-[#f8f9fb] p-3 text-base leading-relaxed outline-none focus:border-black"
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="min-h-11 rounded-xl bg-orange-500 px-4 py-3 font-bold text-black disabled:opacity-50"
        >
          {loading ? t.aiLoading : t.aiSubmit}
        </button>
      </form>

      {suggestions.map((suggestion, index) => (
        <div
          key={`${suggestion.query}-${index}`}
          className="flex flex-col gap-2 rounded-xl bg-[#f8f9fb] p-3"
        >
          <p className="text-sm leading-relaxed">
            <span className="font-bold">{t.didYouMean}</span>{" "}
            <span className="text-gray-500">
              {`«${suggestion.query}»`}
              {suggestion.quantity > 1 ? ` · ${suggestion.quantity}×` : ""}
            </span>
          </p>
          <ul className="flex flex-col gap-2">
            {suggestion.options.map((option) => (
              <li key={option.menuItemId}>
                <button
                  type="button"
                  onClick={() => pickSuggestion(index, option)}
                  className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border-2 border-black bg-white px-4 py-3 text-start"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="font-bold text-pretty" dir="auto">{labelFor(option)}</span>
                    {showArabic && option.nameAr && (
                      <span className="text-xs text-gray-400" dir="ltr" lang="de">
                        {option.name}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-sm font-bold" dir="ltr">
                    {formatChf(option.priceCents)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {message && (
        <p role="status" className="text-sm bg-[#f8f9fb] rounded-lg p-3">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 rounded-lg p-3">
          {error}
        </p>
      )}
    </section>
  );
}
