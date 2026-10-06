export default function Page() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center">
        <span className="font-black text-xl">ZELLOO.CH</span>
        <span className="text-xs border px-3 py-1 rounded-full">🇨🇭 Made in Switzerland</span>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 pt-16 grid md:grid-cols-2 gap-10">
        <div>
          <h1 className="text-[56px] font-black leading-[0.95]">Ihr Restaurant<br/>läuft automatisch.<br/>24/7.</h1>
          <p className="text-gray-500 mt-4">Google • Instagram • Facebook • WhatsApp • 100% automatisch</p>

          <div className="flex flex-wrap gap-2 mt-5">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
              0% Kommission pro Bestellung
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
              Bis zu 15 Std./Monat gespart
            </span>
          </div>

          <div className="flex gap-3 mt-6">
            <a href="/dashboard" className="bg-[#c41e24] text-white font-bold px-8 py-3 rounded-lg">Jetzt registrieren - 15 Tage gratis</a>
          </div>
          <p className="text-sm text-gray-500 mt-3">Ohne Kreditkarte · Jederzeit kündbar</p>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[11px] font-bold text-gray-500">Z</div>
              <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[11px] font-bold text-gray-500">D</div>
            </div>
            <p className="text-sm text-gray-600">Schweizer Restaurants vertrauen bereits auf Zelloo</p>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="relative w-[300px]">
            <div className="absolute -inset-6 bg-[#c41e24]/10 rounded-[48px] blur-2xl -z-10" />
            <div className="w-[300px] bg-black p-2.5 rounded-[40px] shadow-2xl">
              <div className="bg-white rounded-[32px] overflow-hidden">
                <div className="flex items-center justify-between px-5 pt-3 pb-1 text-[11px] font-semibold text-black">
                  <span>9:41</span>
                  <div className="w-20 h-5 bg-black rounded-full" />
                  <span>100%</span>
                </div>
                <div className="bg-[#c41e24] text-white px-4 py-3.5 flex items-center justify-between">
                  <span className="font-bold">Bestellungen</span>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                  </span>
                </div>
                <div className="p-3 bg-[#f7f7f7] space-y-2.5 min-h-[260px]">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-black/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Neu</span>
                      <span className="text-[11px] text-gray-400">vor 12 Sek.</span>
                    </div>
                    <div className="font-black mt-1.5">Tisch 4 · #1024</div>
                    <div className="text-sm text-gray-600">2x Margherita, 1x Caesar</div>
                    <div className="text-sm font-bold mt-1">CHF 34.50</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-black/5 opacity-70">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Fertig</span>
                      <span className="text-[11px] text-gray-400">vor 6 Min.</span>
                    </div>
                    <div className="font-black mt-1.5">Abholung · #1023</div>
                    <div className="text-sm text-gray-600">1x Prosciutto, 2x Cola</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-[#f7f7f7] mt-16 py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-center">So funktioniert&apos;s</h2>
          <p className="text-gray-500 text-center mt-2">In 3 Schritten startklar — ohne technisches Wissen.</p>

          <div className="grid md:grid-cols-3 gap-6 mt-10">
            <div className="bg-white rounded-2xl p-6">
              <div className="w-10 h-10 rounded-full bg-[#c41e24] text-white font-black flex items-center justify-center">1</div>
              <h3 className="font-bold text-lg mt-4">Menü einrichten</h3>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                Laden Sie Ihr Menü hoch — unsere KI erkennt Gerichte und Preise automatisch, in Minuten statt Stunden.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6">
              <div className="w-10 h-10 rounded-full bg-[#c41e24] text-white font-black flex items-center justify-center">2</div>
              <h3 className="font-bold text-lg mt-4">Zelloo übernimmt</h3>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                Gäste bestellen per QR-Code, Sprache oder WhatsApp. Zelloo nimmt die Bestellung entgegen — rund um die Uhr.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6">
              <div className="w-10 h-10 rounded-full bg-[#c41e24] text-white font-black flex items-center justify-center">3</div>
              <h3 className="font-bold text-lg mt-4">Bestellung kommt an</h3>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                Ein lauter Ton weckt Ihr Team auf — die Bestellung erscheint sofort im Dashboard, bereit zur Zubereitung.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-center">Alles, was Ihr Restaurant braucht</h2>
          <p className="text-gray-500 text-center mt-2">Entwickelt für Schweizer Restaurants und Cafés.</p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 mt-10">
            <div className="border rounded-2xl p-5">
              <h3 className="font-bold">Sprachbestellung</h3>
              <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">Gäste bestellen einfach per Sprache — kein Tippen nötig.</p>
            </div>
            <div className="border rounded-2xl p-5">
              <h3 className="font-bold">QR-Code am Tisch</h3>
              <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">Jeder Tisch hat seinen eigenen Code für direkte Bestellungen.</p>
            </div>
            <div className="border rounded-2xl p-5">
              <h3 className="font-bold">5 Sprachen</h3>
              <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">DE, FR, IT, EN und AR — für jeden Gast verständlich.</p>
            </div>
            <div className="border rounded-2xl p-5">
              <h3 className="font-bold">Lauter Bestellton</h3>
              <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">Funktioniert auch bei stummgeschaltetem Handy — keine Bestellung geht verloren.</p>
            </div>
            <div className="border rounded-2xl p-5">
              <h3 className="font-bold">TWINT &amp; Karte</h3>
              <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">Sichere Zahlungen direkt über Stripe — ganz ohne Bargeld.</p>
            </div>
            <div className="border rounded-2xl p-5">
              <h3 className="font-bold">Live-Statistiken</h3>
              <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">Umsatz, Bestellzeiten und Top-Gerichte auf einen Blick.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing teaser */}
      <div className="bg-black text-white py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black">Einfacher Preis. Keine Überraschungen.</h2>
          <p className="text-gray-400 mt-2">Ein fixer Monatspreis — 0% Kommission auf jede Bestellung.</p>
          <div className="mt-8 inline-flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl px-10 py-8">
            <span className="text-5xl font-black">CHF 39<span className="text-lg font-semibold text-gray-400">/Monat</span></span>
            <span className="text-sm text-gray-400 mt-2">Jederzeit kündbar · Ohne Vertragsbindung</span>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-balance">Bereit, Zeit und Kosten zu sparen?</h2>
          <p className="text-gray-500 mt-2">Schliessen Sie sich Schweizer Restaurants an, die bereits automatisiert arbeiten.</p>
          <a href="/dashboard" className="inline-block bg-[#c41e24] text-white font-bold px-8 py-3 rounded-lg mt-6">
            Jetzt registrieren - 15 Tage gratis
          </a>
          <p className="text-sm text-gray-500 mt-3">Ohne Kreditkarte · Jederzeit kündbar</p>
        </div>
      </div>
    </div>
  )
}
