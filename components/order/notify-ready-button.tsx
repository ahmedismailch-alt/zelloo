"use client";

import { useState, useSyncExternalStore } from "react";
import type { OrderLang, OrderStrings } from "../../lib/order-i18n";
import {
  isPushBlocked,
  isPushSupported,
  subscribeForOrder,
} from "../../lib/push-client";

type Props = {
  orderId: string;
  restaurantId: string;
  lang: OrderLang;
  t: OrderStrings;
};

type State = "idle" | "loading" | "on" | "denied" | "error";

const subscribeNoop = () => () => {};
const canOfferPush = () => isPushSupported() && !isPushBlocked();

export function NotifyReadyButton({ orderId, restaurantId, lang, t }: Props) {
  const [state, setState] = useState<State>("idle");
  const pushAvailable = useSyncExternalStore(subscribeNoop, canOfferPush, () => false);

  async function enable() {
    setState("loading");
    const result = await subscribeForOrder({ orderId, restaurantId, lang });
    setState(result === "ok" ? "on" : result === "denied" ? "denied" : "error");
  }

  if (state === "idle" && !pushAvailable) return null;

  if (state === "on") {
    return <p className="mt-2 text-sm font-bold text-white">{t.notifyOn}</p>;
  }

  return (
    <div className="mt-2 flex flex-col gap-1">
      <button
        type="button"
        onClick={enable}
        disabled={state === "loading"}
        className="min-h-11 rounded-xl border border-white/40 px-4 text-sm font-bold text-white disabled:opacity-60"
      >
        {t.notifyButton}
      </button>
      {state === "denied" && (
        <p role="alert" className="text-xs text-white/80">
          {t.notifyDenied}
        </p>
      )}
      {state === "error" && (
        <p role="alert" className="text-xs text-white/80">
          {t.notifyError}
        </p>
      )}
    </div>
  );
}
