import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-server";
import { sendEmail, welcomeEmail } from "../../../lib/email";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  const user = userData?.user;
  if (userError || !user?.email) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  // Claim the flag first so concurrent requests cannot send the email twice.
  // If the column does not exist yet, this errors and nothing is sent.
  const { data: claimed, error: claimError } = await supabase
    .from("restaurants")
    .update({ welcome_email_sent: true })
    .eq("owner_id", user.id)
    .eq("welcome_email_sent", false)
    .select("id");

  if (claimError || !claimed || claimed.length === 0) {
    return NextResponse.json({ sent: false });
  }

  const { subject, html, text } = welcomeEmail();
  const sent = await sendEmail({ to: user.email, subject, html, text });

  if (!sent) {
    await supabase
      .from("restaurants")
      .update({ welcome_email_sent: false })
      .eq("owner_id", user.id);
    return NextResponse.json({ error: "E-Mail konnte nicht gesendet werden." }, { status: 500 });
  }

  return NextResponse.json({ sent: true });
}
