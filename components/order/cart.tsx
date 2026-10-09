"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { OrderLang, OrderStrings } from "../../lib/order-i18n";
import { DemoResult, type DemoSummary } from "./demo-result";
import type { PublicMenuItem } from "../../lib/supabase-server";
import { optionsKey, resolveSelection } from "../../lib/menu-options";
import { formatChf } from "./format";

export type CartLine = {
  menuItemId: string;
  options: string[];
  quantity: number;
  note: string | null;
};

export type DeliveryInfo = { feeCents: number; minCents: number };

export function cartLineKey(menuItemId: string, options: string[]) {
  return options.length > 0 ? `${menuItemId}::${optionsKey(options)}` : menuItemId;
}

export function lastOrderStorageKey(restaurantId: string) {
  return `zelloo-last-order-${restaurantId}`;
}

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
  lang: OrderLang;
  dir: "ltr" | "rtl";
  showArabic: boolean;
  delivery: DeliveryInfo;
  isDemo?: boolean;
  onSetQuantity: (key: string, quantity: number) => void;
  onOrdered: () => void;
};

export function Cart({
  restaurantId,
  table,
  cart,
  menuById,
  t,
  lang,
  dir,
  showArabic,
  delivery,
  isDemo = false,
  onSetQuantity,
  onOrdered,
}: Props) {
  const [demoSummary, setDemoSummary] = useState<DemoSummary | null>(null);
  const labelFor = (item: PublicMenuItem) =>
    showArabic && item.nameAr ? item.nameAr : item.name;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState<{ id: string; totalCents: number } | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("new");
  const [prepMinutes, setPrepMinutes] = useState<number | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [ratingSent, setRatingSent] = useState(false);
  const [ratingError, setRatingError] = useState(false);
  const [ratingSending, setRatingSending] = useState(false);
  const [loyalty, setLoyalty] = useState<{
    count: number;
    target: number;
    reward: string;
  } | null>(null);

  useEffect(() => {
    const trimmed = phone.trim();
    if (table || trimmed.length < 6) {
      setLoyalty(null);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/loyalty?restaurantId=${encodeURIComponent(restaurantId)}&phone=${encodeURIComponent(trimmed)}`,
          { cache: "no-store" }
        );
        if (!response.ok || cancelled) return;
        const data = await response.json();
        if (cancelled) return;
        setLoyalty(
          data.enabled
            ? { count: data.count, target: data.target, reward: data.reward }
            : null
        );
      } catch {
        if (!cancelled) setLoyalty(null);
      }
    }, 500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [phone, restaurantId, table]);

  async function submitRating(stars: number) {
    if (!confirmed || ratingSending || ratingSent) return;
    setRating(stars);
    setRatingSending(true);
    setRatingError(false);
    try {
      const response = await fetch(
        `/api/orders/${encodeURIComponent(confirmed.id)}/rating`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ restaurantId, rating: stars }),
        }
      );
      if (!response.ok) throw new Error("rating failed");
      setRatingSent(true);
    } catch {
      setRatingError(true);
    } finally {
      setRatingSending(false);
    }
  }

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
          const data = (await response.json()) as {
            status: OrderStatus;
            prepMinutes?: number | null;
          };
          if (cancelled) return;
          setOrderStatus(data.status);
          setPrepMinutes(
            typeof data.prepMinutes === "number" ? data.prepMinutes : null
          );
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
    .map(([key, line]) => {
      const item = menuById.get(line.menuItemId);
      if (!item) return null;
      const selection = resolveSelection(item.options, line.options);
      return {
        key,
        ...line,
        item,
        optionNames: selection.ok ? selection.choices.map((choice) => choice.name) : [],
        unitCents: item.priceCents + (selection.ok ? selection.extraCents : 0),
      };
    })
    .filter((line): line is NonNullable<typeof line> => line !== null);

  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotalCents = lines.reduce(
    (sum, line) => sum + line.quantity * line.unitCents,
    0
  );
  const isDelivery = !table && orderType === "delivery";
  const deliveryFeeCents = isDelivery ? delivery.feeCents : 0;
  const estimatedCents = subtotalCents + deliveryFeeCents;
  const belowMinimum =
    isDelivery && delivery.minCents > 0 && subtotalCents < delivery.minCents;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (sending || lines.length === 0) return;

    if (!table && (!name.trim() || !phone.trim())) {
      setError(t.missingContactError);
      return;
    }

    if (!table && orderType === "delivery" && !address.trim()) {
      setError(t.missingAddressError);
      return;
    }

    if (belowMinimum) {
      setError(t.minOrderError(formatChf(delivery.minCents)));
      return;
    }

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
          customerPhone: phone,
          orderType: table ? "pickup" : orderType,
          customerAddress: table ? "" : orderType === "delivery" ? address : "",
          notes,
          items: lines.map((line) => ({
            menuItemId: line.menuItemId,
            quantity: line.quantity,
            note: line.note,
            options: line.options,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const messages: Record<string, string> = {
          paused: t.pausedError,
          closed: t.closedError,
          zone: t.zoneError,
          min_order: t.minOrderError(formatChf(delivery.minCents)),
        };
        throw new Error(messages[data?.code as string] ?? t.sendError);
      }

      try {
        window.localStorage.setItem(
          lastOrderStorageKey(restaurantId),
          JSON.stringify(
            lines.map((line) => ({
              menuItemId: line.menuItemId,
              options: line.options,
              quantity: line.quantity,
              note: line.note,
            }))
          )
        );
      } catch {
        // Storage can be blocked; reordering is a convenience only.
      }

      setOrderStatus("new");
      setPrepMinutes(null);
      if (isDemo) {
        setDemoSummary({
          orderId: String(data.orderId),
          totalCents: data.totalCents,
          orderType: table ? "pickup" : orderType,
          table,
          lines: lines.map((line) => ({
            name: [labelFor(line.item), ...line.optionNames].join(", "),
            quantity: line.quantity,
          })),
        });
      }
      setConfirmed({ id: String(data.orderId), totalCents: data.totalCents });
      setNotes("");
      onOrdered();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.sendError);
    } finally {
      setSending(false);
    }
  }

  if (confirmed && isDemo && demoSummary) {
    return (
      <DemoResult
        summary={demoSummary}
        lang={lang}
        onClose={() => {
          setConfirmed(null);
          setDemoSummary(null);
          setOpen(false);
        }}
      />
    );
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
          {prepMinutes !== null &&
            (orderStatus === "accepted" || orderStatus === "preparing") && (
              <p className="text-base font-bold text-orange-400">
                {t.prepTime(prepMinutes)}
              </p>
            )}

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

          {isReady && (
            <div className="mt-2 rounded-2xl bg-white/10 p-4 flex flex-col gap-2">
              {ratingSent ? (
                <p className="text-sm font-bold">{t.rateThanks}</p>
              ) : (
                <>
                  <p className="text-sm font-bold">{t.rateTitle}</p>
                  <div className="flex gap-1" dir="ltr">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const filled = rating !== null && star <= rating;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => submitRating(star)}
                          disabled={ratingSending}
                          aria-label={t.rateStar(star)}
                          className="size-11 flex items-center justify-center disabled:opacity-60"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className={`size-7 ${filled ? "fill-orange-500" : "fill-none stroke-white/60 stroke-2"}`}
                            aria-hidden="true"
                          >
                            <path d="M12 2.5l2.9 6.17 6.6.68-4.95 4.6 1.3 6.55L12 17.3l-5.85 3.2 1.3-6.55-4.95-4.6 6.6-.68L12 2.5z" />
                          </svg>
                        </button>
                      );
                    })}
                  </div>
                  {ratingError && (
                    <p role="alert" className="text-xs text-white/80">
                      {t.rateError}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setConfirmed(null);
              setOpen(false);
              setRating(null);
              setRatingSent(false);
              setRatingError(false);
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
                <li key={line.key} className="flex items-center justify-between gap-3 border-b pb-2">
                  <div className="min-w-0 flex flex-col">
                    <span className="font-semibold break-words" dir="auto">{labelFor(line.item)}</span>
                    {showArabic && line.item.nameAr && (
                      <span className="text-xs text-gray-400 break-words" dir="ltr" lang="de">
                        {line.item.name}
                      </span>
                    )}
                    {line.optionNames.length > 0 && (
                      <span className="text-sm text-gray-600 break-words" dir="auto">
                        {line.optionNames.join(", ")}
                      </span>
                    )}
                    {line.note && <span className="text-sm text-gray-500">{line.note}</span>}
                    <span className="text-sm font-semibold" dir="ltr">
                      {formatChf(line.unitCents * line.quantity)}
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center gap-1" dir="ltr">
                    <button
                      type="button"
                      onClick={() => onSetQuantity(line.key, line.quantity - 1)}
                      aria-label={t.remove(labelFor(line.item))}
                      className="size-11 rounded-full border text-xl font-bold"
                    >
                      {"−"}
                    </button>
                    <span className="w-6 text-center font-black">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onSetQuantity(line.key, line.quantity + 1)}
                      aria-label={t.add(labelFor(line.item))}
                      className="size-11 rounded-full border text-xl font-bold"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {!table && (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 leading-relaxed">
                {t.noTableHint}
              </p>
            )}

            {!table && (
              <div className="flex flex-col gap-2 text-sm font-semibold">
                {t.orderTypeLabel}
                <div className="flex gap-2" dir="ltr">
                  <button
                    type="button"
                    onClick={() => setOrderType("pickup")}
                    aria-pressed={orderType === "pickup"}
                    className={`flex-1 min-h-11 rounded-xl border px-3 py-2 font-bold ${
                      orderType === "pickup"
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border-gray-300"
                    }`}
                  >
                    {t.pickupOption}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType("delivery")}
                    aria-pressed={orderType === "delivery"}
                    className={`flex-1 min-h-11 rounded-xl border px-3 py-2 font-bold ${
                      orderType === "delivery"
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border-gray-300"
                    }`}
                  >
                    {t.deliveryOption}
                  </button>
                </div>
              </div>
            )}

            {isDelivery && delivery.minCents > 0 && (
              <p
                role="status"
                className={`text-sm rounded-xl p-3 ${
                  belowMinimum
                    ? "bg-amber-50 text-amber-900 border border-amber-300"
                    : "bg-gray-50 text-gray-600"
                }`}
              >
                {t.deliveryMinInfo(formatChf(delivery.minCents))}
              </p>
            )}

            {!table && orderType === "delivery" && (
              <label className="flex flex-col gap-1 text-sm font-semibold">
                {t.addressLabel}
                <input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  maxLength={200}
                  required
                  autoComplete="street-address"
                  placeholder={t.addressPlaceholder}
                  dir="auto"
                  className="rounded-xl border p-3 text-base font-normal"
                />
              </label>
            )}

            <label className="flex flex-col gap-1 text-sm font-semibold">
              {table ? t.nameLabel : t.nameLabelRequired}
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={60}
                required={!table}
                autoComplete="given-name"
                className="rounded-xl border p-3 text-base font-normal"
              />
            </label>

            {!table && (
              <label className="flex flex-col gap-1 text-sm font-semibold">
                {t.phoneLabel}
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  maxLength={30}
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder={t.phonePlaceholder}
                  className="rounded-xl border p-3 text-base font-normal"
                />
              </label>
            )}

            {loyalty && (
              <div
                className="rounded-xl bg-orange-50 border border-orange-200 p-3 text-sm font-semibold text-orange-900"
                role="status"
              >
                {loyalty.count >= loyalty.target
                  ? t.loyaltyReached(loyalty.reward)
                  : t.loyaltyProgress(loyalty.count, loyalty.target)}
              </div>
            )}

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

            <dl className="flex flex-col gap-1 rounded-xl bg-gray-50 p-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt>{t.subtotalLabel}</dt>
                <dd dir="ltr">{formatChf(subtotalCents)}</dd>
              </div>
              {isDelivery && (
                <div className="flex justify-between gap-3">
                  <dt>{t.deliveryFeeLabel}</dt>
                  <dd dir="ltr">{formatChf(deliveryFeeCents)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3 border-t pt-1 font-black">
                <dt>Total</dt>
                <dd dir="ltr">{formatChf(estimatedCents)}</dd>
              </div>
            </dl>

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
              className="min-h-12 flex items-center justify-center gap-2 rounded-xl bg-orange-500 text-black font-black px-4 py-3 disabled:opacity-70"
            >
              {sending && (
                <span
                  aria-hidden="true"
                  className="size-4 shrink-0 animate-spin rounded-full border-2 border-black/30 border-t-black"
                />
              )}
              {sending ? t.sending : t.order(formatChf(estimatedCents))}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
