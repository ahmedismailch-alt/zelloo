"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

export default function SettingsPage() {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState<number | string | null>(null);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

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

      const { data, error: readError } = await supabase
        .from("restaurants")
        .select("id, phone")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (readError || !data) {
        setError("Restaurant konnte nicht geladen werden.");
        setLoading(false);
        return;
      }

      setRestaurantId(data.id);
      setPhone(data.phone || "");
      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [router]);

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

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-bold text-orange-500">ZELLOO</p>
            <h1 className="text-2xl font-black mt-1">Einstellungen</h1>
          </div>
          <Link
            href="/dashboard"
            className="border border-gray-300 bg-white rounded-xl px-4 py-2 text-sm font-semibold"
          >
            Zurück
          </Link>
        </div>

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
      </div>
    </main>
  );
}
