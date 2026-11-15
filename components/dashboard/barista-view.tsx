"use client";

type BaristaStatus =
  | "new"
  | "accepted"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type BaristaOrder = {
  id: string;
  order_number: number | null;
  customer_name: string;
  order_type: "pickup" | "delivery";
  status: BaristaStatus;
  notes: string | null;
  table_number: string | null;
  created_at: string;
  order_items: { id: string; item_name: string; quantity: number; notes: string | null }[];
};

const nextStep: Partial<Record<BaristaStatus, { status: BaristaStatus; label: string }>> = {
  new: { status: "accepted", label: "Annehmen" },
  accepted: { status: "ready", label: "Fertig" },
  preparing: { status: "ready", label: "Fertig" },
  ready: { status: "completed", label: "Abgeholt" },
};

type BaristaViewProps<T extends BaristaOrder> = {
  orders: T[];
  highlighted: Set<string>;
  savingId: string | null;
  prepMinutes: number;
  waitingMinutes: (createdAt: string) => number;
  onChangeStatus: (order: T, status: BaristaStatus, prepMinutes?: number) => void;
};

export function BaristaView<T extends BaristaOrder>({
  orders,
  highlighted,
  savingId,
  prepMinutes,
  waitingMinutes,
  onChangeStatus,
}: BaristaViewProps<T>) {
  const sorted = [...orders].sort((a, b) => {
    if ((a.status === "new") !== (b.status === "new")) {
      return a.status === "new" ? -1 : 1;
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  if (sorted.length === 0) {
    return (
      <div className="border border-dashed rounded-xl p-8 text-center">
        <p className="font-bold">Keine offenen Bestellungen</p>
        <p className="text-sm text-gray-500 mt-2">Neue Bestellungen erscheinen hier.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {sorted.map((order) => {
        const step = nextStep[order.status];
        const minutes = waitingMinutes(order.created_at);
        const isNew = order.status === "new";
        const where = order.table_number
          ? `Tisch ${order.table_number}`
          : order.order_type === "delivery"
            ? "Lieferung"
            : "Abholung";

        return (
          <li
            key={order.id}
            className={`border-2 rounded-2xl p-4 transition-colors ${
              highlighted.has(order.id)
                ? "bg-orange-50 border-orange-500"
                : order.status === "ready"
                  ? "bg-green-50 border-green-600"
                  : "bg-white border-black"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-4xl font-black leading-none tabular-nums">
                  {order.order_number !== null ? `#${order.order_number}` : `#${order.id.slice(0, 4)}`}
                </p>
                <p className="text-sm text-gray-600 mt-2 truncate">
                  {order.customer_name} · {where}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                  order.status === "ready"
                    ? "bg-green-600 text-white"
                    : minutes >= 10
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {order.status === "ready"
                  ? "Bereit"
                  : minutes < 1
                    ? "Gerade eben"
                    : `${minutes} Min.`}
              </span>
            </div>

            <ul className="mt-4 space-y-2 border-t pt-3">
              {order.order_items.map((item) => (
                <li key={item.id}>
                  <p className="text-lg font-bold leading-snug">
                    {item.quantity} × {item.item_name}
                  </p>
                  {item.notes && (
                    <p className="text-base text-orange-700 font-semibold leading-snug">
                      {item.notes}
                    </p>
                  )}
                </li>
              ))}
            </ul>

            {order.notes && (
              <p className="text-base bg-gray-100 rounded-lg p-3 mt-3 font-medium">
                {order.notes}
              </p>
            )}

            {step && (
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  disabled={savingId !== null}
                  onClick={() =>
                    onChangeStatus(order, step.status, isNew ? prepMinutes : undefined)
                  }
                  className={`flex-1 min-h-14 rounded-xl text-xl font-black disabled:opacity-50 ${
                    isNew ? "bg-orange-500 text-black" : "bg-black text-white"
                  }`}
                >
                  {step.label}
                </button>
                {isNew && (
                  <button
                    type="button"
                    disabled={savingId !== null}
                    onClick={() => {
                      if (window.confirm("Bestellung ablehnen?")) {
                        onChangeStatus(order, "cancelled");
                      }
                    }}
                    className="min-h-14 rounded-xl border border-red-200 text-red-700 font-semibold text-sm px-4 disabled:opacity-50"
                  >
                    Ablehnen
                  </button>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
