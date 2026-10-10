const FROM_ADDRESS = "Zelloo <info@zelloo.ch>";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Zelloo email error: RESEND_API_KEY is not set.");
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [to],
      reply_to: "info@zelloo.ch",
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Zelloo email error:", response.status, detail);
    return false;
  }

  return true;
}

export function welcomeEmail() {
  const dashboardUrl = "https://zelloo.ch/dashboard";
  const subject = "Willkommen bei Zelloo";

  const text = [
    "Hallo und willkommen bei Zelloo!",
    "",
    "Ihr Konto ist bereit. So starten Sie:",
    "1. Menü hochladen",
    "2. QR-Code ausdrucken und auf die Tische stellen",
    "3. Die erste Bestellung empfangen",
    "",
    "Ihre 15 Tage gratis laufen. Bei Fragen antworten Sie einfach auf diese E-Mail.",
    "",
    `Zum Dashboard: ${dashboardUrl}`,
    "",
    "Ihr Zelloo-Team",
  ].join("\n");

  const html = `<!doctype html>
<html lang="de">
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;padding:32px 24px;">
            <tr>
              <td>
                <p style="margin:0 0 24px;font-size:22px;font-weight:800;letter-spacing:1px;">ZELLOO</p>
                <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;">Willkommen bei Zelloo!</h1>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Ihr Konto ist bereit. So starten Sie:</p>
                <ol style="margin:0 0 20px;padding-left:20px;font-size:16px;line-height:1.8;">
                  <li>Menü hochladen</li>
                  <li>QR-Code ausdrucken und auf die Tische stellen</li>
                  <li>Die erste Bestellung empfangen</li>
                </ol>
                <p style="margin:0 0 28px;font-size:16px;line-height:1.6;">Ihre 15 Tage gratis laufen. Bei Fragen antworten Sie einfach auf diese E-Mail.</p>
                <a href="${dashboardUrl}" style="display:inline-block;background:#ff6600;color:#000000;font-weight:700;font-size:16px;text-decoration:none;padding:14px 28px;border-radius:10px;">Zum Dashboard</a>
                <p style="margin:32px 0 0;font-size:14px;line-height:1.6;color:#71717a;">Ihr Zelloo-Team<br />info@zelloo.ch</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}
