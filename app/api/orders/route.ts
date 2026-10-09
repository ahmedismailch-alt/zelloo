import { NextResponse } from "next/server";
import {
  getOrderableMenu,
  getOrderAvailability,
  getRestaurant,
  getSupabaseAdmin,
  isValidRestaurantId,
  normalizeTable,
} from "../../../lib/supabase-server";
import {
  formatItemNameWithOptions,
  optionsKey,
  resolveSelection,
} from "../../../lib/menu-options";
import { addressInZones, canOrder } from "../../../lib/restaurant-settings";

export const runtime = "nodejs";

const MAX_QUANTITY_PER_ITEM = 20;
const MAX_TOTAL_QUANTITY = 60;
const MAX_LINES = 30;

type IncomingItem = {
  menuItemId?: unknown;
  quantity?: unknown;
  note?: unknown;
  options?: unknown;
};

type RequestedLine = {
  menuItemId: string;
  optionIds: string[];
  quantity: number;
  note: string | null;
};

function cleanText(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed.length > 0 ? trimmed : null;
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return badRequest("Ungültige Anfrage.");

    const restaurantId = body.restaurantId;
    if (!isValidRestaurantId(restaurantId)) {
      return badRequest("Ungültiges Restaurant.");
    }

    const table = normalizeTable(body.table);
    const customerName = cleanText(body.customerName, 60);
    const customerPhone = cleanText(body.customerPhone, 30);
    const orderNote = cleanText(body.notes, 300);
    const orderType = body.orderType === "delivery" && !table ? "delivery" : "pickup";
    const customerAddress =
      orderType === "delivery" ? cleanText(body.customerAddress, 200) : null;

    if (!table && (!customerName || !customerPhone)) {
      return badRequest("Bitte Name und Telefonnummer angeben.");
    }

    if (orderType === "delivery" && !customerAddress) {
      return badRequest("Bitte Lieferadresse angeben.");
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return badRequest("Der Warenkorb ist leer.");
    }
    if (body.items.length > MAX_LINES) {
      return badRequest("Zu viele Positionen.");
    }

    const requested = new Map<string, RequestedLine>();
    const quantityPerItem = new Map<string, number>();

    for (const raw of body.items as IncomingItem[]) {
      const id = typeof raw?.menuItemId === "string" ? raw.menuItemId : null;
      const quantity = raw?.quantity;

      if (
        !id ||
        typeof quantity !== "number" ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return badRequest("Ungültige Menge.");
      }

      const optionIds = Array.isArray(raw?.options)
        ? (raw.options as unknown[])
            .filter((value): value is string => typeof value === "string")
            .slice(0, 30)
        : [];

      const nextQuantity = (quantityPerItem.get(id) || 0) + quantity;
      if (nextQuantity > MAX_QUANTITY_PER_ITEM) {
        return badRequest(
          `Maximal ${MAX_QUANTITY_PER_ITEM} Stück pro Artikel.`
        );
      }
      quantityPerItem.set(id, nextQuantity);

      const key = `${id}::${optionsKey(optionIds)}`;
      const existing = requested.get(key);
      const note = cleanText(raw?.note, 200);
      requested.set(key, {
        menuItemId: id,
        optionIds,
        quantity: (existing?.quantity ?? 0) + quantity,
        note: note ?? existing?.note ?? null,
      });
    }

    const totalQuantity = [...quantityPerItem.values()].reduce((a, b) => a + b, 0);
    if (totalQuantity > MAX_TOTAL_QUANTITY) {
      return badRequest(`Maximal ${MAX_TOTAL_QUANTITY} Artikel pro Bestellung.`);
    }

    const restaurant = await getRestaurant(restaurantId);
    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant nicht gefunden." },
        { status: 404 }
      );
    }

    const { availability, settings } = await getOrderAvailability(restaurant.id);
    if (!canOrder(availability)) {
      return NextResponse.json(
        {
          error: "Das Restaurant nimmt gerade keine Bestellungen an.",
          code: availability === "closed" ? "closed" : "paused",
        },
        { status: 403 }
      );
    }

    const menu = await getOrderableMenu(restaurantId);
    const menuById = new Map(menu.map((item) => [item.id, item]));

    const lines = [];
    for (const line of requested.values()) {
      const menuItem = menuById.get(line.menuItemId);
      if (!menuItem) {
        return badRequest("Ein Artikel ist nicht mehr verfügbar.");
      }
      const selection = resolveSelection(menuItem.options, line.optionIds);
      if (!selection.ok) {
        return badRequest("Bitte Optionen für jeden Artikel korrekt wählen.");
      }
      lines.push({
        item_name: formatItemNameWithOptions(menuItem.name, selection.choices),
        quantity: line.quantity,
        unit_price_cents: menuItem.priceCents + selection.extraCents,
        notes: line.note,
      });
    }

    const subtotalCents = lines.reduce(
      (sum, line) => sum + line.quantity * line.unit_price_cents,
      0
    );

    let deliveryFeeCents = 0;
    if (orderType === "delivery") {
      if (!addressInZones(customerAddress ?? "", settings.deliveryZones)) {
        return NextResponse.json(
          { error: "Wir liefern nicht an diese Adresse.", code: "zone" },
          { status: 400 }
        );
      }
      if (subtotalCents < settings.deliveryMinCents) {
        return NextResponse.json(
          { error: "Mindestbestellwert nicht erreicht.", code: "min_order" },
          { status: 400 }
        );
      }
      deliveryFeeCents = settings.deliveryFeeCents;
    }

    const totalCents = subtotalCents + deliveryFeeCents;

    const supabase = getSupabaseAdmin();

    const orderRow: Record<string, unknown> = {
      restaurant_id: restaurant.id,
      customer_name: customerName || (table ? `Tisch ${table}` : "Gast"),
      customer_phone: customerPhone,
      customer_address: customerAddress,
      order_type: orderType,
      status: "new",
      total_cents: totalCents,
      notes: orderNote,
      table_number: table,
    };

    let { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(
        deliveryFeeCents > 0
          ? { ...orderRow, delivery_fee_cents: deliveryFeeCents }
          : orderRow
      )
      .select("id")
      .single();

    // delivery_fee_cents may not exist until the SQL migration has been run.
    if (orderError && deliveryFeeCents > 0) {
      ({ data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderRow)
        .select("id")
        .single());
    }

    if (orderError || !order) throw orderError;

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(lines.map((line) => ({ ...line, order_id: order.id })));

    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id);
      throw itemsError;
    }

    return NextResponse.json({
      orderId: order.id,
      totalCents,
    });
  } catch (error) {
    console.error("Zelloo order create error:", error);
    return NextResponse.json(
      { error: "Bestellung konnte nicht gesendet werden." },
      { status: 500 }
    );
  }
}
