"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantUrl, setRestaurantUrl] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      setEmail(user.email || "");

      const metadataName =
        user.user_metadata?.restaurant_name || "Mein Restaurant";

      const metadataUrl =
        user.user_metadata?.restaurant_url || "";

      const { data: existingRestaurant, error: readError } =
        await supabase
          .from("restaurants")
          .select("*")
          .eq("owner_id", user.id)
          .maybeSingle();

      if (readError) {
        console.error(readError);
        setRestaurantName(metadataName);
        setRestaurantUrl(metadataUrl);
        setLoading(false);
        return;
      }

      if (existingRestaurant) {
        setRestaurantName(existingRestaurant.name);
        setRestaurantUrl(existingRestaurant.source_url || "");
        setLoading(false);
        return;
      }

      const { data: newRestaurant, error: insertError } =
        await supabase
          .from("restaurants")
          .insert({
            owner_id: user.id,
            name: metadataName,
            source_url: metadataUrl,
            email: user.email || "",
          })
          .select()
          .single();

      if (insertError) {
        console.error(insertError);
        setRestaurantName(metadataName);
        setRestaurantUrl(metadataUrl);
        setLoading(false);
        return;
      }

      setRestaurantName(newRestaurant.name);
      setRestaurantUrl(newRestaurant.source_url || "");
      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">
          Wird geladen...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-black p-5">
      <div className="max-w-5xl mx-auto">

        <div className="flex justify-between items-start gap-4 mb-8">
          <div>
            <p className="text-sm font-bold text-orange-500">
              ZELLOO
            </p>

            <h1 className="text-3xl font-black mt-1">
              {restaurantName}
            </h1>

            <p className="text-gray-500 mt-1">
              {email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="border border-gray-300 bg-white rounded-xl px-4 py-2 text-sm font-semibold"
          >
            Abmelden
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          <div className="bg-white border rounded-2xl p-5">
            <p className="text-gray-500 text-sm">
              Bestellungen heute
            </p>
            <p className="text-3xl font-black mt-2">
              0
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-5">
            <p className="text-gray-500 text-sm">
              Neue Bestellungen
            </p>
            <p className="text-3xl font-black mt-2">
              0
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-5">
            <p className="text-gray-500 text-sm">
              Umsatz heute
            </p>
            <p className="text-3xl font-black mt-2">
              CHF 0
            </p>
          </div>

        </div>

        <div className="bg-white border rounded-2xl p-5 mb-6">
          <h2 className="text-xl font-black mb-2">
            Restaurant
          </h2>

          <p className="text-gray-500 text-sm mb-4">
            Ihre Restaurantinformationen
          </p>

          <div className="border rounded-xl p-4">
            <p className="text-xs text-gray-500">
              Restaurantname
            </p>

            <p className="font-bold mt-1">
              {restaurantName}
            </p>
          </div>

          {restaurantUrl && (
            <div className="border rounded-xl p-4 mt-3">
              <p className="text-xs text-gray-500">
                Restaurant-Link
              </p>

              <a
                href={restaurantUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-orange-500 break-all mt-1 block"
              >
                {restaurantUrl}
              </a>
            </div>
          )}
        </div>

        <div className="bg-black text-white rounded-2xl p-5">
          <p className="text-sm text-gray-400">
            Zelloo AI
          </p>

          <h2 className="text-xl font-black mt-1">
            Speisekarte vorbereiten
          </h2>

          <p className="text-gray-400 mt-2 text-sm">
            Zelloo wird Ihre Restaurantinformationen
            für die Einrichtung vorbereiten.
          </p>

          <button
            disabled
            className="mt-4 bg-orange-500 text-black font-bold px-5 py-3 rounded-xl opacity-60"
          >
            Import wird vorbereitet
          </button>
        </div>

      </div>
    </main>
  );
}