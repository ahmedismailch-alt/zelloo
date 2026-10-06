export default function Page() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center">
        <span className="font-black text-xl">ZELLOO.CH</span>
        <span className="text-xs border px-3 py-1 rounded-full">🇨🇭 Made in Switzerland</span>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 pt-16 grid md:grid-cols-2 gap-10">
        <div>
  <h1 className="text-[56px] font-black leading-[0.95]">Nie mehr eine<br/>Bestellung verpassen.<br/>0% Kommission.</h1>
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

  <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
  <div className="flex items-center gap-1.5">
  <svg className="w-4 h-4 text-[#c41e24] shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" /></svg>
  <span className="text-sm text-gray-600">In 10 Minuten eingerichtet</span>
  </div>
  <div className="flex items-center gap-1.5">
  <svg className="w-4 h-4 text-[#c41e24] shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" /></svg>
  <span className="text-sm text-gray-600">0% Kommission, immer</span>
  </div>
  </div>
        </div>

        <div className="flex justify-center pt-2">
          <div className="relative w-[300px]">
            <div className="absolute -inset-8 bg-[#c41e24]/10 rounded-[56px] blur-3xl -z-10" />

            {/* Floating live notification chip */}
            <div className="absolute -left-8 top-24 z-20 bg-white rounded-xl shadow-xl border border-black/5 px-3.5 py-2.5 flex items-center gap-2.5 animate-bounce [animation-duration:2.5s]">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c41e24] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c41e24]" />
              </span>
              <div className="leading-tight">
                <div className="text-[10px] font-bold">Neue Bestellung</div>
                <div className="text-[9px] text-gray-400">WhatsApp · jetzt</div>
              </div>
            </div>

            <div className="w-[300px] bg-black p-2.5 rounded-[44px] shadow-2xl ring-1 ring-white/10">
              <div className="bg-white rounded-[36px] overflow-hidden relative">
                <div className="flex items-center justify-between px-6 pt-3.5 pb-1 text-[11px] font-semibold text-black">
                  <span>9:41</span>
                  <div className="absolute left-1/2 -translate-x-1/2 top-2 w-24 h-6 bg-black rounded-full" />
                  <span>100%</span>
                </div>
                <div className="bg-[#c41e24] text-white px-4 py-3.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold">Bestellungen</span>
                    <div className="text-[11px] text-white/70 -mt-0.5">Heute · 24 Bestellungen</div>
                  </div>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                  </span>
                </div>
                <div className="p-3 bg-[#f7f7f7] space-y-2.5 min-h-[280px]">
                  <div className="bg-white p-4 rounded-xl shadow-md border border-[#c41e24]/20 ring-1 ring-[#c41e24]/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Neu</span>
                      <span className="text-[11px] text-gray-400">vor 12 Sek.</span>
                    </div>
                    <div className="font-black mt-1.5">Tisch 4 · #1024</div>
                    <div className="text-sm text-gray-600">2x Margherita, 1x Caesar</div>
                    <div className="text-sm font-bold mt-1">CHF 34.50</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-black/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">In Arbeit</span>
                      <span className="text-[11px] text-gray-400">vor 3 Min.</span>
                    </div>
                    <div className="font-black mt-1.5">Abholung · #1023</div>
                    <div className="text-sm text-gray-600">1x Prosciutto, 2x Cola</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-black/5 opacity-60">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Fertig</span>
                      <span className="text-[11px] text-gray-400">vor 6 Min.</span>
                    </div>
                    <div className="font-black mt-1.5">Tisch 2 · #1022</div>
                    <div className="text-sm text-gray-600">3x Pizza Calzone</div>
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
          <p className="text-gray-500 mt-2">Starten Sie noch heute automatisiert — ohne Kreditkarte, ohne Risiko.</p>
          <a href="/dashboard" className="inline-block bg-[#c41e24] text-white font-bold px-8 py-3 rounded-lg mt-6">
            Jetzt registrieren - 15 Tage gratis
          </a>
          <p className="text-sm text-gray-500 mt-3">Ohne Kreditkarte · Jederzeit kündbar</p>
        </div>
      </div>
    </div>
  )
}
