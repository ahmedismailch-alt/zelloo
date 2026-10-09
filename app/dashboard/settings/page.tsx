"use client";

import { Logo } from "@/components/logo";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { DashboardShell } from "../../../components/dashboard/dashboard-shell";

export default function SettingsPage() {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState<number | string | null>(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [loyaltyEnabled, setLoyaltyEnabled] = useState(false);
  const [loyaltyTarget, setLoyaltyTarget] = useState("5");
  const [loyaltyReward, setLoyaltyReward] = useState("");
  const [loyaltySaving, setLoyaltySaving] = useState(false);
  const [loyaltyError, setLoyaltyError] = useState<string | null>(null);
  const [loyaltySaved, setLoyaltySaved] = useState(false);
  const [loyaltyUnavailable, setLoyaltyUnavailable] = useState(false);

  const [report, setReport] = useState("");
  const [reportSending, setReportSending] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportSent, setReportSent] = useState(false);

  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);
  const [whatsappUnavailable, setWhatsappUnavailable] = useState(false);
  const [whatsappCopied, setWhatsappCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email || "");

      const { data, error: readError } = await supabase
        .from("restaurants")
        .select("id, phone, loyalty_enabled, loyalty_target, loyalty_reward")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (readError || !data) {
        // Loyalty columns may not exist yet. Retry without them so the page still loads.
        const { data: fallback, error: fallbackError } = await supabase
          .from("restaurants")
          .select("id, phone")
          .eq("owner_id", user.id)
          .maybeSingle();

        if (cancelled) return;

        if (fallbackError || !fallback) {
          setError("Restaurant konnte nicht geladen werden.");
          setLoading(false);
          return;
        }

        setRestaurantId(fallback.id);
        setPhone(fallback.phone || "");
        setLoyaltyUnavailable(true);
        setLoading(false);
        return;
      }

      setRestaurantId(data.id);
      setPhone(data.phone || "");
      setLoyaltyEnabled(Boolean(data.loyalty_enabled));
      setLoyaltyTarget(String(data.loyalty_target || 5));
      setLoyaltyReward(data.loyalty_reward || "");
      setLoading(false);
    }

    void load();
  }, [router]);

  useEffect(() => {
    if (restaurantId === null) return;
    let cancelled = false;

    async function loadWhatsappLink() {
      try {
        const res = await fetch(
          `/api/whatsapp/order-link?restaurantId=${restaurantId}`
        );
        if (cancelled) return;
        if (!res.ok) {
          setWhatsappUnavailable(true);
          return;
        }
        const data = await res.json();
        setWhatsappLink(data.link);
      } catch {
        if (!cancelled) setWhatsappUnavailable(true);
      }
    }

    void loadWhatsappLink();

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  async function handleCopyWhatsappLink() {
    if (!whatsappLink) return;
    try {
      await navigator.clipboard.writeText(whatsappLink);
      setWhatsappCopied(true);
      setTimeout(() => setWhatsappCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — ignore silently, link is still shown.
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (restaurantId === null) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    const trimmed = phone.trim();

    const { error: updateError } = await supabase
      .from("restaurants")
      .update({ phone: trimmed || null })
      .eq("id", restaurantId);

    setSaving(false);

    if (updateError) {
      setError("Speichern fehlgeschlagen. Bitte erneut versuchen.");
      return;
    }

    setPhone(trimmed);
    setSaved(true);
  }

  async function handleLoyaltySave(e: FormEvent) {
    e.preventDefault();
    if (restaurantId === null) return;

    setLoyaltyError(null);
    setLoyaltySaved(false);

    const target = Number.parseInt(loyaltyTarget, 10);
    if (loyaltyEnabled) {
      if (!Number.isFinite(target) || target < 1 || target > 50) {
        setLoyaltyError("Die Anzahl Bestellungen muss zwischen 1 und 50 liegen.");
        return;
      }
      if (!loyaltyReward.trim()) {
        setLoyaltyError("Bitte eine Belohnung angeben.");
        return;
      }
    }

    setLoyaltySaving(true);

    const { error: updateError } = await supabase
      .from("restaurants")
      .update({
        loyalty_enabled: loyaltyEnabled,
        loyalty_target: Number.isFinite(target) ? target : 5,
        loyalty_reward: loyaltyReward.trim() || null,
      })
      .eq("id", restaurantId);

    setLoyaltySaving(false);

    if (updateError) {
      setLoyaltyError("Speichern fehlgeschlagen. Bitte erneut versuchen.");
      return;
    }

    setLoyaltySaved(true);
  }

  async function handleReportSubmit(e: FormEvent) {
    e.preventDefault();

    setReportError(null);
    setReportSent(false);

    const trimmed = report.trim();
    if (!trimmed) {
      setReportError("Bitte beschreiben Sie das Problem.");
      return;
    }

    setReportSending(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setReportSending(false);
      setReportError("Nicht angemeldet.");
      return;
    }

    try {
      const res = await fetch("/api/restaurant-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ report: trimmed }),
      });

      if (!res.ok) throw new Error("failed");

      setReport("");
      setReportSent(true);
    } catch {
      setReportError("Senden fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setReportSending(false);
    }
  }

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();

    setPasswordError(null);
    setPasswordSaved(false);

    if (newPassword.length < 6) {
      setPasswordError("Das Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setPasswordSaving(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setPasswordSaving(false);

    if (updateError) {
      setPasswordError("Passwort konnte nicht geändert werden. Bitte erneut versuchen.");
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setPasswordSaved(true);
  }

  async function handleLogout() {
    setLoggingOut(true);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setLoggingOut(false);
      return;
    }
    router.replace("/login");
  }

  return (
    <>
    <DashboardShell />
    <main className="min-h-screen bg-gray-50 px-4 py-6 pb-24 md:pb-6 md:pl-[17rem]">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Logo size="sm" className="text-orange-500" />
            <h1 className="text-2xl font-black mt-1">Einstellungen</h1>
          </div>
          <Link
            href="/dashboard"
            className="border border-gray-300 bg-white rounded-xl px-4 py-2 text-sm font-semibold"
          >
            Zurück
          </Link>
        </div>

        {email && (
          <div className="bg-white border rounded-2xl p-4 mb-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Angemeldet als</p>
              <p className="text-sm font-semibold break-all">{email}</p>
            </div>
            <button
              type="button"
              disabled={loggingOut}
              onClick={() => void handleLogout()}
              className="shrink-0 min-h-11 border border-gray-300 bg-white rounded-xl px-4 text-sm font-semibold disabled:opacity-60"
            >
              {loggingOut ? "..." : "Abmelden"}
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-sm">Wird geladen...</p>
        ) : (
          <form
            onSubmit={handleSave}
            className="bg-white border rounded-2xl p-4 flex flex-col gap-3"
          >
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">Telefonnummer</span>
              <span className="text-xs text-gray-500">
                Wird Kunden auf der Bestellseite angezeigt, damit sie Sie bei
                Fragen erreichen können. Leer lassen, um sie auszublenden.
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+41 79 123 45 67"
                className="min-h-12 rounded-xl border border-gray-300 px-4 text-base"
              />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {saved && !error && (
              <p className="text-sm text-green-600">Gespeichert.</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="min-h-12 rounded-xl bg-orange-500 text-white font-black text-base disabled:opacity-60"
            >
              {saving ? "Wird gespeichert..." : "Speichern"}
            </button>
          </form>
        )}

        {!loading && !whatsappUnavailable && (
          <div className="bg-white border rounded-2xl p-4 flex flex-col gap-3 mt-4">
            <h2 className="text-base font-bold">WhatsApp-Bestellungen</h2>
            <p className="text-xs text-gray-500">
              Teilen Sie diesen Link mit Ihren Kunden. Er öffnet WhatsApp und
              startet dort automatisch eine Bestellung für Ihr Restaurant.
            </p>

            {whatsappLink ? (
              <>
                <div className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm break-all">
                  {whatsappLink}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCopyWhatsappLink}
                    className="flex-1 min-h-12 rounded-xl border border-gray-300 bg-white font-black text-base"
                  >
                    {whatsappCopied ? "Kopiert!" : "Link kopieren"}
                  </button>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-h-12 rounded-xl bg-orange-500 text-white font-black text-base flex items-center justify-center"
                  >
                    Testen
                  </a>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-sm">Wird geladen...</p>
            )}
          </div>
        )}

        {!loading && !loyaltyUnavailable && (
          <form
            onSubmit={handleLoyaltySave}
            className="bg-white border rounded-2xl p-4 flex flex-col gap-3 mt-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">Treueprogramm</h2>
              <button
                type="button"
                role="switch"
                aria-checked={loyaltyEnabled}
                onClick={() => setLoyaltyEnabled((v) => !v)}
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  loyaltyEnabled ? "bg-orange-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform ${
                    loyaltyEnabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Kunden sehen ihren Fortschritt auf der Bestellseite, sobald sie
              ihre Telefonnummer eingegeben haben. Zählt alle nicht
              abgebrochenen Bestellungen pro Telefonnummer.
            </p>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">
                Bestellungen bis zur Belohnung
              </span>
              <input
                type="number"
                min={1}
                max={50}
                value={loyaltyTarget}
                onChange={(e) => setLoyaltyTarget(e.target.value)}
                disabled={!loyaltyEnabled}
                className="min-h-12 rounded-xl border border-gray-300 px-4 text-base disabled:opacity-60"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">Belohnung</span>
              <input
                type="text"
                value={loyaltyReward}
                onChange={(e) => setLoyaltyReward(e.target.value)}
                disabled={!loyaltyEnabled}
                placeholder="z.B. ein kostenloses Getränk"
                className="min-h-12 rounded-xl border border-gray-300 px-4 text-base disabled:opacity-60"
              />
            </label>

            {loyaltyError && (
              <p className="text-sm text-red-600">{loyaltyError}</p>
            )}
            {loyaltySaved && !loyaltyError && (
              <p className="text-sm text-green-600">Gespeichert.</p>
            )}

            <button
              type="submit"
              disabled={loyaltySaving}
              className="min-h-12 rounded-xl bg-orange-500 text-white font-black text-base disabled:opacity-60"
            >
              {loyaltySaving ? "Wird gespeichert..." : "Speichern"}
            </button>
          </form>
        )}

        {!loading && (
          <form
            onSubmit={handlePasswordChange}
            className="bg-white border rounded-2xl p-4 flex flex-col gap-3 mt-4"
          >
            <h2 className="text-base font-bold">Passwort ändern</h2>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">Neues Passwort</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mindestens 6 Zeichen"
                autoComplete="new-password"
                className="min-h-12 rounded-xl border border-gray-300 px-4 text-base"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">
                Neues Passwort bestätigen
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Passwort erneut eingeben"
                autoComplete="new-password"
                className="min-h-12 rounded-xl border border-gray-300 px-4 text-base"
              />
            </label>

            {passwordError && (
              <p className="text-sm text-red-600">{passwordError}</p>
            )}
            {passwordSaved && !passwordError && (
              <p className="text-sm text-green-600">Passwort geändert.</p>
            )}

            <button
              type="submit"
              disabled={passwordSaving}
              className="min-h-12 rounded-xl border border-gray-300 bg-white font-black text-base disabled:opacity-60"
            >
              {passwordSaving ? "Wird geändert..." : "Passwort ändern"}
            </button>
          </form>
        )}

        {!loading && (
          <form
            onSubmit={handleReportSubmit}
            className="bg-white border rounded-2xl p-4 flex flex-col gap-3 mt-4"
          >
            <h2 className="text-base font-bold">Problem melden</h2>
            <p className="text-xs text-gray-500">
              Gibt es ein Problem mit Zelloo? Beschreiben Sie es kurz — wir
              melden uns und beheben es für Sie.
            </p>

            <textarea
              value={report}
              onChange={(e) => setReport(e.target.value)}
              placeholder="z. B. Bestellungen werden nicht angezeigt..."
              rows={4}
              maxLength={1000}
              className="rounded-xl border border-gray-300 px-4 py-3 text-base resize-none"
            />

            {reportError && (
              <p className="text-sm text-red-600">{reportError}</p>
            )}
            {reportSent && !reportError && (
              <p className="text-sm text-green-600">
                Gesendet. Wir melden uns bald bei Ihnen.
              </p>
            )}

            <button
              type="submit"
              disabled={reportSending}
              className="min-h-12 rounded-xl border border-gray-300 bg-white font-black text-base disabled:opacity-60"
            >
              {reportSending ? "Wird gesendet..." : "An Zelloo senden"}
            </button>
          </form>
        )}
      </div>
    </main>
    </>
  );
}
