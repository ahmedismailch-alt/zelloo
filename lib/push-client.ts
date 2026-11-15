const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

export type PushResult = "ok" | "denied" | "error";

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    VAPID_PUBLIC_KEY.length > 0 &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function isPushBlocked(): boolean {
  return typeof Notification !== "undefined" && Notification.permission === "denied";
}

function decodeKey(base64Url: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let index = 0; index < raw.length; index += 1) {
    bytes[index] = raw.charCodeAt(index);
  }
  return bytes;
}

export async function subscribeForOrder(params: {
  orderId: string;
  restaurantId: string;
  lang: string;
}): Promise<PushResult> {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return "denied";

    await navigator.serviceWorker.register("/sw.js");
    const registration = await navigator.serviceWorker.ready;

    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeKey(VAPID_PUBLIC_KEY),
      }));

    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: params.orderId,
        restaurantId: params.restaurantId,
        lang: params.lang,
        subscription: subscription.toJSON(),
      }),
    });

    return response.ok ? "ok" : "error";
  } catch {
    return "error";
  }
}
