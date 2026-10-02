"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { OrderStrings } from "../../lib/order-i18n";
import type { PublicMenuItem } from "../../lib/supabase-server";
import { formatChf } from "./format";

export type CartLine = { quantity: number; note: string | null };

type OrderStatus =
  | "new"
  | "accepted"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

const STATUS_POLL_MS = 10000;

const progressSteps = ["new", "accepted", "preparing", "ready"] as const;

function statusHeadline(status: OrderStatus, t: OrderStrings) {
  switch (status) {
    case "accepted":
    case "preparing":
    case "ready":
    case "cancelled":
      return t.headline[status];
    case "completed":
      return t.headline.ready;
    default:
      return t.headline.new;
  }
}

type Props = {
  restaurantId: string;
  table: string | null;
  cart: Record<string, CartLine>;
  menuById: Map<string, PublicMenuItem>;
  t: OrderStrings;
  dir: "ltr" | "rtl";
  onSetQuantity: (id: string, quantity: number) => void;
  onOrdered: () => void;
};

export function Cart({
  restaurantId,
  table,
  cart,
  menuById,
  t,
  dir,
  onSetQuantity,
  onOrdered,
}: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState<{ id: string; totalCents: number } | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("new");

  const confirmedId = confirmed?.id;

  useEffect(() => {
    if (!confirmedId) return;

    let cancelled = false;
    let timer: number | undefined;

    async function poll() {
      try {
        const response = await fetch(
          `/api/orders/${encodeURIComponent(confirmedId!)}?restaurant=${encodeURIComponent(restaurantId)}`,
          { cache: "no-store" }
        );
        if (response.ok) {
          const data = (await response.json()) as { status: OrderStatus };
          if (cancelled) return;
          setOrderStatus(data.status);
          if (data.status === "completed" || data.status === "cancelled") {
            return;
          }
        }
      } catch {
        // Network hiccup: keep the last known status and try again.
      }
      if (!cancelled) timer = window.setTimeout(poll, STATUS_POLL_MS);
    }

    timer = window.setTimeout(poll, STATUS_POLL_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [confirmedId, restaurantId]);

  const lines = Object.entries(cart)
    .map(([id, line]) => ({ id, ...line, item: menuById.get(id) }))
    .filter((line) => line.item);

  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const estimatedCents = lines.reduce(
    (sum, line) => sum + line.quantity * (line.item?.priceCents ?? 0),
    0
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (sending || lines.length === 0) return;

    setSending(true);
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          table,
          customerName: name,
          notes,
          items: lines.map((line) => ({
            menuItemId: line.id,
            quantity: line.quantity,
            note: line.note,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(t.sendError);
      }

      setOrderStatus("new");
      setConfirmed({ id: String(data.orderId), totalCents: data.totalCents });
      setNotes("");
      onOrdered();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.sendError);
    } finally {
      setSending(false);
    }
  }

  if (confirmed) {
    const isReady = orderStatus === "ready" || orderStatus === "completed";
    const isCancelled = orderStatus === "cancelled";
    const reachedIndex = isReady
      ? progressSteps.length - 1
      : progressSteps.findIndex((step) => step === orderStatus);

    return (
      <div
        dir={dir}
        className={`fixed inset-x-0 bottom-0 z-20 text-white rounded-t-3xl px-5 pt-6 pb-8 transition-colors ${
          isReady ? "bg-green-700" : isCancelled ? "bg-red-800" : "bg-black"
        }`}
      >
        <div className="max-w-xl mx-auto flex flex-col gap-2" role="status" aria-live="polite">
          <p
            className={`text-xs font-bold tracking-widest ${
              isReady || isCancelled ? "text-white" : "text-orange-500"
            }`}
          >
            {isCancelled ? t.badgeCancelled : isReady ? t.badgeReady : t.badgeSent}
          </p>
          <p className="text-2xl font-black text-balance">{statusHeadline(orderStatus, t)}</p>

          {!isCancelled && (
            <ol className="flex gap-1 mt-2" aria-label={t.statusLabel}>
              {progressSteps.map((step, index) => {
                const done = index <= reachedIndex;
                return (
                  <li key={step} className="flex-1 flex flex-col gap-1">
                    <span
                      className={`h-1.5 rounded-full ${done ? "bg-white" : "bg-white/25"}`}
                    />
                    <span
                      className={`text-xs ${done ? "text-white font-semibold" : "text-white/50"}`}
                    >
                      {t.steps[step]}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          <p className="text-sm text-white/70 mt-1">
            {t.orderNumber(confirmed.id.slice(0, 8), formatChf(confirmed.totalCents))}
          </p>
          <button
            type="button"
            onClick={() => {
              setConfirmed(null);
              setOpen(false);
            }}
            className="mt-3 min-h-11 rounded-xl bg-white text-black font-bold px-4 py-3"
          >
            {t.anotherOrder}
          </button>
        </div>
      </div>
    );
  }

  if (count === 0) return null;

  return (
    <div dir={dir} className="fixed inset-x-0 bottom-0 z-20 bg-white border-t rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
      <div className="max-w-xl mx-auto px-4 pt-3 pb-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="min-h-12 flex items-center justify-between gap-3 rounded-xl bg-black text-white px-4 py-3 font-bold"
        >
          <span>{open ? t.closeCart : t.viewCart(count)}</span>
          <span dir="ltr">{formatChf(estimatedCents)}</span>
        </button>

        {open && (
          <form onSubmit={submit} className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto">
            <ul className="flex flex-col gap-2">
              {lines.map((line) => (
                <li key={line.id} className="flex items-center justify-between gap-3 border-b pb-2">
                  <div className="min-w-0 flex flex-col">
                    <span className="font-semibold break-words" dir="auto">{line.item!.name}</span>
                    {line.note && <span className="text-sm text-gray-500">{line.note}</span>}
                  </div>
                  <div className="shrink-0 flex items-center gap-1" dir="ltr">
                    <button
                      type="button"
                      onClick={() => onSetQuantity(line.id, line.quantity - 1)}
                      aria-label={t.remove(line.item!.name)}
                      className="size-11 rounded-full border text-xl font-bold"
                    >
                      {"−"}
                    </button>
                    <span className="w-6 text-center font-black">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onSetQuantity(line.id, line.quantity + 1)}
                      aria-label={t.add(line.item!.name)}
                      className="size-11 rounded-full border text-xl font-bold"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <label className="flex flex-col gap-1 text-sm font-semibold">
              {t.nameLabel}
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={60}
                autoComplete="given-name"
                className="rounded-xl border p-3 text-base font-normal"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-semibold">
              {t.noteLabel}
              <input
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={300}
                placeholder={t.notePlaceholder}
                dir="auto"
                className="rounded-xl border p-3 text-base font-normal"
              />
            </label>

            <p className="text-xs text-gray-500">
              {t.finalPriceInfo}
            </p>

            {error && (
              <p role="alert" className="text-sm text-red-700 bg-red-50 rounded-lg p-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="min-h-12 rounded-xl bg-orange-500 text-black font-black px-4 py-3 disabled:opacity-50"
            >
              {sending ? t.sending : t.order(formatChf(estimatedCents))}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
