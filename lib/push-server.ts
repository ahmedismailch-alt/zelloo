import { sendNotification, setVapidDetails } from "web-push";
import { getSupabaseAdmin } from "./supabase-server";

const READY_MESSAGES: Record<
  string,
  { title: string; body: (orderNumber: number | null) => string }
> = {
  de: {
    title: "Ihre Bestellung ist bereit",
    body: (n) => (n !== null ? `Bestellung #${n} kann abgeholt werden.` : "Sie können Ihre Bestellung abholen."),
  },
  fr: {
    title: "Votre commande est prête",
    body: (n) => (n !== null ? `La commande #${n} peut être retirée.` : "Vous pouvez retirer votre commande."),
  },
  it: {
    title: "Il tuo ordine è pronto",
    body: (n) => (n !== null ? `L'ordine #${n} può essere ritirato.` : "Puoi ritirare il tuo ordine."),
  },
  en: {
    title: "Your order is ready",
    body: (n) => (n !== null ? `Order #${n} is ready for pickup.` : "Your order is ready for pickup."),
  },
  ar: {
    title: "طلبك جاهز",
    body: (n) => (n !== null ? `الطلب رقم ${n} جاهز للاستلام.` : "طلبك جاهز للاستلام."),
  },
  tr: {
    title: "Siparişiniz hazır",
    body: (n) => (n !== null ? `#${n} numaralı sipariş teslim almaya hazır.` : "Siparişiniz teslim almaya hazır."),
  },
};

let configured = false;

function configureWebPush(): boolean {
  if (configured) return true;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return false;

  setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

type SubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  lang: string;
};

export async function sendReadyPush(params: {
  orderId: string;
  restaurantId: string | number;
  orderNumber: number | null;
}): Promise<number> {
  if (!configureWebPush()) return 0;

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("order_push_subscriptions")
    .select("id, endpoint, p256dh, auth, lang")
    .eq("order_id", params.orderId);

  if (error) {
    console.error("Zelloo push lookup error:", error.message);
    return 0;
  }

  const rows = (data ?? []) as SubscriptionRow[];
  if (rows.length === 0) return 0;

  let sent = 0;

  await Promise.all(
    rows.map(async (row) => {
      const message = READY_MESSAGES[row.lang] ?? READY_MESSAGES.de;
      try {
        await sendNotification(
          { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
          JSON.stringify({
            title: message.title,
            body: message.body(params.orderNumber),
            tag: `order-${params.orderId}`,
            url: `/r/${params.restaurantId}`,
          }),
          { TTL: 3600, urgency: "high" }
        );
        sent += 1;
      } catch (pushError) {
        const statusCode =
          typeof pushError === "object" && pushError !== null && "statusCode" in pushError
            ? (pushError as { statusCode?: number }).statusCode
            : undefined;
        if (statusCode !== 404 && statusCode !== 410) {
          console.error("Zelloo push send error:", statusCode);
        }
      }
    })
  );

  // One-shot: the order is ready, so these subscriptions have served their purpose.
  await admin.from("order_push_subscriptions").delete().eq("order_id", params.orderId);

  return sent;
}
