import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { COMPANY } from "../../lib/company";

export const metadata: Metadata = {
  title: "Impressum | Zelloo",
  description: "Anbieterangaben und Kontakt von Zelloo.",
};

export default function ImpressumPage() {
  const rows: Array<[string, string]> = [
    ["Betreiber", COMPANY.legalName || "Zelloo"],
    ["Inhaber/in", COMPANY.ownerName],
    ["Adresse", [COMPANY.street, COMPANY.postalCodeCity].filter(Boolean).join(", ")],
    ["Kanton", COMPANY.canton],
    ["UID", COMPANY.uid],
    ["MWST-Nr.", COMPANY.vatNumber],
    ["E-Mail", COMPANY.email],
    ["Telefon", COMPANY.phone],
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[760px] mx-auto px-6 py-10">
        <Link href="/" aria-label="ZELLOO.CH">
          <Logo size="md" label="ZELLOO.CH" />
        </Link>

        <h1 className="text-3xl sm:text-4xl font-black mt-8 mb-8 text-balance">Impressum</h1>

        <dl className="divide-y border-y text-[15px]">
          {rows
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label} className="flex flex-col sm:flex-row sm:gap-6 py-3">
                <dt className="sm:w-40 shrink-0 font-semibold">{label}</dt>
                <dd className="text-foreground/90 break-words">{value}</dd>
              </div>
            ))}
        </dl>

        <section className="mt-10 text-[15px] leading-relaxed text-foreground/90 space-y-6">
          <div>
            <h2 className="text-lg font-bold mb-2">Zahlungen</h2>
            <p>
              Abonnementszahlungen werden über Stripe abgewickelt. Zelloo speichert keine Kartendaten.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold mb-2">Haftungsausschluss</h2>
            <p>
              Die Inhalte dieser Website werden sorgfältig geprüft. Für Richtigkeit, Vollständigkeit und
              Aktualität kann jedoch keine Gewähr übernommen werden.
            </p>
          </div>
        </section>

        <div className="mt-12 pt-8 border-t flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Startseite</Link>
          <Link href="/privacy" className="hover:text-foreground">Datenschutz</Link>
          <Link href="/terms" className="hover:text-foreground">AGB</Link>
        </div>
      </div>
    </div>
  );
}
