"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SignupPage() {
  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          restaurant_name: restaurantName,
        },
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "Konto erstellt! Bitte bestätigen Sie Ihre E-Mail-Adresse."
      );
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">ZELLOO</h1>
          <p className="text-gray-400 mt-2">RESTAURANT · AI</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-2">
            Restaurant registrieren
          </h2>

          <p className="text-gray-400 mb-6">
            Erstellen Sie Ihr Zelloo-Konto.
          </p>

          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="text"
              placeholder="Restaurantname"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-black border border-zinc-700"
            />

            <input
              type="email"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-black border border-zinc-700"
            />

            <input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full p-3 rounded-lg bg-black border border-zinc-700"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-black font-semibold p-3 rounded-lg"
            >
              {loading ? "Wird erstellt..." : "Konto erstellen"}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-sm text-gray-300">{message}</p>
          )}
        </div>
      </div>
    </main>
  );
}