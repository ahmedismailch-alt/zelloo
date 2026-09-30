"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage("E-Mail oder Passwort ist falsch.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        <div className="mb-8">
          <h1 className="text-4xl font-black">
            ZELLOO
          </h1>

          <p className="text-gray-400 mt-2">
            RESTAURANT · AI
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <h2 className="text-2xl font-bold mb-2">
            Anmelden
          </h2>

          <p className="text-gray-400 mb-6">
            Melden Sie sich bei Ihrem Zelloo-Konto an.
          </p>

          <form
            onSubmit={handleLogin}
            className="space-y-4"
          >

            <input
              type="email"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full p-3 rounded-lg bg-black border border-zinc-700"
            />

            <input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full p-3 rounded-lg bg-black border border-zinc-700"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-black font-bold p-3 rounded-lg disabled:opacity-50"
            >
              {loading ? "Anmeldung..." : "Anmelden"}
            </button>

          </form>

          {message && (
            <p className="mt-4 text-sm text-red-400">
              {message}
            </p>
          )}

          <div className="border-t border-zinc-800 mt-6 pt-6 text-center">
            <p className="text-sm text-gray-400">
              Noch kein Zelloo-Konto?
            </p>

            <button
              onClick={() => router.push("/signup")}
              className="text-orange-500 font-bold mt-2"
            >
              Restaurant registrieren
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}