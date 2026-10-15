import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReservationStatusScreen } from "../../../components/order/reservation-status-screen";
import { isValidRestaurantId } from "../../../lib/supabase-server";

export const metadata: Metadata = {
  title: "Reservierung | Zelloo",
  robots: { index: false, follow: false },
};

export default async function ReservationStatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ r?: string | string[] }>;
}) {
  const { id } = await params;
  const { r } = await searchParams;
  const restaurantId = Array.isArray(r) ? r[0] : r;

  if (!/^[0-9a-f-]{36}$/i.test(id) || !isValidRestaurantId(restaurantId)) notFound();

  return <ReservationStatusScreen reservationId={id} restaurantId={restaurantId} />;
}
