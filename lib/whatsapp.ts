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

export function extractRestaurantCode(messageBody: string): string | null {
  const match = messageBody.match(/ZELLOO-([A-Za-z0-9-]{1,64})/i);
  return match ? match[1] : null;
}
