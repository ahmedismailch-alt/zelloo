import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "../../lib/supabase-server";
import { DemoChooser, isDemoLang } from "../../components/demo/demo-chooser";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Zelloo ausprobieren",
  robots: { index: false },
};

type DemoRow = { id: string | number; venue_type?: string | null };

function isCafe(row: DemoRow) {
  return (row.venue_type ?? "restaurant") !== "restaurant";
}

async function findDemoId(type: "restaurant" | "cafe") {
  const db = getSupabaseAdmin();

  let rows: DemoRow[] = [];
  const withType = await db
    .from("restaurants")
    .select("id, venue_type")
    .eq("is_demo", true)
    .order("id")
    .limit(20);

  if (!withType.error && withType.data) {
    rows = withType.data as DemoRow[];
  } else {
    // The venue_type column may not exist yet; fall back to any demo.
    const plain = await db.from("restaurants").select("id").eq("is_demo", true).order("id").limit(20);
    rows = (plain.data ?? []) as DemoRow[];
  }

  const match = rows.find((row) => isCafe(row) === (type === "cafe")) ?? rows[0];
  return match?.id ?? null;
}

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string | string[]; lang?: string | string[] }>;
}) {
  const params = await searchParams;
  const type = params.type;
  const lang = isDemoLang(params.lang) ? params.lang : "de";

  if (type !== "restaurant" && type !== "cafe") {
    return <DemoChooser lang={lang} />;
  }

  const demoId = await findDemoId(type);
  redirect(demoId !== null ? `/r/${demoId}` : "/");
}
