import { Logo } from "@/components/logo";
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[760px] mx-auto px-6 py-10">
        <Link href="/" aria-label="ZELLOO.CH">
          <Logo size="md" label="ZELLOO.CH" />
        </Link>

        <h1 className="text-3xl sm:text-4xl font-black mt-8 mb-2 text-balance">
          Allgemeine Geschäftsbedingungen
        </h1>
        <p className="text-muted-foreground mb-10">Stand: Oktober 2026</p>

        <div className="space-y-8 text-[15px] leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-lg font-bold mb-2">1. Geltungsbereich</h2>
            <p>
              Diese Allgemeinen Geschäftsbedingungen (AGB) regeln die Nutzung der Plattform Zelloo durch Restaurants,
              Cafés und andere Gastronomiebetriebe (nachfolgend &quot;Kunde&quot;) in der Schweiz. Mit der Registrierung
              akzeptiert der Kunde diese AGB.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">2. Leistungsbeschreibung</h2>
            <p>
              Zelloo stellt dem Kunden ein System zur automatisierten Annahme und Verwaltung von Bestellungen zur
              Verfügung, unter anderem über QR-Codes an Tischen, eine Online-Bestellseite und ein Dashboard zur
              Bestellverwaltung. Der Funktionsumfang kann sich im Rahmen der laufenden Weiterentwicklung ändern.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">3. Testphase</h2>
            <p>
              Neue Kunden erhalten eine kostenlose Testphase von 15 Tagen ohne Angabe einer Kreditkarte. Nach Ablauf
              der Testphase ist ein kostenpflichtiges Abonnement erforderlich, um den Dienst weiter zu nutzen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">4. Preise und Zahlung</h2>
            <p>
              Die aktuellen Preise sind auf der Seite{" "}
              <Link href="/pricing" className="underline font-medium">
                zelloo.ch/pricing
              </Link>{" "}
              einsehbar. Abonnements werden monatlich über unseren Zahlungsdienstleister Stripe abgerechnet. Zelloo
              erhebt keine Kommission auf einzelne Bestellungen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">5. Kündigung</h2>
            <p>
              Der Kunde kann sein Abonnement jederzeit über das Dashboard kündigen. Die Kündigung wird zum Ende der
              laufenden Abrechnungsperiode wirksam; eine anteilige Rückerstattung erfolgt nicht.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">6. Verantwortlichkeiten des Kunden</h2>
            <p>
              Der Kunde ist verantwortlich für die Richtigkeit der von ihm hinterlegten Menüdaten, Preise und
              Verfügbarkeiten. Zelloo berechnet keine Preise eigenständig, sondern übernimmt ausschliesslich die vom
              Kunden bestätigten Angaben.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">7. Verfügbarkeit und Haftung</h2>
            <p>
              Zelloo bemüht sich um einen stabilen und durchgehenden Betrieb der Plattform, kann jedoch keine
              hundertprozentige Verfügbarkeit garantieren. Eine Haftung für entgangene Umsätze durch technische
              Ausfälle ist, soweit gesetzlich zulässig, ausgeschlossen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">8. Datenschutz</h2>
            <p>
              Die Bearbeitung personenbezogener Daten richtet sich nach unserer{" "}
              <Link href="/privacy" className="underline font-medium">
                Datenschutzerklärung
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">9. Änderungen der AGB</h2>
            <p>
              Zelloo kann diese AGB mit angemessener Vorankündigung anpassen. Die weitere Nutzung der Plattform nach
              Inkrafttreten der Änderungen gilt als Zustimmung.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">10. Anwendbares Recht</h2>
            <p>
              Diese AGB unterstehen Schweizer Recht. Gerichtsstand ist, soweit gesetzlich zulässig, der Sitz von
              Zelloo.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Startseite
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Datenschutz
          </Link>
          <Link href="/about" className="hover:text-foreground">
            Über uns
          </Link>
        </div>
      </div>
    </div>
  )
}
