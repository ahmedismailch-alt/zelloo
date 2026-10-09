import { Logo } from "@/components/logo";
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[760px] mx-auto px-6 py-10">
        <Link href="/" aria-label="ZELLOO.CH">
          <Logo size="md" label="ZELLOO.CH" />
        </Link>

        <h1 className="text-3xl sm:text-4xl font-black mt-8 mb-2 text-balance">Datenschutzerklärung</h1>
        <p className="text-muted-foreground mb-10">Stand: Oktober 2026</p>

        <div className="space-y-8 text-[15px] leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-lg font-bold mb-2">1. Verantwortliche Stelle</h2>
            <p>
              Verantwortlich für die Datenbearbeitung auf zelloo.ch ist der Betreiber von Zelloo (nachfolgend
              &quot;Zelloo&quot;, &quot;wir&quot;). Bei Fragen zum Datenschutz können Sie uns über die
              Kontaktmöglichkeiten im Dashboard oder auf dieser Seite erreichen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">2. Welche Daten wir bearbeiten</h2>
            <p className="mb-2">Je nachdem, wie Sie Zelloo nutzen, bearbeiten wir folgende Daten:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <span className="font-semibold">Restaurant-Konten:</span> Name, E-Mail-Adresse, Telefonnummer
                (optional), Menüdaten, Abonnement- und Zahlungsstatus.
              </li>
              <li>
                <span className="font-semibold">Bestellungen:</span> Tischnummer oder Lieferadresse, bestellte
                Artikel, Zeitstempel, optionale Sprachnachrichten zur Texterkennung der Bestellung.
              </li>
              <li>
                <span className="font-semibold">WhatsApp-Bestellungen:</span> Bei Bestellungen über WhatsApp
                bearbeiten wir Ihre Telefonnummer, Ihre Nachrichten (Text oder Sprachnachricht), Ihren Namen und
                gegebenenfalls Ihre Lieferadresse, um die Bestellung dem Restaurant zu übermitteln.
              </li>
              <li>
                <span className="font-semibold">Technische Daten:</span> IP-Adresse, Browsertyp und Geräteinformationen
                zur Sicherstellung des Betriebs und der Sicherheit.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">3. Zweck der Bearbeitung</h2>
            <p>
              Wir verwenden diese Daten ausschliesslich, um den Bestellprozess zu ermöglichen, das Dashboard für
              Restaurants bereitzustellen, Abonnements über unseren Zahlungsdienstleister abzurechnen und den Support
              zu betreiben. Wir verkaufen keine Daten an Dritte.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">4. Datenweitergabe an Dritte</h2>
            <p className="mb-2">Zur Erbringung unseres Dienstes arbeiten wir mit folgenden Dienstleistern:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <span className="font-semibold">Supabase</span> – Datenbank- und Authentifizierungs-Infrastruktur.
              </li>
              <li>
                <span className="font-semibold">Stripe</span> – Zahlungsabwicklung für Abonnements.
              </li>
              <li>
                <span className="font-semibold">Vercel</span> – Hosting der Webanwendung.
              </li>
              <li>
                <span className="font-semibold">Twilio / WhatsApp (Meta)</span> – Empfang und Versand von
                WhatsApp-Nachrichten bei Bestellungen über WhatsApp.
              </li>
              <li>
                <span className="font-semibold">OpenAI</span> – Texterkennung bei Sprachbestellungen (Audio wird
                ausschliesslich zur Transkription verarbeitet, nicht dauerhaft bei uns gespeichert).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">5. Speicherdauer</h2>
            <p>
              Bestelldaten werden so lange gespeichert, wie dies für den Geschäftsbetrieb und gesetzliche
              Aufbewahrungspflichten erforderlich ist. Restaurant-Konten können jederzeit die Löschung ihrer Daten
              verlangen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">6. Ihre Rechte</h2>
            <p>
              Gemäss dem Schweizer Datenschutzgesetz (nDSG) haben Sie das Recht auf Auskunft, Berichtigung, Löschung
              und Herausgabe Ihrer Daten. Kontaktieren Sie uns dazu jederzeit über das Dashboard oder die
              Kontaktangaben auf dieser Seite.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">7. Datensicherheit</h2>
            <p>
              Wir setzen technische und organisatorische Massnahmen ein, um Ihre Daten vor unbefugtem Zugriff,
              Verlust oder Missbrauch zu schützen, einschliesslich verschlüsselter Verbindungen (HTTPS) und
              zugriffsbeschränkter Datenbanken.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">8. Änderungen dieser Erklärung</h2>
            <p>
              Wir können diese Datenschutzerklärung von Zeit zu Zeit anpassen, um sie an geänderte Rechtslagen oder
              Funktionen von Zelloo anzupassen. Die aktuelle Version ist immer auf dieser Seite verfügbar.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Startseite
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            AGB
          </Link>
          <Link href="/about" className="hover:text-foreground">
            Über uns
          </Link>
        </div>
      </div>
    </div>
  )
}
