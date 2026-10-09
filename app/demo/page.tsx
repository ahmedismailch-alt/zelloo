import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "../../lib/supabase-server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Zelloo ausprobieren",
  robots: { index: false },
};

export default async function DemoPage() {
  const { data } = await getSupabaseAdmin()
    .from("restaurants")
    .select("id")
    .eq("is_demo", true)
    .limit(1)
    .maybeSingle();

  redirect(data?.id ? `/r/${data.id}` : "/");
}
