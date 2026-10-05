import { NextResponse } from "next/server";
import { isValidRestaurantId, requireAdmin } from "../../../../../../lib/supabase-server";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isValidRestaurantId(id)) {
    return NextResponse.json({ error: "Ungültiges Restaurant." }, { status: 400 });
  }

  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  try {
    const sevenDaysAgoIso = new Date(Date.now() - 7 * 86_400_000).toISOString();

    const [{ count: totalOrders }, { count: last7DaysOrders }, { data: lastOrder }, { count: menuItemsCount }] =
      await Promise.all([
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("restaurant_id", id),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("restaurant_id", id)
          .gte("created_at", sevenDaysAgoIso),
        supabase
          .from("orders")
          .select("created_at")
          .eq("restaurant_id", id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("menu_items")
          .select("id", { count: "exact", head: true })
          .eq("restaurant_id", id)
          .eq("is_confirmed", true),
      ]);

    return NextResponse.json({
      totalOrders: totalOrders || 0,
      last7DaysOrders: last7DaysOrders || 0,
      lastOrderAt: lastOrder?.created_at || null,
      menuItemsCount: menuItemsCount || 0,
    });
  } catch (error) {
    console.error("Zelloo admin restaurant stats error:", error);
    return NextResponse.json({ error: "Statistik konnte nicht geladen werden." }, { status: 500 });
  }
}
