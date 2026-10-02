import { NextResponse } from "next/server";
import {
  getOrderableMenu,
  getRestaurant,
  getSupabaseAdmin,
  isValidRestaurantId,
  normalizeTable,
} from "../../../lib/supabase-server";

export const runtime = "nodejs";

const MAX_QUANTITY_PER_ITEM = 20;
const MAX_TOTAL_QUANTITY = 60;
const MAX_LINES = 30;

type IncomingItem = { menuItemId?: unknown; quantity?: unknown; note?: unknown };

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
    const orderNote = cleanText(body.notes, 300);

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return badRequest("Der Warenkorb ist leer.");
    }
    if (body.items.length > MAX_LINES) {
      return badRequest("Zu viele Positionen.");
    }

    const quantities = new Map<string, number>();
    const notes = new Map<string, string>();

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

      const nextQuantity = (quantities.get(id) || 0) + quantity;
      if (nextQuantity > MAX_QUANTITY_PER_ITEM) {
        return badRequest(
          `Maximal ${MAX_QUANTITY_PER_ITEM} Stück pro Artikel.`
        );
      }
      quantities.set(id, nextQuantity);

      const note = cleanText(raw?.note, 200);
      if (note) notes.set(id, note);
    }

    const totalQuantity = [...quantities.values()].reduce((a, b) => a + b, 0);
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

    const menu = await getOrderableMenu(restaurantId);
    const menuById = new Map(menu.map((item) => [item.id, item]));

    const lines = [];
    for (const [id, quantity] of quantities) {
      const menuItem = menuById.get(id);
      if (!menuItem) {
        return badRequest("Ein Artikel ist nicht mehr verfügbar.");
      }
      lines.push({
        item_name: menuItem.name,
        quantity,
        unit_price_cents: menuItem.priceCents,
        notes: notes.get(id) || null,
      });
    }

    const totalCents = lines.reduce(
      (sum, line) => sum + line.quantity * line.unit_price_cents,
      0
    );

    const supabase = getSupabaseAdmin();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        restaurant_id: restaurant.id,
        customer_name: customerName || (table ? `Tisch ${table}` : "Gast"),
        order_type: "pickup",
        status: "new",
        total_cents: totalCents,
        notes: orderNote,
        table_number: table,
      })
      .select("id")
      .single();

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
