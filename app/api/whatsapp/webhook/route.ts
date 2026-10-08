import { NextResponse } from "next/server";
import {
  getOrderableMenu,
  getRestaurant,
  getSupabaseAdmin,
} from "../../../../lib/supabase-server";
import { parseOrderText } from "../../../../lib/order-ai";
import {
  extractRestaurantCode,
  getWebhookUrl,
  isSupportedVoiceType,
  isValidTwilioSignature,
  sendWhatsAppMessage,
  transcribeVoiceNote,
} from "../../../../lib/whatsapp";

export const runtime = "nodejs";

type CartLine = {
  menuItemId: string;
  name: string;
  priceCents: number;
  quantity: number;
  note: string | null;
};

type Session = {
  phone: string;
  restaurant_id: string;
  step: "collecting" | "ask_type" | "ask_address" | "ask_name" | "confirm";
  cart: CartLine[];
  order_type: "delivery" | "pickup" | null;
  address: string | null;
  customer_name: string | null;
};

const DONE_WORDS = ["fertig", "fertig bestellen", "das wars", "das war's", "done"];
const CANCEL_WORDS = ["abbrechen", "stornieren", "cancel", "storno"];

function formatChf(cents: number) {
  return (cents / 100).toFixed(2);
}

function cartTotal(cart: CartLine[]) {
  return cart.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);
}

function cartSummary(cart: CartLine[]) {
  if (cart.length === 0) return "Ihr Warenkorb ist leer.";
  const lines = cart.map(
    (line) =>
      `${line.quantity}x ${line.name}${line.note ? ` (${line.note})` : ""} – CHF ${formatChf(line.priceCents * line.quantity)}`
  );
  return `${lines.join("\n")}\n\nTotal: CHF ${formatChf(cartTotal(cart))}`;
}

async function getSession(phone: string): Promise<Session | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("whatsapp_sessions")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();
  if (error) {
    console.error("Zelloo WhatsApp session read error:", error.message);
    return null;
  }
  return data as Session | null;
}

async function saveSession(session: Session) {
  const { error } = await getSupabaseAdmin()
    .from("whatsapp_sessions")
    .upsert({ ...session, updated_at: new Date().toISOString() }, { onConflict: "phone" });
  if (error) throw error;
}

async function clearSession(phone: string) {
  await getSupabaseAdmin().from("whatsapp_sessions").delete().eq("phone", phone);
}

