import { NextResponse } from "next/server";
import { ADMIN_EMAIL, getSupabaseAdmin } from "../../../../lib/supabase-server";
import { computeAccess } from "../../../../lib/subscription";
import { sendEmail } from "../../../../lib/email";
import { trialReminderEmail } from "../../../../lib/trial-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REMINDER_DAYS_BEFORE_END = 3;
const DAY_MS = 24 * 60 * 60 * 1000;
// Restaurants whose trial ended long ago are considered inactive and are not mailed.
const MAX_DAYS_SINCE_END = 7;

type Stage = 0 | 1 | 2;

type RestaurantRow = {
  id: number | string;
  name: string | null;
  email: string | null;
  owner_id: string | null;
  subscription_status: string | null;
  trial_ends_at: string | null;
  is_demo: boolean | null;
  trial_reminder_stage: number | null;
};

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not set." }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const now = new Date();

  const { data, error } = await supabase
    .from("restaurants")
    .select(
      "id, name, email, owner_id, subscription_status, trial_ends_at, is_demo, trial_reminder_stage"
    )
    .not("trial_ends_at", "is", null);

  if (error) {
    console.error("Trial reminders: query failed", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  for (const row of (data ?? []) as RestaurantRow[]) {
    const access = computeAccess(row, ADMIN_EMAIL, now);
    const currentStage = (row.trial_reminder_stage ?? 0) as Stage;

    let targetStage: Stage | null = null;
    let kind: "ending" | "ended" = "ending";

    if (access.kind === "trial" && (access.daysLeft ?? 99) <= REMINDER_DAYS_BEFORE_END) {
      targetStage = 1;
      kind = "ending";
    } else if (access.kind === "grace" || access.kind === "expired") {
      const endedAt = access.trialEndsAt ? new Date(access.trialEndsAt).getTime() : 0;
      if (now.getTime() - endedAt <= MAX_DAYS_SINCE_END * DAY_MS) {
        targetStage = 2;
        kind = "ended";
      }
    }

    if (targetStage === null || currentStage >= targetStage) continue;

    let recipient = row.email?.trim() || null;
    if (!recipient && row.owner_id) {
      const { data: owner } = await supabase.auth.admin.getUserById(row.owner_id);
      recipient = owner?.user?.email ?? null;
    }
    if (!recipient) continue;

    // Claim the stage first so overlapping runs cannot send the same email twice.
    const { data: claimed, error: claimError } = await supabase
      .from("restaurants")
      .update({ trial_reminder_stage: targetStage })
      .eq("id", row.id)
      .lt("trial_reminder_stage", targetStage)
      .select("id");

    if (claimError || !claimed || claimed.length === 0) continue;

    const { subject, html, text } = trialReminderEmail({
      restaurantName: row.name ?? "",
      kind,
      daysLeft: access.daysLeft ?? 0,
    });
    const ok = await sendEmail({ to: recipient, subject, html, text });

    if (ok) {
      sent += 1;
    } else {
      failed += 1;
      await supabase
        .from("restaurants")
        .update({ trial_reminder_stage: currentStage })
        .eq("id", row.id);
    }
  }

  return NextResponse.json({ checked: data?.length ?? 0, sent, failed });
}
