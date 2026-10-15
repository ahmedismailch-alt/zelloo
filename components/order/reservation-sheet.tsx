"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { OrderLang } from "../../lib/order-i18n";
import { RESERVATION_STRINGS } from "../../lib/reservation-i18n";
import { slotsForDay, upcomingDays } from "../../lib/reservations";
import type { OpeningHours } from "../../lib/restaurant-settings";
import { ReservationStatusView, reservationLocale } from "./reservation-status";

type Props = {
  restaurantId: string;
  restaurantName: string;
  maxParty: number;
  openingHours: OpeningHours | null;
  lang: OrderLang;
  onClose: () => void;
};

const inputClass = "min-h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-base";

export function ReservationSheet({
  restaurantId,
  restaurantName,
  maxParty,
  openingHours,
  lang,
  onClose,
}: Props) {
  const t = RESERVATION_STRINGS[lang];
  const locale = reservationLocale(lang);
  const dir = lang === "ar" ? "rtl" : "ltr";

  const days = useMemo(() => upcomingDays(), []);
  const slotsByDate = useMemo(() => {
    const now = new Date();
    return new Map(days.map((day) => [day.date, slotsForDay(openingHours, day, now)]));
  }, [days, openingHours]);

  const firstOpenDate = days.find((day) => (slotsByDate.get(day.date) ?? []).length > 0)?.date ?? days[0].date;
  const [date, setDate] = useState(firstOpenDate);
  const [time, setTime] = useState("");
  const [partySize, setPartySize] = useState(Math.min(2, maxParty));
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const slots = slotsByDate.get(date) ?? [];
  const dayFormatter = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  const numberFormatter = new Intl.DateTimeFormat(locale, { day: "numeric", timeZone: "UTC" });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !phone.trim() || !time) {
      setError(t.missingFields);
      return;
    }
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          date,
          time,
          partySize,
          guestName: name,
          guestPhone: phone,
          guestEmail: email,
          note,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        reservationId?: string;
        code?: string;
      };
      if (!response.ok || !result.reservationId) {
        setError(
          result.code === "slot"
            ? t.slotError
            : result.code === "limit"
              ? t.limitError
              : result.code === "unavailable"
                ? t.unavailableError
                : result.code === "contact"
                  ? t.missingFields
                  : t.genericError
        );
        return;
      }
      setReservationId(result.reservationId);
    } catch {
      setError(t.genericError);
    } finally {
      setSending(false);
    }
  }

  const statusLink = reservationId
    ? `${window.location.origin}/reservation/${reservationId}?r=${encodeURIComponent(restaurantId)}`
    : "";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(statusLink);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the link stays visible in the page.
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50" dir={dir} lang={lang}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-title"
        className="flex max-h-[92dvh] w-full max-w-xl flex-col rounded-t-3xl bg-white text-black"
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <div className="min-w-0">
            <h2 id="reservation-title" className="text-2xl font-black text-balance">
              {t.title}
            </h2>
            <p className="truncate text-sm text-gray-500">{restaurantName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl font-bold"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-6 pt-4">
          {reservationId ? (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xl font-black">{t.successTitle}</p>
                <p className="mt-1 text-gray-600">{t.successText}</p>
              </div>
              <ReservationStatusView reservationId={reservationId} restaurantId={restaurantId} lang={lang} />
              <div className="flex flex-col gap-2">
                <p className="text-xs text-gray-500">{t.statusLinkLabel}</p>
                <button
                  type="button"
                  onClick={copyLink}
                  className="min-h-12 rounded-xl border border-gray-300 bg-white font-bold"
                >
                  {linkCopied ? t.copied : t.copyLink}
                </button>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="min-h-12 rounded-xl bg-black font-black text-white"
              >
                {t.backToMenu}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-bold text-gray-600">{t.dateLabel}</legend>
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" dir="ltr">
                  {days.map((day) => {
                    const open = (slotsByDate.get(day.date) ?? []).length > 0;
                    const selected = day.date === date;
                    const instant = new Date(`${day.date}T12:00:00Z`);
                    return (
                      <button
                        key={day.date}
                        type="button"
                        disabled={!open}
                        aria-pressed={selected}
                        onClick={() => {
                          setDate(day.date);
                          setTime("");
                        }}
                        className={`flex min-h-16 min-w-14 shrink-0 flex-col items-center justify-center rounded-2xl border px-3 font-bold ${
                          selected
                            ? "border-orange-500 bg-orange-500 text-black"
                            : "border-gray-300 bg-white"
                        } ${open ? "" : "opacity-35"}`}
                      >
                        <span className="text-sm">{dayFormatter.format(instant)}</span>
                        <span className="text-lg">{numberFormatter.format(instant)}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-bold text-gray-600">{t.timeLabel}</legend>
                {slots.length === 0 ? (
                  <p className="text-sm text-gray-500">{t.noSlots}</p>
                ) : (
                  <div className="flex flex-wrap gap-2" dir="ltr">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        aria-pressed={slot === time}
                        onClick={() => setTime(slot)}
                        className={`min-h-12 min-w-20 rounded-xl border px-3 font-bold ${
                          slot === time
                            ? "border-orange-500 bg-orange-500 text-black"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </fieldset>

              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-bold text-gray-600">{t.partyLabel}</legend>
                <div className="flex items-center gap-4" dir="ltr">
                  <button
                    type="button"
                    aria-label={t.decrease}
                    disabled={partySize <= 1}
                    onClick={() => setPartySize((n) => Math.max(1, n - 1))}
                    className="flex size-12 items-center justify-center rounded-full border border-gray-300 bg-white text-2xl font-bold disabled:opacity-35"
                  >
                    <span aria-hidden="true">−</span>
                  </button>
                  <span className="min-w-28 text-center text-lg font-black" dir="auto" aria-live="polite">
                    {t.partyCount(partySize)}
                  </span>
                  <button
                    type="button"
                    aria-label={t.increase}
                    disabled={partySize >= maxParty}
                    onClick={() => setPartySize((n) => Math.min(maxParty, n + 1))}
                    className="flex size-12 items-center justify-center rounded-full border border-gray-300 bg-white text-2xl font-bold disabled:opacity-35"
                  >
                    <span aria-hidden="true">+</span>
                  </button>
                </div>
                {partySize >= maxParty && <p className="text-xs text-gray-500">{t.maxParty(maxParty)}</p>}
              </fieldset>

              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-bold text-gray-600">{t.nameLabel}</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    maxLength={80}
                    required
                    className={inputClass}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-bold text-gray-600">{t.phoneLabel}</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    placeholder="+41 79 123 45 67"
                    dir="ltr"
                    required
                    className={inputClass}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-bold text-gray-600">{t.emailLabel}</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    dir="ltr"
                    className={inputClass}
                  />
                  <span className="text-xs text-gray-500">{t.emailHint}</span>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-bold text-gray-600">{t.noteLabel}</span>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={300}
                    placeholder={t.notePlaceholder}
                    className={inputClass}
                  />
                </label>
              </div>

              {error && (
                <p role="alert" className="text-sm font-semibold text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={sending || !time}
                className="min-h-14 rounded-xl bg-orange-500 text-base font-black text-black disabled:opacity-50"
              >
                {sending ? t.sending : t.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
