import { createHmac, timingSafeEqual } from "crypto";
import OpenAI, { toFile } from "openai";

// Thin wrapper around the Twilio REST API for sending WhatsApp messages.
// No Twilio SDK needed — a plain authenticated POST is enough.
export async function sendWhatsAppMessage(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!sid || !token || !from) {
    throw new Error("Twilio ist nicht konfiguriert.");
  }

  const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  const fromFormatted = from.startsWith("whatsapp:") ? from : `whatsapp:${from}`;

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: fromFormatted,
        To: toFormatted,
        Body: body.slice(0, 1500),
      }),
    }
  );

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    console.error("Zelloo WhatsApp send error:", res.status, errorText);
    throw new Error("WhatsApp-Nachricht konnte nicht gesendet werden.");
  }
}

// Builds the wa.me deep link a restaurant shares with its customers.
// Opening it starts a WhatsApp chat with Zelloo's number, pre-filled with a
// code that identifies which restaurant the order is for.
export function getWhatsAppOrderLink(restaurantId: string | number): string | null {
  const number = process.env.TWILIO_WHATSAPP_NUMBER;
  if (!number) return null;

  const digits = number.replace("whatsapp:", "").replace(/[^\d]/g, "");
  if (!digits) return null;

  const prefilledText = encodeURIComponent(`ZELLOO-${restaurantId}`);
  return `https://wa.me/${digits}?text=${prefilledText}`;
}

// The URL Twilio signed is the one configured in the Twilio console, so behind
// Vercel's proxy it is rebuilt from the forwarded host unless overridden.
export function getWebhookUrl(request: Request): string {
  if (process.env.TWILIO_WEBHOOK_URL) return process.env.TWILIO_WEBHOOK_URL;
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host;
  const proto = request.headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host}${url.pathname}${url.search}`;
}

export function isValidTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string | null
): boolean {
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!token || !signature) return false;

  const data = Object.keys(params)
    .sort()
    .reduce((acc, key) => acc + key + params[key], url);
  const expected = createHmac("sha1", token).update(data).digest("base64");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

const MAX_VOICE_BYTES = 2 * 1024 * 1024;

const VOICE_EXTENSIONS: Record<string, string> = {
  "audio/ogg": "ogg",
  "audio/opus": "ogg",
  "audio/mpeg": "mp3",
  "audio/mp4": "mp4",
  "audio/aac": "m4a",
  "audio/amr": "mp4",
};

export function isSupportedVoiceType(contentType: string): boolean {
  return contentType.split(";")[0].trim().toLowerCase() in VOICE_EXTENSIONS;
}

// Downloads a WhatsApp voice note from Twilio and turns it into text. The audio
// is only held in memory for the transcription and never stored.
export async function transcribeVoiceNote(
  mediaUrl: string,
  contentType: string,
  vocabulary: string[]
): Promise<string> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!sid || !token || !apiKey) throw new Error("Voice transcription not configured.");

  const base = contentType.split(";")[0].trim().toLowerCase();
  const extension = VOICE_EXTENSIONS[base];
  if (!extension) throw new Error("Unsupported audio type.");

  const mediaHost = new URL(mediaUrl).hostname;
  if (!mediaHost.endsWith("twilio.com")) throw new Error("Unexpected media host.");

  const res = await fetch(mediaUrl, {
    headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}` },
  });
  if (!res.ok) throw new Error(`Media download failed: ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length === 0 || buffer.length > MAX_VOICE_BYTES) {
    throw new Error("Voice note empty or too long.");
  }

  const openai = new OpenAI({ apiKey });
  const file = await toFile(buffer, `order.${extension}`, { type: base });
  const result = await openai.audio.transcriptions.create({
    file,
    model: "gpt-4o-mini-transcribe",
    prompt: vocabulary.join(", ").slice(0, 800),
  });

  return (result.text || "").trim().slice(0, 500);
}

export function extractRestaurantCode(messageBody: string): string | null {
  const match = messageBody.match(/ZELLOO-([A-Za-z0-9-]{1,64})/i);
  return match ? match[1] : null;
}
