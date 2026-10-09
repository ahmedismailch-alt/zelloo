"use client";

import { Logo } from "@/components/logo";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { getMenuItemFallbackImage } from "../../lib/menu-item-fallback-image";
import { DashboardShell } from "../../components/dashboard/dashboard-shell";

type MenuItem = {
  id: string;
  restaurant_id: number;
  category: string | null;
  subcategory: string | null;
  name: string;
  description: string | null;
  price: number | null;
  currency: string;
  is_available: boolean;
  is_confirmed: boolean;
  name_translations: Record<string, string> | null;
  image_url: string | null;
};

const SUBCATEGORY_SUGGESTIONS: Record<string, string[]> = {
  getränke: ["Warme Getränke", "Kalte Getränke", "Alkoholfrei", "Alkoholisch"],
  hauptgerichte: ["Fleisch", "Vegetarisch", "Vegan", "Fisch"],
  vorspeisen: ["Kalt", "Warm"],
  desserts: ["Kalt", "Warm"],
  snacks: ["Herzhaft", "Süss"],
};

function getSubcategorySuggestions(categoryValue: string): string[] {
  const key = categoryValue.trim().toLowerCase();
  return SUBCATEGORY_SUGGESTIONS[key] || [];
}

function isValidImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function arabicNameOf(item: MenuItem) {
  const value = item.name_translations?.ar;
  return typeof value === "string" ? value.trim() : "";
}

const CATEGORY_NAME_EXAMPLES: Array<{ match: RegExp; example: string }> = [
  { match: /getränk|drink|bevand|boisson|bevuta/i, example: "Coca-Cola" },
  { match: /vorspeis|starter|antipast|entrée/i, example: "Bruschetta" },
  { match: /pizza/i, example: "Margherita" },
  { match: /pasta|nudel/i, example: "Spaghetti Bolognese" },
  { match: /haupt|main|principal|plat/i, example: "Pouletgeschnetzeltes" },
  { match: /dessert|nachspeis|dolce/i, example: "Tiramisu" },
  { match: /snack|sides|beilage/i, example: "Pommes Frites" },
  { match: /salat|salad|insalata/i, example: "Caesar Salat" },
];

function namePlaceholderForCategory(category: string): string {
  const trimmed = category.trim();
  const match = trimmed
    ? CATEGORY_NAME_EXAMPLES.find((entry) => entry.match.test(trimmed))
    : undefined;
  return `Gericht, z.B. ${match ? match.example : "Margherita"}`;
}

function readCategoryMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === "string" && entry[1].trim() !== ""
    )
  );
}

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
  const [subcategory, setSubcategory] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editSubcategory, setEditSubcategory] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editArabic, setEditArabic] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  const [generatingArabic, setGeneratingArabic] = useState(false);
  const [categoryAr, setCategoryAr] = useState<Record<string, string>>({});
  const [categoryArAvailable, setCategoryArAvailable] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  const [search, setSearch] = useState("");
  const [priceEditingId, setPriceEditingId] = useState<string | null>(null);
  const [priceDraft, setPriceDraft] = useState("");
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

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

      const { data: categoryData, error: categoryError } = await supabase
        .from("restaurants")
        .select("category_translations")
        .eq("id", restaurant.id)
        .maybeSingle();
      if (!categoryError) {
        setCategoryArAvailable(true);
        setCategoryAr(readCategoryMap(categoryData?.category_translations));
      }

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
  async function compressImage(file: File): Promise<File> {
    const image = await createImageBitmap(file);

    const maxWidth = 1600;
    const maxHeight = 1600;

    let width = image.width;
    let height = image.height;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(
        maxWidth / width,
        maxHeight / height
      );

      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      image.close();
      throw new Error("Bild konnte nicht verarbeitet werden.");
    }

    context.drawImage(image, 0, 0, width, height);
    image.close();

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) {
            resolve(result);
          } else {
            reject(
              new Error("Bild konnte nicht komprimiert werden.")
            );
          }
        },
        "image/jpeg",
        0.78
      );
    });

    return new File(
      [blob],
      file.name.replace(/\.[^/.]+$/, "") + ".jpg",
      {
        type: "image/jpeg",
      }
    );
  }

  async function uploadImageFile(file: File): Promise<string | null> {
    try {
      const compressedFile = await compressImage(file);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("no session");

      const formData = new FormData();
      formData.append("image", compressedFile);

      const response = await fetch("/api/menu-image-upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Upload fehlgeschlagen.");
      }

      return data.url as string;
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Bild konnte nicht hochgeladen werden."
      );
      return null;
    }
  }

  async function handleNewImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadingImage(true);
    setMessage("");
    const url = await uploadImageFile(file);
    setUploadingImage(false);

    if (url) setImageUrl(url);
  }

  async function handleEditImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadingEditImage(true);
    setMessage("");
    const url = await uploadImageFile(file);
    setUploadingEditImage(false);

    if (url) setEditImageUrl(url);
  }

  async function analyzeMenu() {
    if (menuImages.length === 0) return;

    setAnalyzing(true);
    setMessage("Fotos werden für Zelloo AI vorbereitet...");
    setAiItems([]);

    try {
      const formData = new FormData();

      for (const file of menuImages) {
        const compressedFile = await compressImage(file);
        formData.append("images", compressedFile);
      }

      const response = await fetch("/api/menu-analyze", {
        method: "POST",
        body: formData,
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          `Serverfehler (${response.status})`
        );
      }

      if (!response.ok) {
        setMessage(
          data?.error ||
            `Die Speisekarte konnte nicht analysiert werden (${response.status}).`
        );
        return;
      }

      if (!Array.isArray(data.items) || data.items.length === 0) {
        setMessage(
          "Es konnten keine Gerichte auf den Bildern erkannt werden."
        );
        return;
      }

      setAiItems(data.items);

      setMessage(
        `${data.items.length} Einträge erkannt. Bitte prüfen Sie die Ergebnisse.`
      );
    } catch (error) {
      console.error("Zelloo AI Fehler:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Fehler bei der KI-Analyse."
      );
    } finally {
      setAnalyzing(false);
    }
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

  async function requestArabicNames(
    itemIds: string[] | null,
    options: { silent?: boolean } = {}
  ) {
    if (itemIds && itemIds.length === 0) return;
    if (!options.silent) {
      setGeneratingArabic(true);
      setMessage("Arabische Namen werden erstellt...");
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("no session");

      const response = await fetch("/api/menu-transliterate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ itemIds, onlyMissing: itemIds === null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error);

      const updated = new Map<string, Record<string, string>>(
        (data.updated || []).map(
          (entry: { id: string; name_translations: Record<string, string> }) => [
            entry.id,
            entry.name_translations,
          ]
        )
      );
      setItems((current) =>
        current.map((item) =>
          updated.has(String(item.id))
            ? { ...item, name_translations: updated.get(String(item.id))! }
            : item
        )
      );
      if (data.categoryTranslations) {
        setCategoryAr(readCategoryMap(data.categoryTranslations));
      }
      if (!options.silent) {
        setMessage(`${updated.size} arabische Namen wurden erstellt.`);
      }
    } catch {
      setMessage(
        options.silent
          ? "Gespeichert. Der arabische Name konnte nicht erstellt werden – bitte später «Arabische Namen erstellen» drücken."
          : "Arabische Namen konnten nicht erstellt werden."
      );
    } finally {
      if (!options.silent) setGeneratingArabic(false);
    }
  }

  async function saveCategoryArabic(categoryName: string) {
    setSavingCategory(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("no session");

      const response = await fetch("/api/menu-transliterate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          categoryEdit: { category: categoryName, ar: categoryDraft },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error);

      setCategoryAr(readCategoryMap(data.categoryTranslations));
      setEditingCategory(null);
      setMessage("Arabischer Kategoriename gespeichert.");
    } catch {
      setMessage("Arabischer Kategoriename konnte nicht gespeichert werden.");
    } finally {
      setSavingCategory(false);
    }
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
    void requestArabicNames(
      (data || []).map((item: MenuItem) => String(item.id)),
      { silent: true }
    );
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

    const trimmedImageUrl = imageUrl.trim();

    if (trimmedImageUrl && !isValidImageUrl(trimmedImageUrl)) {
      setMessage("Bitte geben Sie einen gültigen Bild-Link ein (http:// oder https://).");
      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        restaurant_id: restaurantId,
        name: name.trim(),
        category: category.trim() || null,
        subcategory: subcategory.trim() || null,
        price: parsedPrice,
        currency: "CHF",
        is_available: true,
        is_confirmed: false,
        image_url: trimmedImageUrl || null,
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
    setSubcategory("");
    setPrice("");
    setImageUrl("");

    setMessage("Gericht wurde hinzugefügt.");
    setSaving(false);
    void requestArabicNames([String(data.id)], { silent: true });
  }

  function startEditing(item: MenuItem) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditCategory(item.category || "");
    setEditSubcategory(item.subcategory || "");
    setEditPrice(item.price === null ? "" : String(item.price));
    setEditArabic(arabicNameOf(item));
    setEditImageUrl(item.image_url || "");
    setMessage("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditName("");
    setEditCategory("");
    setEditSubcategory("");
    setEditPrice("");
    setEditArabic("");
    setEditImageUrl("");
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

    const trimmedEditImageUrl = editImageUrl.trim();

    if (trimmedEditImageUrl && !isValidImageUrl(trimmedEditImageUrl)) {
      setMessage("Bitte geben Sie einen gültigen Bild-Link ein (http:// oder https://).");
      return;
    }

    setSaving(true);
    setMessage("");

    const nameChanged = editName.trim() !== item.name.trim();
    const arabicInput = editArabic.trim().slice(0, 120);
    const arabicEditedByHand = arabicInput !== arabicNameOf(item);
    const regenerateArabic = nameChanged && !arabicEditedByHand;

    const nextTranslations: Record<string, string> = {
      ...(item.name_translations || {}),
    };
    if (regenerateArabic || !arabicInput) {
      delete nextTranslations.ar;
    } else {
      nextTranslations.ar = arabicInput;
    }

    const { data, error } = await supabase
      .from("menu_items")
      .update({
        name: editName.trim(),
        category: editCategory.trim() || null,
        subcategory: editSubcategory.trim() || null,
        price: parsedPrice,
        is_confirmed: nameChanged ? false : item.is_confirmed,
        name_translations: nextTranslations,
        image_url: trimmedEditImageUrl || null,
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
    if (regenerateArabic) {
      void requestArabicNames([String(item.id)], { silent: true });
    }
  }

  function replaceItem(updated: MenuItem) {
    setItems((current) =>
      current.map((currentItem) =>
        currentItem.id === updated.id ? updated : currentItem
      )
    );
  }

  async function toggleAvailable(item: MenuItem) {
    setBusyItemId(item.id);
    setMessage("");

    const { data, error } = await supabase
      .from("menu_items")
      .update({ is_available: !item.is_available })
      .eq("id", item.id)
      .select()
      .single();

    setBusyItemId(null);

    if (error || !data) {
      setMessage("Änderung konnte nicht gespeichert werden.");
      return;
    }

    replaceItem(data);
    setMessage(
      data.is_available
        ? `"${item.name}" ist wieder verfügbar.`
        : `"${item.name}" ist ausverkauft und für Gäste ausgeblendet.`
    );
  }

  function startPriceEditing(item: MenuItem) {
    setPriceEditingId(item.id);
    setPriceDraft(item.price === null ? "" : Number(item.price).toFixed(2));
    setMessage("");
  }

  async function savePrice(item: MenuItem) {
    const parsed = Number(priceDraft.replace(",", ".").trim());

    if (priceDraft.trim() === "" || Number.isNaN(parsed) || parsed <= 0) {
      setMessage("Bitte geben Sie einen gültigen Preis ein.");
      return;
    }

    const rounded = Math.round(parsed * 100) / 100;

    setBusyItemId(item.id);

    const { data, error } = await supabase
      .from("menu_items")
      .update({ price: rounded })
      .eq("id", item.id)
      .select()
      .single();

    setBusyItemId(null);

    if (error || !data) {
      setMessage("Preis konnte nicht gespeichert werden.");
      return;
    }

    replaceItem(data);
    setPriceEditingId(null);
    setPriceDraft("");
    setMessage(`Neuer Preis für "${item.name}": CHF ${rounded.toFixed(2)}`);
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

  async function confirmAllItems() {
    if (!restaurantId) return;

    const unconfirmedItems = items.filter(
      (item) => !item.is_confirmed
    );

    if (unconfirmedItems.length === 0) {
      setMessage("Alle Gerichte sind bereits bestätigt.");
      return;
    }

    const confirmed = window.confirm(
      `Möchten Sie alle ${unconfirmedItems.length} Gerichte bestätigen?`
    );

    if (!confirmed) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("menu_items")
      .update({
        is_confirmed: true,
      })
      .eq("restaurant_id", restaurantId)
      .eq("is_confirmed", false);

    if (error) {
      console.error(error);
      setMessage("Die Gerichte konnten nicht bestätigt werden.");
      setSaving(false);
      return;
    }

    setItems((current) =>
      current.map((item) => ({
        ...item,
        is_confirmed: true,
      }))
    );

    setMessage(
      `${unconfirmedItems.length} Gerichte wurden bestätigt.`
    );

    setSaving(false);
  }

  const normalizedSearch = search.trim().toLowerCase();
  const groupedItems = Object.entries(
    items
      .filter(
        (item) =>
          normalizedSearch === "" ||
          item.name.toLowerCase().includes(normalizedSearch) ||
          (item.category || "").toLowerCase().includes(normalizedSearch)
      )
      .reduce<Record<string, MenuItem[]>>((groups, item) => {
        const key = item.category?.trim() || "Ohne Kategorie";
        (groups[key] ||= []).push(item);
        return groups;
      }, {})
  );

  const missingCategoryCount = categoryArAvailable
    ? new Set(
        items
          .map((item) => item.category?.trim() || "")
          .filter((name) => name && !categoryAr[name])
      ).size
    : 0;
  const missingArabicCount =
    items.filter((item) => !arabicNameOf(item)).length + missingCategoryCount;

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Wird geladen...</p>
      </main>
    );
  }

  return (
    <>
    <DashboardShell restaurantName={restaurantName} />
    <main className="min-h-screen bg-[#f8f9fb] text-black p-5 md:pl-[17rem]">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-start gap-4 mb-8">
          <div>
            <Logo size="sm" className="text-orange-500" />

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

          <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5">
            <span className="text-2xl leading-none" aria-hidden="true">
              🥤
            </span>
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-bold text-gray-900">
                Vergessen Sie die Getränke nicht:
              </span>{" "}
              Gäste können nur bestellen, was auf Ihrer Speisekarte
              steht. Fügen Sie Kaffee, Softdrinks oder Säfte als eigene
              Kategorie hinzu, damit nichts fehlt.
            </p>
          </div>

          <form onSubmit={addItem} className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={namePlaceholderForCategory(category)}
              required
              className="w-full border rounded-xl px-4 py-3"
            />

            <div>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Kategorie, z.B. Pizza"
                className="w-full border rounded-xl px-4 py-3"
              />

              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  "Getränke",
                  "Vorspeisen",
                  "Hauptgerichte",
                  "Desserts",
                  "Snacks",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setCategory(suggestion)}
                    className={`inline-flex items-center justify-center min-h-11 px-4 rounded-full border text-sm font-semibold transition-colors ${
                      category === suggestion
                        ? "bg-orange-500 border-orange-500 text-black"
                        : "bg-white border-gray-300 text-gray-700"
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {getSubcategorySuggestions(category).length > 0 && (
              <div>
                <input
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="Unterkategorie, z.B. Warme Getränke (optional)"
                  className="w-full border rounded-xl px-4 py-3"
                />

                <div className="flex flex-wrap gap-2 mt-2">
                  {getSubcategorySuggestions(category).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() =>
                        setSubcategory((current) =>
                          current === suggestion ? "" : suggestion
                        )
                      }
                      className={`inline-flex items-center justify-center min-h-11 px-4 rounded-full border text-sm font-semibold transition-colors ${
                        subcategory === suggestion
                          ? "bg-orange-500 border-orange-500 text-black"
                          : "bg-white border-gray-300 text-gray-700"
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Preis, z.B. 18.50"
              inputMode="decimal"
              className="w-full border rounded-xl px-4 py-3"
            />

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {imageUrl.trim() && isValidImageUrl(imageUrl.trim()) ? (
                  <img
                    src={imageUrl.trim() || "/placeholder.svg"}
                    alt=""
                    className="size-14 shrink-0 rounded-lg object-cover border"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : null}

                <label className="flex-1">
                  <div
                    className={`flex items-center justify-center gap-2 border rounded-xl px-4 py-3 font-semibold text-sm cursor-pointer ${
                      uploadingImage
                        ? "bg-gray-100 text-gray-400"
                        : "bg-orange-50 border-orange-300 text-orange-700"
                    }`}
                  >
                    {uploadingImage ? "Wird hochgeladen..." : "📷 Foto vom Gericht hochladen"}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleNewImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>

              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="oder Bild-Link einfügen, z.B. https://..."
                type="url"
                className="w-full border rounded-xl px-4 py-3 text-sm"
              />
            </div>

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
{items.some((item) => !item.is_confirmed) && (
  <button
    type="button"
    onClick={confirmAllItems}
    disabled={saving}
    className="mt-4 bg-green-600 text-white font-bold px-5 py-3 rounded-xl disabled:opacity-50"
  >
    {saving ? "Wird bestätigt..." : "✓ Alle Gerichte bestätigen"}
  </button>
)}
              <p className="text-sm text-gray-500 mt-1">
                Prüfen, bearbeiten und bestätigen Sie Ihre Gerichte.
              </p>

              {missingArabicCount > 0 && (
                <button
                  type="button"
                  onClick={() => requestArabicNames(null)}
                  disabled={generatingArabic}
                  className="mt-3 min-h-11 border-2 border-black rounded-xl px-4 py-2 font-bold disabled:opacity-50"
                >
                  {generatingArabic
                    ? "Wird erstellt..."
                    : `Arabische Namen erstellen (${missingArabicCount})`}
                </button>
              )}
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
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="menu-search" className="sr-only">
                  Gericht suchen
                </label>
                <input
                  id="menu-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Gericht suchen, z.B. calz"
                  className="w-full border rounded-xl px-4 py-3 text-base min-h-11"
                />
                {items.some((item) => !item.is_available) && (
                  <p className="text-sm text-gray-500">
                    {items.filter((item) => !item.is_available).length} ausverkauft
                    {" · für Gäste ausgeblendet"}
                  </p>
                )}
              </div>

              {groupedItems.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-6">
                  Keine Treffer für «{search}».
                </p>
              )}

              {groupedItems.map(([groupName, groupItems]) => (
                <section key={groupName} className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex flex-col gap-1">
                      <h3 className="font-black text-base break-words">{groupName}</h3>
                      {categoryArAvailable && groupName !== "Ohne Kategorie" && (
                        editingCategory === groupName ? (
                          <div className="flex flex-col gap-2">
                            <label
                              htmlFor={`category-ar-${groupName}`}
                              className="text-xs font-bold text-gray-500"
                            >
                              Arabischer Kategoriename
                            </label>
                            <input
                              id={`category-ar-${groupName}`}
                              value={categoryDraft}
                              onChange={(e) => setCategoryDraft(e.target.value)}
                              dir="rtl"
                              lang="ar"
                              maxLength={120}
                              className="w-full border rounded-xl px-4 py-2 text-base min-h-11"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => saveCategoryArabic(groupName)}
                                disabled={savingCategory}
                                className="min-h-11 bg-black text-white font-bold px-4 rounded-xl disabled:opacity-50"
                              >
                                {savingCategory ? "Speichern..." : "Speichern"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCategory(null)}
                                className="min-h-11 border font-bold px-4 rounded-xl"
                              >
                                Abbrechen
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {categoryAr[groupName] ? (
                              <p className="text-sm text-gray-600" dir="rtl" lang="ar">
                                {categoryAr[groupName]}
                              </p>
                            ) : (
                              <p className="text-xs text-gray-400">Kein arabischer Name</p>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategory(groupName);
                                setCategoryDraft(categoryAr[groupName] || "");
                              }}
                              aria-label={`Arabischen Namen für ${groupName} bearbeiten`}
                              className="size-11 shrink-0 rounded-full border flex items-center justify-center text-base"
                            >
                              {"✎"}
                            </button>
                          </div>
                        )
                      )}
                    </div>
                    <span className="shrink-0 bg-gray-100 rounded-full px-3 py-1 text-xs font-bold">
                      {groupItems.length}
                    </span>
                  </div>
              {groupItems.map((item) => (
                <div
                  key={item.id}
                  className={
                    item.is_available
                      ? "border rounded-xl p-4"
                      : "border rounded-xl p-4 bg-gray-100 opacity-70"
                  }
                >
                  {editingId === item.id ? (
                    <div className="space-y-3">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder={namePlaceholderForCategory(editCategory)}
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

                      <label className="flex flex-col gap-1 text-sm font-bold">
                        Arabischer Name (optional)
                        <input
                          value={editArabic}
                          onChange={(e) => setEditArabic(e.target.value)}
                          placeholder="z. B. بيتزا مار��ريتا"
                          dir="rtl"
                          lang="ar"
                          maxLength={120}
                          className="w-full border rounded-xl px-4 py-3 text-base font-normal"
                        />
                        <span className="text-xs font-normal text-gray-500">
                          Leer lassen: Zelloo erstellt ihn automatisch, wenn Sie den Namen ändern.
                        </span>
                      </label>

              <label className="flex flex-col gap-1 text-sm font-bold">
                Foto des Gerichts
                <div className="flex items-center gap-3">
                  {editImageUrl.trim() && isValidImageUrl(editImageUrl.trim()) ? (
                    <img
                      src={editImageUrl.trim() || "/placeholder.svg"}
                      alt=""
                      className="size-14 shrink-0 rounded-lg object-cover border"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}

                  <label className="flex-1">
                    <div
                      className={`flex items-center justify-center gap-2 border rounded-xl px-4 py-3 font-semibold text-sm cursor-pointer ${
                        uploadingEditImage
                          ? "bg-gray-100 text-gray-400"
                          : "bg-orange-50 border-orange-300 text-orange-700"
                      }`}
                    >
                      {uploadingEditImage ? "Wird hochgeladen..." : "📷 Foto hochladen"}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageUpload}
                      disabled={uploadingEditImage}
                      className="hidden"
                    />
                  </label>
                </div>

                <input
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="oder Bild-Link einfügen, z.B. https://..."
                  type="url"
                  className="w-full border rounded-xl px-4 py-3 text-sm font-normal"
                />
              </label>

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
                        <div className="min-w-0 flex gap-3">
                          <img
                            src={item.image_url || getMenuItemFallbackImage(item.category)}
                            alt=""
                            className="size-16 shrink-0 rounded-lg object-cover border"
                            onError={(e) => {
                              e.currentTarget.src = getMenuItemFallbackImage(item.category);
                            }}
                          />
                          <div className="min-w-0">
                          <p className="font-black text-lg text-pretty">
                            {item.name}
                          </p>

                          {arabicNameOf(item) ? (
                            <p className="text-sm text-gray-600" dir="rtl" lang="ar">
                              {arabicNameOf(item)}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400">
                              Kein arabischer Name
                            </p>
                          )}

                          {item.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {item.description}
                            </p>
                          )}

                          {priceEditingId === item.id ? (
                            <form
                              className="flex items-center gap-2 mt-2"
                              onSubmit={(e) => {
                                e.preventDefault();
                                savePrice(item);
                              }}
                            >
                              <span className="font-semibold">CHF</span>
                              <label htmlFor={`price-${item.id}`} className="sr-only">
                                Neuer Preis
                              </label>
                              <input
                                id={`price-${item.id}`}
                                value={priceDraft}
                                onChange={(e) => setPriceDraft(e.target.value)}
                                inputMode="decimal"
                                autoFocus
                                className="w-24 border rounded-lg px-3 py-2 text-base min-h-11"
                              />
                              <button
                                type="submit"
                                disabled={busyItemId === item.id}
                                aria-label="Preis speichern"
                                className="bg-black text-white rounded-lg min-h-11 min-w-11 font-bold disabled:opacity-50"
                              >
                                ✓
                              </button>
                              <button
                                type="button"
                                onClick={() => setPriceEditingId(null)}
                                aria-label="Abbrechen"
                                className="border rounded-lg min-h-11 min-w-11 font-bold"
                              >
                                ✕
                              </button>
                            </form>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startPriceEditing(item)}
                              className="font-semibold mt-1 min-h-11 underline decoration-dotted underline-offset-4 text-left"
                              aria-label={`Preis von ${item.name} ändern`}
                            >
                              {item.price === null
                                ? "Preis fehlt – tippen"
                                : `${item.currency} ${Number(
                                    item.price
                                  ).toFixed(2)}`}
                            </button>
                          )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span
                            className={
                              item.is_confirmed
                                ? "text-green-600 text-sm font-bold"
                                : "text-orange-500 text-sm font-bold"
                            }
                          >
                            {item.is_confirmed ? "Bestätigt" : "Prüfen"}
                          </span>
                          {!item.is_available && (
                            <span className="bg-gray-700 text-white rounded-full px-2 py-0.5 text-xs font-bold">
                              Ausverkauft
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleAvailable(item)}
                        disabled={busyItemId === item.id}
                        className={
                          item.is_available
                            ? "w-full mt-4 min-h-11 rounded-xl border-2 border-gray-800 font-bold disabled:opacity-50"
                            : "w-full mt-4 min-h-11 rounded-xl bg-green-600 text-white font-bold disabled:opacity-50"
                        }
                      >
                        {item.is_available ? "Ausverkauft" : "Wieder verfügbar"}
                      </button>

                      <div className="flex flex-wrap gap-2 mt-2">
                        <button
                          onClick={() => startEditing(item)}
                          className="border rounded-lg px-4 min-h-11 text-sm font-bold"
                        >
                          Bearbeiten
                        </button>

                        <button
                          onClick={() => toggleConfirmed(item)}
                          className="border rounded-lg px-4 min-h-11 text-sm font-bold"
                        >
                          {item.is_confirmed
                            ? "Bestätigung entfernen"
                            : "Gericht bestätigen"}
                        </button>

                        <button
                          onClick={() => deleteItem(item)}
                          className="border border-red-300 text-red-600 rounded-lg px-4 min-h-11 text-sm font-bold"
                        >
                          Löschen
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
    </>
  );
}
