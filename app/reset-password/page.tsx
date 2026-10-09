"use client";

import { Logo } from "@/components/logo";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase sends the user back here with a recovery session already
    // established via the URL. PASSWORD_RECOVERY fires once that session
    // is set, confirming the user is allowed to set a new password.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError("Etwas ist schiefgelaufen. Bitte fordern Sie einen neuen Link an.");
      return;
    }

    setMessage("Passwort erfolgreich geändert. Sie werden weitergeleitet...");

    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1500);
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1>
            <Logo size="lg" />
          </h1>
          <p className="text-gray-400 mt-2">RESTAURANT · AI</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-2">Neues Passwort festlegen</h2>

          {!ready ? (
            <p className="text-gray-400">
              Link wird überprüft. Falls nichts passiert, fordern Sie bitte
              einen neuen Link über{" "}
              <a href="/forgot-password" className="text-orange-500">
                Passwort vergessen
              </a>{" "}
              an.
            </p>
          ) : (
            <>
              <p className="text-gray-400 mb-6">
                Legen Sie ein neues Passwort für Ihr Konto fest.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="password"
                  placeholder="Neues Passwort"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full p-3 rounded-lg bg-black border border-zinc-700"
                />

                <input
                  type="password"
                  placeholder="Passwort bestätigen"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full p-3 rounded-lg bg-black border border-zinc-700"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 text-black font-bold p-3 rounded-lg disabled:opacity-50"
                >
                  {loading ? "Wird gespeichert..." : "Passwort speichern"}
                </button>
              </form>
            </>
          )}

          {message && (
            <p className="mt-4 text-sm text-green-400">{message}</p>
          )}

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </div>
      </div>
    </main>
  );
}