// Twilio retries webhooks, so each MessageSid is claimed once. If the table is
// missing the bot keeps working without duplicate protection.
async function claimMessage(messageSid: string): Promise<boolean> {
  if (!messageSid) return true;
  const { error } = await getSupabaseAdmin()
    .from("whatsapp_processed_messages")
    .insert({ message_sid: messageSid });
  if (!error) return true;
  if (error.code === "23505") return false;
  console.error("Zelloo WhatsApp dedupe error:", error.message);
  return true;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const params: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") params[key] = value;
    }

    if (
      !isValidTwilioSignature(
        getWebhookUrl(request),
        params,
        request.headers.get("x-twilio-signature")
      )
    ) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const from = params.From || "";
    let body = (params.Body || "").trim();
    const phone = from.replace("whatsapp:", "").trim();
    const mediaUrl = params.MediaUrl0 || "";
    const mediaType = params.MediaContentType0 || "";
    const isVoice =
      Number(params.NumMedia || 0) > 0 && Boolean(mediaUrl) && isSupportedVoiceType(mediaType);

    if (!phone || (!body && !isVoice)) {
      return new NextResponse(null, { status: 200 });
    }

    if (!(await claimMessage(params.MessageSid || ""))) {
      return new NextResponse(null, { status: 200 });
    }

    const code = extractRestaurantCode(body);

    if (code) {
      const restaurant = await getRestaurant(code);
      if (!restaurant) {
        await sendWhatsAppMessage(
          phone,
          "Dieses Restaurant wurde nicht gefunden. Bitte nutzen Sie den Bestelllink Ihres Restaurants."
        );
        return new NextResponse(null, { status: 200 });
      }

      const session: Session = {
        phone,
        restaurant_id: String(restaurant.id),
        step: "collecting",
        cart: [],
        order_type: null,
        address: null,
        customer_name: null,
      };
      await saveSession(session);

      await sendWhatsAppMessage(
        phone,
        `Willkommen bei ${restaurant.name}! Schreiben Sie einfach, was Sie bestellen möchten, z.B. "2x Pizza Margherita". Wenn Sie fertig sind, schreiben Sie "fertig".`
      );
      return new NextResponse(null, { status: 200 });
    }

    const session = await getSession(phone);
    if (!session) {
      await sendWhatsAppMessage(
        phone,
        "Bitte nutzen Sie den Bestelllink Ihres Restaurants, um eine Bestellung zu starten."
      );
      return new NextResponse(null, { status: 200 });
    }

    if (isVoice && !body) {
      try {
        const vocabulary =
          session.step === "collecting"
            ? (await getOrderableMenu(session.restaurant_id)).map((item) => item.name)
            : [];
        body = await transcribeVoiceNote(mediaUrl, mediaType, vocabulary);
      } catch (error) {
        console.error("Zelloo WhatsApp voice error:", error);
      }
      if (!body) {
        await sendWhatsAppMessage(
          phone,
          "Die Sprachnachricht konnte nicht verstanden werden. Bitte schreiben Sie Ihre Bestellung als Text."
        );
        return new NextResponse(null, { status: 200 });
      }
    }

    const lower = body.toLowerCase();

    if (CANCEL_WORDS.includes(lower)) {
      await clearSession(phone);
      await sendWhatsAppMessage(phone, "Bestellung abgebrochen.");
      return new NextResponse(null, { status: 200 });
    }

    if (session.step === "collecting") {
      if (DONE_WORDS.includes(lower)) {
        if (session.cart.length === 0) {
          await sendWhatsAppMessage(
            phone,
            "Ihr Warenkorb ist noch leer. Bitte bestellen Sie zuerst etwas."
          );
          return new NextResponse(null, { status: 200 });
        }
        session.step = "ask_type";
        await saveSession(session);
        await sendWhatsAppMessage(
          phone,
          "Lieferung oder Abholung? Antworten Sie mit \"Lieferung\" oder \"Abholung\"."
        );
        return new NextResponse(null, { status: 200 });
      }

      const menu = await getOrderableMenu(session.restaurant_id);
      if (menu.length === 0) {
        await sendWhatsAppMessage(
          phone,
          "Dieses Restaurant hat aktuell keine bestellbaren Artikel."
        );
        return new NextResponse(null, { status: 200 });
      }

      const parsed = await parseOrderText(menu, body);
      const menuById = new Map(menu.map((item) => [item.id, item]));

      for (const item of parsed.items) {
        const menuItem = menuById.get(item.menuItemId);
        if (!menuItem) continue;
        const existing = session.cart.find(
          (line) => line.menuItemId === item.menuItemId && line.note === item.note
        );
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          session.cart.push({
            menuItemId: menuItem.id,
            name: menuItem.name,
            priceCents: menuItem.priceCents,
            quantity: item.quantity,
            note: item.note,
          });
        }
      }

      await saveSession(session);

      const replyParts: string[] = [];
      if (parsed.items.length > 0) {
        replyParts.push(`Hinzugefügt. Ihr Warenkorb:\n\n${cartSummary(session.cart)}`);
      }
      if (parsed.suggestions.length > 0) {
        const suggestionLines = parsed.suggestions.map(
          (s) => `"${s.query}" – meinten Sie: ${s.options.map((o) => o.name).join(", ")}?`
        );
        replyParts.push(suggestionLines.join("\n"));
      }
      if (parsed.notFound.length > 0) {
        replyParts.push(`Nicht gefunden: ${parsed.notFound.join(", ")}`);
      }
      if (replyParts.length === 0) {
        replyParts.push(
          "Das habe ich nicht verstanden. Bitte schreiben Sie z.B. \"2x Pizza Margherita\"."
        );
      }
      replyParts.push('Schreiben Sie weitere Artikel oder "fertig" zum Abschliessen.');

      await sendWhatsAppMessage(phone, replyParts.join("\n\n"));
      return new NextResponse(null, { status: 200 });
    }

    if (session.step === "ask_type") {
      if (/lieferung|delivery/i.test(body)) {
        session.order_type = "delivery";
        session.step = "ask_address";
        await saveSession(session);
        await sendWhatsAppMessage(phone, "Bitte senden Sie Ihre Lieferadresse.");
      } else if (/abholung|pickup/i.test(body)) {
        session.order_type = "pickup";
        session.step = "ask_name";
        await saveSession(session);
        await sendWhatsAppMessage(phone, "Wie ist Ihr Name?");
      } else {
        await sendWhatsAppMessage(
          phone,
          "Bitte antworten Sie mit \"Lieferung\" oder \"Abholung\"."
        );
      }
      return new NextResponse(null, { status: 200 });
    }

    if (session.step === "ask_address") {
      session.address = body.slice(0, 200);
      session.step = "ask_name";
      await saveSession(session);
      await sendWhatsAppMessage(phone, "Wie ist Ihr Name?");
      return new NextResponse(null, { status: 200 });
    }

    if (session.step === "ask_name") {
      session.customer_name = body.slice(0, 60);
      session.step = "confirm";
      await saveSession(session);
      await sendWhatsAppMessage(
        phone,
        `${cartSummary(session.cart)}\n\n${session.order_type === "delivery" ? `Lieferung an: ${session.address}` : "Abholung"}\nName: ${session.customer_name}\n\nBestellung bestätigen? Antworten Sie mit "Ja" oder "Nein".`
      );
      return new NextResponse(null, { status: 200 });
    }

    if (session.step === "confirm") {
      if (/^ja$|^yes$|^oui$|^si$/i.test(body.trim())) {
        const restaurant = await getRestaurant(session.restaurant_id);
        if (!restaurant) {
          await clearSession(phone);
          await sendWhatsAppMessage(phone, "Restaurant nicht gefunden. Bitte erneut starten.");
          return new NextResponse(null, { status: 200 });
        }

        const totalCents = cartTotal(session.cart);
        const supabase = getSupabaseAdmin();

        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            restaurant_id: restaurant.id,
            customer_name: session.customer_name || "Gast",
            customer_phone: phone,
            customer_address: session.order_type === "delivery" ? session.address : null,
            order_type: session.order_type,
            status: "new",
            total_cents: totalCents,
            notes: "Bestellung via WhatsApp",
          })
          .select("id")
          .single();

        if (orderError || !order) {
          console.error("Zelloo WhatsApp order create error:", orderError);
          await sendWhatsAppMessage(
            phone,
            "Bestellung konnte nicht gesendet werden. Bitte versuchen Sie es erneut."
          );
          return new NextResponse(null, { status: 200 });
        }

        const { error: itemsError } = await supabase.from("order_items").insert(
          session.cart.map((line) => ({
            order_id: order.id,
            item_name: line.name,
            quantity: line.quantity,
            unit_price_cents: line.priceCents,
            notes: line.note,
          }))
        );

        if (itemsError) {
          await supabase.from("orders").delete().eq("id", order.id);
          console.error("Zelloo WhatsApp order items error:", itemsError);
          await sendWhatsAppMessage(
            phone,
            "Bestellung konnte nicht gesendet werden. Bitte versuchen Sie es erneut."
          );
          return new NextResponse(null, { status: 200 });
        }

        await clearSession(phone);
        await sendWhatsAppMessage(
          phone,
          `Bestellung Nr. ${order.id} erhalten! Vielen Dank. Total: CHF ${formatChf(totalCents)}.`
        );
      } else if (/^nein$|^no$|^non$/i.test(body.trim())) {
        await clearSession(phone);
        await sendWhatsAppMessage(phone, "Bestellung abgebrochen.");
      } else {
        await sendWhatsAppMessage(phone, "Bitte antworten Sie mit \"Ja\" oder \"Nein\".");
      }
      return new NextResponse(null, { status: 200 });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Zelloo WhatsApp webhook error:", error);
    return new NextResponse(null, { status: 200 });
  }
}
