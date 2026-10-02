"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";

export type ParsedItem = {
  menuItemId: string;
  quantity: number;
  note: string | null;
};

type Props = {
  restaurantId: string;
  onItems: (items: ParsedItem[]) => void;
};

export function AiOrderBox({ restaurantId, onItems }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const value = text.trim();
    if (!value || loading) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/order-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, text: value }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Fehler");

      const items = (data.items || []) as ParsedItem[];
      const notFound = (data.notFound || []) as string[];

      onItems(items);

      const parts: string[] = [];
      if (items.length > 0) {
        parts.push(`${items.length} Artikel zum Warenkorb hinzugefügt.`);
        setText("");
      }
      if (notFound.length > 0) {
        parts.push(`Nicht gefunden: ${notFound.join(", ")}`);
      }
      if (parts.length === 0) {
        parts.push("Keine passenden Artikel gefunden. Bitte anders formulieren.");
      }
      setMessage(parts.join(" "));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Bestellung konnte nicht verstanden werden."
      );
    } finally {
      setLoading(false);
    }
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
        <h2 className="font-black">Einfach schreiben, was Sie möchten</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          {"Zum Beispiel: «2 Cappuccino und ein Gipfeli»"}
        </p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <label htmlFor="ai-order" className="sr-only">
          Bestellung in eigenen Worten
        </label>
        <textarea
          id="ai-order"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={500}
          rows={2}
          placeholder="Ich hätte gerne..."
          className="w-full resize-none rounded-xl border bg-[#f8f9fb] p-3 text-base leading-relaxed outline-none focus:border-black"
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="min-h-11 rounded-xl bg-orange-500 px-4 py-3 font-bold text-black disabled:opacity-50"
        >
          {loading ? "Wird verstanden..." : "Zum Warenkorb hinzufügen"}
        </button>
      </form>

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
