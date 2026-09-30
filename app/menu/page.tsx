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

type AIItem = {
  name: string;
  category: string | null;
  description: string | null;
  price: number | null;
  currency: string;
};

export default function MenuPage() {
  const router = useRouter();

  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [items, setItems] = useState<MenuItem[]>([]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const [menuImages, setMenuImages] = useState<File[]>([]);
  const [aiItems, setAiItems] = useState<AIItem[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [importing, setImporting] = useState(false);

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

  function handleImages(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    setMenuImages((current) => [...current, ...files]);
    setAiItems([]);
    setMessage("");
  }

  function removeImage(index: number) {
    setMenuImages((current) =>
      current.filter((_, currentIndex) => currentIndex !== index)
    );
  }

  async function analyzeMenu() {
    if (menuImages.length === 0) return;

    setAnalyzing(true);
    setMessage("");
    setAiItems([]);

    try {
      const formData = new FormData();

      menuImages.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch("/api/menu-analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data?.error || "Die Speisekarte konnte nicht analysiert werden."
        );
        setAnalyzing(false);
        return;
      }

      if (!Array.isArray(data.items) || data.items.length === 0) {
        setMessage(
          "Es konnten keine Gerichte auf den Bildern erkannt werden."
        );
        setAnalyzing(false);
        return;
      }

      setAiItems(data.items);
      setMessage(
        `${data.items.length} Einträge erkannt. Bitte prüfen Sie die Ergebnisse.`
      );
    } catch (error) {
      console.error(error);
      setMessage("Fehler bei der KI-Analyse.");
    }

    setAnalyzing(false);
  }

  function updateAIItem(
    index: number,
    field: keyof AIItem,
    value: string
  ) {
    setAiItems((current) =>
      current.map((item, currentIndex) => {
        if (currentIndex !== index) return item;

        if (field === "price") {
          const normalized = value.replace(",", ".");

          return {
            ...item,
            price:
              normalized.trim() === ""
                ? null
                : Number.isNaN(Number(normalized))
                ? item.price
                : Number(normalized),
          };
        }

        return {
          ...item,
          [field]: value.trim() === "" ? null : value,
        };
      })
    );
  }

  function removeAIItem(index: number) {
    setAiItems((current) =>
      current.filter((_, currentIndex) => currentIndex !== index)
    );
  }

  async function importAIItems() {
    if (!restaurantId || aiItems.length === 0) return;

    setImporting(true);
    setMessage("");

    const rows = aiItems
      .filter((item) => item.name.trim() !== "")
      .map((item) => ({
        restaurant_id: restaurantId,
        name: item.name.trim(),
        category: item.category?.trim() || null,
        description: item.description?.trim() || null,
        price: item.price,
        currency: item.currency || "CHF",
        is_available: true,
        is_confirmed: false,
      }));

    if (rows.length === 0) {
      setMessage("Keine gültigen Einträge zum Speichern.");
      setImporting(false);
      return;
    }

    const { data, error } = await supabase
      .from("menu_items")
      .insert(rows)
      .select();

    if (error) {
      console.error(error);
      setMessage("Die erkannten Gerichte konnten nicht gespeichert werden.");
      setImporting(false);
      return;
    }

    setItems((current) => [...current, ...(data || [])]);
    setAiItems([]);
    setMenuImages([]);

    setMessage(
      `${data?.length || 0} Einträge wurden gespeichert. Bitte bestätigen Sie die Gerichte.`
    );

    setImporting(false);
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();

    if (!restaurantId || !name.trim()) return;

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

  function startEditing(item: MenuItem) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditCategory(item.category || "");
    setEditPrice(item.price === null ? "" : String(item.price));
    setMessage("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditName("");
    setEditCategory("");
    setEditPrice("");
  }

  async function saveEdit(item: MenuItem) {
    if (!editName.trim()) {
      setMessage("Bitte geben Sie einen Namen ein.");
      return;
    }

    const parsedPrice =
      editPrice.trim() === ""
        ? null
        : Number(editPrice.replace(",", "."));

    if (parsedPrice !== null && Number.isNaN(parsedPrice)) {
      setMessage("Bitte geben Sie einen gültigen Preis ein.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("menu_items")
      .update({
        name: editName.trim(),
        category: editCategory.trim() || null,
        price: parsedPrice,
        is_confirmed: false,
      })
      .eq("id", item.id)
      .select()
      .single();

    if (error) {
      setMessage("Änderung konnte nicht gespeichert werden.");
      setSaving(false);
      return;
    }

    setItems((current) =>
      current.map((currentItem) =>
        currentItem.id === item.id ? data : currentItem
      )
    );

    cancelEditing();
    setMessage("Änderung wurde gespeichert.");
    setSaving(false);
  }

  async function deleteItem(item: MenuItem) {
    const confirmed = window.confirm(
      `Möchten Sie "${item.name}" wirklich löschen?`
    );

    if (!confirmed) return;

    setMessage("");

    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", item.id);

    if (error) {
      setMessage("Gericht konnte nicht gelöscht werden.");
      return;
    }

    setItems((current) =>
      current.filter((currentItem) => currentItem.id !== item.id)
    );

    setMessage("Gericht wurde gelöscht.");
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
            <p className="text-sm font-bold text-orange-500">ZELLOO</p>

            <h1 className="text-3xl font-black mt-1">Speisekarte</h1>

            <p className="text-gray-500 mt-1">{restaurantName}</p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="bg-black text-white px-4 py-2 rounded-xl font-semibold"
          >
            Dashboard
          </button>
        </div>

        {/* AI PHOTO UPLOAD */}

        <div className="bg-black text-white rounded-2xl p-5 mb-6">
          <p className="text-sm text-orange-500 font-bold">ZELLOO AI</p>

          <h2 className="text-xl font-black mt-1">
            Speisekarte fotografieren
          </h2>

          <p className="text-sm text-gray-400 mt-2 mb-5">
            Fotografieren Sie Ihre Speisekarte oder laden Sie mehrere Bilder hoch.
          </p>

          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-zinc-700 rounded-2xl p-8 text-center hover:border-orange-500">
              <div className="text-4xl mb-3">📸</div>

              <p className="font-bold">Fotos auswählen</p>

              <p className="text-sm text-gray-400 mt-1">
                Kamera oder Fotomediathek
              </p>
            </div>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImages}
              className="hidden"
            />
          </label>

          {menuImages.length > 0 && (
            <div className="mt-5">
              <p className="font-bold mb-3">
                {menuImages.length} Foto(s) ausgewählt
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {menuImages.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="bg-zinc-900 rounded-xl p-3"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Speisekarte"
                      className="w-full h-32 object-cover rounded-lg"
                    />

                    <p className="text-xs text-gray-400 truncate mt-2">
                      {file.name}
                    </p>

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="text-red-400 text-sm font-bold mt-2"
                    >
                      Entfernen
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={analyzeMenu}
                disabled={analyzing}
                className="w-full bg-orange-500 text-black font-black p-3 rounded-xl mt-5 disabled:opacity-50"
              >
                {analyzing
                  ? "Zelloo AI analysiert..."
                  : "Mit Zelloo AI analysieren"}
              </button>
            </div>
          )}
        </div>

        {/* AI REVIEW */}

        {aiItems.length > 0 && (
          <div className="bg-white border-2 border-orange-400 rounded-2xl p-5 mb-6">
            <div className="mb-5">
              <p className="text-sm font-bold text-orange-500">
                ZELLOO AI
              </p>

              <h2 className="text-xl font-black">
                Erkannte Einträge prüfen
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Prüfen und korrigieren Sie Namen und Preise vor dem Speichern.
              </p>
            </div>

            <div className="space-y-4">
              {aiItems.map((item, index) => (
                <div key={index} className="border rounded-xl p-4">
                  <div className="space-y-3">
                    <input
                      value={item.name}
                      onChange={(e) =>
                        updateAIItem(index, "name", e.target.value)
                      }
                      placeholder="Name"
                      className="w-full border rounded-xl px-4 py-3"
                    />

                    <input
                      value={item.category || ""}
                      onChange={(e) =>
                        updateAIItem(index, "category", e.target.value)
                      }
                      placeholder="Kategorie"
                      className="w-full border rounded-xl px-4 py-3"
                    />

                    <textarea
                      value={item.description || ""}
                      onChange={(e) =>
                        updateAIItem(index, "description", e.target.value)
                      }
                      placeholder="Beschreibung"
                      className="w-full border rounded-xl px-4 py-3"
                    />

                    <input
                      value={item.price === null ? "" : String(item.price)}
                      onChange={(e) =>
                        updateAIItem(index, "price", e.target.value)
                      }
                      placeholder="Preis fehlt"
                      inputMode="decimal"
                      className="w-full border rounded-xl px-4 py-3"
                    />

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold">
                        {item.currency || "CHF"}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeAIItem(index)}
                        className="text-red-600 text-sm font-bold"
                      >
                        Entfernen
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={importAIItems}
              disabled={importing}
              className="w-full bg-black text-white font-black p-3 rounded-xl mt-5 disabled:opacity-50"
            >
              {importing
                ? "Wird gespeichert..."
                : `${aiItems.length} Einträge übernehmen`}
            </button>
          </div>
        )}

        {/* MANUAL ADD */}

        <div className="bg-white border rounded-2xl p-5 mb-6">
          <h2 className="text-xl font-black">
            Gericht manuell hinzufügen
          </h2>

          <p className="text-sm text-gray-500 mt-1 mb-5">
            Sie können Gerichte auch manuell hinzufügen.
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
        </div>

        {message && (
          <div className="bg-white border rounded-xl p-4 mb-6">
            <p className="text-sm font-semibold">{message}</p>
          </div>
        )}

        {/* SAVED MENU */}

        <div className="bg-white border rounded-2xl p-5">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-xl font-black">Ihre Speisekarte</h2>

              <p className="text-sm text-gray-500 mt-1">
                Prüfen, bearbeiten und bestätigen Sie Ihre Gerichte.
              </p>
            </div>

            <span className="bg-gray-100 rounded-full px-3 py-1 text-sm font-bold">
              {items.length}
            </span>
          </div>

          {items.length === 0 ? (
            <div className="border border-dashed rounded-xl p-8 text-center">
              <p className="font-bold">Noch keine Gerichte</p>

              <p className="text-gray-500 text-sm mt-1">
                Ihre Speisekarte ist noch leer.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="border rounded-xl p-4">
                  {editingId === item.id ? (
                    <div className="space-y-3">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Gericht"
                        className="w-full border rounded-xl px-4 py-3"
                      />

                      <input
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        placeholder="Kategorie"
                        className="w-full border rounded-xl px-4 py-3"
                      />

                      <input
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        placeholder="Preis"
                        inputMode="decimal"
                        className="w-full border rounded-xl px-4 py-3"
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(item)}
                          disabled={saving}
                          className="bg-black text-white rounded-lg px-4 py-2 text-sm font-bold"
                        >
                          Speichern
                        </button>

                        <button
                          onClick={cancelEditing}
                          className="border rounded-lg px-4 py-2 text-sm font-bold"
                        >
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
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

                          {item.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {item.description}
                            </p>
                          )}

                          <p className="font-semibold mt-1">
                            {item.price === null
                              ? "Preis fehlt"
                              : `${item.currency} ${Number(
                                  item.price
                                ).toFixed(2)}`}
                          </p>
                        </div>

                        <span
                          className={
                            item.is_confirmed
                              ? "text-green-600 text-sm font-bold"
                              : "text-orange-500 text-sm font-bold"
                          }
                        >
                          {item.is_confirmed ? "Bestätigt" : "Prüfen"}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <button
                          onClick={() => startEditing(item)}
                          className="border rounded-lg px-4 py-2 text-sm font-bold"
                        >
                          Bearbeiten
                        </button>

                        <button
                          onClick={() => toggleConfirmed(item)}
                          className="border rounded-lg px-4 py-2 text-sm font-bold"
                        >
                          {item.is_confirmed
                            ? "Bestätigung entfernen"
                            : "Gericht bestätigen"}
                        </button>

                        <button
                          onClick={() => deleteItem(item)}
                          className="border border-red-300 text-red-600 rounded-lg px-4 py-2 text-sm font-bold"
                        >
                          Löschen
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}