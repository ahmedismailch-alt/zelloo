"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type MenuItem = {
  id: string;
  restaurant_id: number;
  category: string | null;
  name: string;
  description: string | null;
  price: number | null;
  currency: string;
  is_available: boolean;
  is_confirmed: boolean;
};

export default function MenuPage() {
  const router = useRouter();

  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [items, setItems] = useState<MenuItem[]>([]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadMenu() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const { data: restaurant, error: restaurantError } =
        await supabase
          .from("restaurants")
          .select("id, name")
          .eq("owner_id", user.id)
          .maybeSingle();

      if (restaurantError || !restaurant) {
        setMessage("Restaurant konnte nicht gefunden werden.");
        setLoading(false);
        return;
      }

      setRestaurantId(restaurant.id);
      setRestaurantName(restaurant.name);

      const { data: menuData, error: menuError } =
        await supabase
          .from("menu_items")
          .select("*")
          .eq("restaurant_id", restaurant.id)
          .order("created_at", { ascending: true });

      if (menuError) {
        setMessage("Speisekarte konnte nicht geladen werden.");
        setLoading(false);
        return;
      }

      setItems(menuData || []);
      setLoading(false);
    }

    loadMenu();
  }, [router]);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();

    if (!restaurantId || !name.trim()) {
      return;
    }

    setSaving(true);
    setMessage("");

    const parsedPrice =
      price.trim() === "" ? null : Number(price.replace(",", "."));

    if (parsedPrice !== null && Number.isNaN(parsedPrice)) {
      setMessage("Bitte geben Sie einen gültigen Preis ein.");
      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        restaurant_id: restaurantId,
        name: name.trim(),
        category: category.trim() || null,
        price: parsedPrice,
        currency: "CHF",
        is_available: true,
        is_confirmed: false,
      })
      .select()
      .single();

    if (error) {
      setMessage("Eintrag konnte nicht gespeichert werden.");
      setSaving(false);
      return;
    }

    setItems((current) => [...current, data]);

    setName("");
    setCategory("");
    setPrice("");

    setMessage("Gericht wurde hinzugefügt.");
    setSaving(false);
  }

  async function toggleConfirmed(item: MenuItem) {
    const { data, error } = await supabase
      .from("menu_items")
      .update({
        is_confirmed: !item.is_confirmed,
      })
      .eq("id", item.id)
      .select()
      .single();

    if (error) {
      setMessage("Änderung konnte nicht gespeichert werden.");
      return;
    }

    setItems((current) =>
      current.map((currentItem) =>
        currentItem.id === item.id ? data : currentItem
      )
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Wird geladen...</p>
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
              Speisekarte
            </h1>

            <p className="text-gray-500 mt-1">
              {restaurantName}
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="bg-black text-white px-4 py-2 rounded-xl font-semibold"
          >
            Dashboard
          </button>
        </div>

        <div className="bg-white border rounded-2xl p-5 mb-6">
          <h2 className="text-xl font-black">
            Gericht hinzufügen
          </h2>

          <p className="text-sm text-gray-500 mt-1 mb-5">
            Neue Gerichte können hier hinzugefügt werden.
          </p>

          <form onSubmit={addItem} className="space-y-3">

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Gericht, z.B. Margherita"
              required
              className="w-full border rounded-xl px-4 py-3"
            />

            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Kategorie, z.B. Pizza"
              className="w-full border rounded-xl px-4 py-3"
            />

            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Preis, z.B. 18.50"
              inputMode="decimal"
              className="w-full border rounded-xl px-4 py-3"
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-orange-500 text-black font-bold p-3 rounded-xl disabled:opacity-50"
            >
              {saving ? "Wird gespeichert..." : "Gericht hinzufügen"}
            </button>

          </form>

          {message && (
            <p className="text-sm mt-4 text-gray-600">
              {message}
            </p>
          )}
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-xl font-black">
                Ihre Speisekarte
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Prüfen und bestätigen Sie Ihre Gerichte.
              </p>
            </div>

            <span className="bg-gray-100 rounded-full px-3 py-1 text-sm font-bold">
              {items.length}
            </span>
          </div>

          {items.length === 0 ? (
            <div className="border border-dashed rounded-xl p-8 text-center">
              <p className="font-bold">
                Noch keine Gerichte
              </p>

              <p className="text-gray-500 text-sm mt-1">
                Ihre Speisekarte ist noch leer.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-xl p-4"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      {item.category && (
                        <p className="text-xs text-gray-500">
                          {item.category}
                        </p>
                      )}

                      <p className="font-black text-lg">
                        {item.name}
                      </p>

                      <p className="font-semibold mt-1">
                        {item.price === null
                          ? "Preis fehlt"
                          : `${item.currency} ${Number(item.price).toFixed(2)}`}
                      </p>
                    </div>

                    <div>
                      <span
                        className={
                          item.is_confirmed
                            ? "text-green-600 text-sm font-bold"
                            : "text-orange-500 text-sm font-bold"
                        }
                      >
                        {item.is_confirmed
                          ? "Bestätigt"
                          : "Prüfen"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleConfirmed(item)}
                    className="mt-4 border rounded-lg px-4 py-2 text-sm font-bold"
                  >
                    {item.is_confirmed
                      ? "Bestätigung entfernen"
                      : "Gericht bestätigen"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}