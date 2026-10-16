import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "../../lib/supabase-server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Zelloo ausprobieren",
  robots: { index: false },
};

// Kept per warm server instance so only the first visit queries the database.
let cachedDemoId: string | number | null = null;

export default async function DemoPage() {
  if (cachedDemoId === null) {
    const { data } = await getSupabaseAdmin()
      .from("restaurants")
      .select("id")
      .eq("is_demo", true)
      .limit(1)
      .maybeSingle();
    cachedDemoId = data?.id ?? null;
  }

  redirect(cachedDemoId !== null ? `/r/${cachedDemoId}` : "/");
}
