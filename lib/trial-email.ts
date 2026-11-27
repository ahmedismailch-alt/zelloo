import { escapeHtml } from "./email";

type TrialEmailInput = {
  restaurantName: string;
  kind: "ending" | "ended";
  daysLeft: number;
};

const PRICING_URL = "https://zelloo.ch/pricing";

export function trialReminderEmail({ restaurantName, kind, daysLeft }: TrialEmailInput) {
  const name = restaurantName.trim() || "Ihr Restaurant";

  const headline =
    kind === "ending"
      ? daysLeft <= 1
        ? "Ihre Testphase endet morgen"
        : `Ihre Testphase endet in ${daysLeft} Tagen`
      : "Ihre Testphase ist beendet";

  const intro =
    kind === "ending"
      ? `Ihre 15 Tage gratis bei Zelloo für ${name} laufen bald ab. Damit Ihre Gäste weiterhin bestellen können, wählen Sie jetzt Ihr Abo.`
      : `Die Testphase für ${name} ist abgelaufen. Mit einem Abo können Ihre Gäste sofort wieder bestellen. Ihr Menü und Ihre Einstellungen bleiben erhalten.`;

  const points = ["0% Kommission auf jede Bestellung", "CHF 39 pro Monat, monatlich kündbar", "Bezahlung per Karte oder TWINT"];

  const subject = `${headline} – Zelloo`;

  const text = [
    "Hallo,",
    "",
    intro,
    "",
    ...points.map((point) => `- ${point}`),
    "",
    `Jetzt abonnieren: ${PRICING_URL}`,
    "",
    "Bei Fragen antworten Sie einfach auf diese E-Mail.",
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
                <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;">${escapeHtml(headline)}</h1>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${escapeHtml(intro)}</p>
                <ul style="margin:0 0 28px;padding-left:20px;font-size:16px;line-height:1.8;">
                  ${points.map((point) => `<li>${escapeHtml(point)}</li>`).join("\n                  ")}
                </ul>
                <a href="${PRICING_URL}" style="display:inline-block;background:#ff6600;color:#000000;font-weight:700;font-size:16px;text-decoration:none;padding:14px 28px;border-radius:10px;">Jetzt abonnieren</a>
                <p style="margin:32px 0 0;font-size:14px;line-height:1.6;color:#71717a;">Bei Fragen antworten Sie einfach auf diese E-Mail.<br />Ihr Zelloo-Team · info@zelloo.ch</p>
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
