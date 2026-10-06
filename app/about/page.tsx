export const metadata = {
  title: "Über uns · Zelloo",
  description:
    "Zelloo wurde in der Schweiz gegründet, um kleinen Restaurants und Cafés zu helfen, Bestellungen automatisch anzunehmen – ohne Kommission pro Bestellung.",
}

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center">
        <a href="/" className="font-black text-xl">
          ZELLOO.CH
        </a>
        <a href="/dashboard" className="text-sm font-semibold border border-black/10 px-4 py-2 rounded-full hover:bg-gray-50">
          Zum Dashboard
        </a>
      </div>

      <main className="max-w-[720px] mx-auto px-6 py-16">
        <span className="text-xs font-semibold text-[#c41e24] bg-[#c41e24]/10 px-3 py-1 rounded-full">
          Über uns
        </span>

        <h1 className="text-[40px] md:text-[48px] font-black leading-[1.05] mt-5 text-balance">
          Warum es Zelloo gibt.
        </h1>

        <p className="text-gray-600 text-lg leading-relaxed mt-6">
          Zelloo ist kein Produkt eines grossen Konzerns. Es ist aus einer einfachen Beobachtung
          entstanden: Kleine Restaurants und Cafés in der Schweiz verlieren jeden Tag Bestellungen –
          weil das Telefon besetzt ist, weil niemand Zeit hat, Nachrichten auf Instagram oder
          WhatsApp zu beantworten, oder weil ein Gast einfach nicht warten will und woanders
          bestellt.
        </p>

        <p className="text-gray-600 text-lg leading-relaxed mt-5">
          Gleichzeitig verlangen grosse Lieferplattformen eine Kommission auf jede einzelne
          Bestellung – Geld, das direkt vom Gewinn eines Restaurants abgezogen wird, egal wie knapp
          die Margen schon sind.
        </p>

        <p className="text-gray-600 text-lg leading-relaxed mt-5">
          Zelloo wurde gebaut, um genau dieses Problem zu lösen: ein System, das Bestellungen über
          Google, Instagram, Facebook und WhatsApp automatisch entgegennimmt – ohne dass jemand im
          Restaurant ständig am Handy hängen muss, und ohne Kommission pro Bestellung. Nur ein
          fixer monatlicher Preis, egal wie viele Bestellungen eingehen.
        </p>

        <div className="mt-10 border-l-4 border-[#c41e24] pl-5">
          <p className="text-black text-xl font-bold leading-snug text-pretty">
            {"Unser Ziel ist einfach: jedes Restaurant soll online genauso gut verkaufen können wie an der Theke."}
          </p>
        </div>

        <p className="text-gray-600 text-lg leading-relaxed mt-10">
          Zelloo steht noch am Anfang. Wir bauen das Produkt gemeinsam mit den ersten Restaurants,
          die es nutzen – jede Rückmeldung fliesst direkt in die nächste Verbesserung. Wenn etwas
          nicht funktioniert, melden Sie es uns, und wir kümmern uns darum. Persönlich.
        </p>

        <div className="mt-12 grid sm:grid-cols-3 gap-4">
          <div className="border border-black/10 rounded-2xl p-5">
            <div className="text-2xl font-black">🇨🇭</div>
            <p className="text-sm font-semibold mt-2">Aus der Schweiz, für die Schweiz</p>
            <p className="text-sm text-gray-500 mt-1">
              Gebaut für CHF, Schweizerdeutsch, Französisch, Italienisch – und das nDSG.
            </p>
          </div>
          <div className="border border-black/10 rounded-2xl p-5">
            <div className="text-2xl font-black">0%</div>
            <p className="text-sm font-semibold mt-2">Keine Kommission</p>
            <p className="text-sm text-gray-500 mt-1">
              Ein fixer Monatspreis. Ihre Einnahmen bleiben bei Ihnen.
            </p>
          </div>
          <div className="border border-black/10 rounded-2xl p-5">
            <div className="text-2xl font-black">24/7</div>
            <p className="text-sm font-semibold mt-2">Immer erreichbar</p>
            <p className="text-sm text-gray-500 mt-1">
              Bestellungen werden automatisch angenommen, auch nachts.
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col sm:flex-row gap-3">
          <a
            href="/dashboard"
            className="bg-[#c41e24] text-white font-bold px-8 py-3 rounded-lg text-center"
          >
            Jetzt registrieren - 15 Tage gratis
          </a>
          <a
            href="/pricing"
            className="border border-black/10 font-semibold px-8 py-3 rounded-lg text-center hover:bg-gray-50"
          >
            Preise ansehen
          </a>
        </div>
      </main>
    </div>
  )
}
