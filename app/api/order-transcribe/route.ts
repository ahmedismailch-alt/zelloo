import OpenAI, { toFile } from "openai";
import { NextResponse } from "next/server";
import {
  getOrderableMenu,
  isValidRestaurantId,
} from "../../../lib/supabase-server";
import { isOrderLang } from "../../../lib/order-i18n";

export const runtime = "nodejs";

const MAX_AUDIO_BYTES = 2 * 1024 * 1024;
const MAX_PROMPT_CHARS = 800;

const EXTENSION_BY_TYPE: Record<string, string> = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mp4": "mp4",
  "audio/m4a": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "m4a",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
};

function extensionFor(type: string): string | null {
  const base = type.split(";")[0].trim().toLowerCase();
  return EXTENSION_BY_TYPE[base] ?? null;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY fehlt." }, { status: 500 });
    }

    const form = await request.formData().catch(() => null);
    if (!form) {
      return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
    }

    const restaurantId = form.get("restaurantId");
    const lang = form.get("lang");
    const audio = form.get("audio");

    if (!isValidRestaurantId(restaurantId)) {
      return NextResponse.json({ error: "Ungültiges Restaurant." }, { status: 400 });
    }

    if (!(audio instanceof Blob) || audio.size === 0) {
      return NextResponse.json({ error: "Keine Aufnahme." }, { status: 400 });
    }

    if (audio.size > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: "Aufnahme zu lang." }, { status: 413 });
    }

    const extension = extensionFor(audio.type);
    if (!extension) {
      return NextResponse.json({ error: "Audioformat nicht unterstützt." }, { status: 415 });
    }

    const menu = await getOrderableMenu(restaurantId);
    if (menu.length === 0) {
      return NextResponse.json({ error: "Keine bestellbaren Artikel vorhanden." }, { status: 404 });
    }

    // Menu names as vocabulary help the model spell dish names correctly.
    const prompt = menu
      .map((item) => item.name)
      .join(", ")
      .slice(0, MAX_PROMPT_CHARS);

    const openai = new OpenAI({ apiKey });
    const file = await toFile(audio, `order.${extension}`, { type: audio.type });

    const result = await openai.audio.transcriptions.create({
      file,
      model: "gpt-4o-mini-transcribe",
      prompt,
      ...(isOrderLang(lang) ? { language: lang } : {}),
    });

    const text = (result.text || "").trim().slice(0, 500);
    return NextResponse.json({ text });
  } catch (error) {
    console.error("order-transcribe failed", error);
    return NextResponse.json({ error: "Transkription fehlgeschlagen." }, { status: 500 });
  }
}
