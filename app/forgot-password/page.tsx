"use client";

import { Logo } from "@/components/logo";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    setLoading(false);

    if (error) {
      setError("Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.");
      return;
    }

    setMessage(
      "Falls ein Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen des Passworts gesendet."
    );
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
          <h2 className="text-2xl font-bold mb-2">Passwort vergessen?</h2>

          <p className="text-gray-400 mb-6">
            Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum
            Zurücksetzen Ihres Passworts.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full p-3 rounded-lg bg-black border border-zinc-700"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-black font-bold p-3 rounded-lg disabled:opacity-50"
            >
              {loading ? "Wird gesendet..." : "Link senden"}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-sm text-green-400">{message}</p>
          )}

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <div className="border-t border-zinc-800 mt-6 pt-6 text-center">
            <Link href="/login" className="text-orange-500 font-bold">
              Zurück zur Anmeldung
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
