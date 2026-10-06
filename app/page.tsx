import { AnimatedJourney } from "@/components/landing/animated-journey"
import { HeroContent } from "@/components/landing/hero-content"
import { LangProvider } from "@/components/landing/language-switcher"
import { LanguageSwitcher } from "@/components/landing/language-switcher"

export default function Page() {
  return (
    <LangProvider>
      <div className="bg-white min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center gap-3">
          <span className="font-black text-xl">ZELLOO.CH</span>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex text-xs border px-3 py-1 rounded-full">🇨🇭 Made in Switzerland</span>
            <LanguageSwitcher />
          </div>
        </div>

        <HeroContent />

        {/* How it works */}
        <div className="bg-[#f7f7f7] mt-16 py-16">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-black text-center">So funktioniert&apos;s</h2>
            <p className="text-gray-500 text-center mt-2">Vom Scan bis zur Küche — in Echtzeit.</p>

            <div className="mt-10">
              <AnimatedJourney />
            </div>
          </div>
        </div>

        {/* WhatsApp bot */}
        <div className="py-16 overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="bg-[#0a0a0a] rounded-[32px] px-6 py-12 md:px-14 md:py-16 grid md:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#25D366]/15 text-[#25D366] px-3 py-1.5 rounded-full">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.6 6.3A8.9 8.9 0 0012 4a8.9 8.9 0 00-7.6 13.4L3 21l3.7-1.3A8.9 8.9 0 0012 20.9a8.9 8.9 0 005.9-15.5l-.3-.1zM12 19.2a7.2 7.2 0 01-3.7-1l-.3-.2-2.8.9.9-2.7-.2-.3a7.2 7.2 0 1113.9-3 7.3 7.3 0 01-7.8 6.3zm4-5.4c-.2-.1-1.3-.6-1.5-.7-.2-.1-.3-.1-.5.1-.1.2-.5.7-.7.8-.1.2-.3.2-.5.1-.6-.3-1.3-.7-1.9-1.3a7 7 0 01-1.3-1.6c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.1-.3 0-.5l-.6-1.5c-.2-.4-.3-.3-.5-.3h-.4c-.2 0-.4.1-.6.3-.2.3-.8.8-.8 1.9s.8 2.2 1 2.4c1.2 1.6 2.6 2.8 4.5 3.5.8.3 1.4.3 1.9.2.5-.1 1.3-.6 1.5-1.1.3-.5.3-1 .2-1.1-.1-.1-.2-.2-.4-.3z" />
                  </svg>
                  WhatsApp-Bestellung
                </span>
                <h2 className="text-3xl md:text-[40px] font-black text-white leading-[1.05] mt-4 text-balance">
                  Ihr Gast schreibt &quot;Hallo&quot;.<br />Die Bestellung kommt an.
                </h2>
                <p className="text-gray-400 mt-4 leading-relaxed">
                  Kein App-Download, keine Registrierung. Ihr Gast schreibt einfach eine WhatsApp-Nachricht — der
                  Zelloo-Bot führt ihn durchs Menü, nimmt die Bestellung auf und schickt sie direkt in Ihr Dashboard.
                  Rund um die Uhr, in 5 Sprachen.
                </p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-[#25D366] shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" /></svg>
                    <span className="text-sm text-gray-300">Keine App, keine Wartezeit — Bestellung direkt im Chat</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-[#25D366] shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" /></svg>
                    <span className="text-sm text-gray-300">Antwortet sofort, auch nachts und am Wochenende</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-[#25D366] shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" /></svg>
                    <span className="text-sm text-gray-300">Landet sofort im selben Dashboard wie alle anderen Bestellungen</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-[260px] bg-[#e5ddd5] rounded-[28px] p-3 shadow-2xl ring-1 ring-white/10 space-y-2">
                  <div className="flex items-start">
                    <div className="bg-white rounded-xl rounded-tl-sm px-3 py-2 max-w-[85%] shadow-sm">
                      <p className="text-[13px] text-gray-800">Hallo! 👋 Willkommen bei Zelloo Pizzeria. Was möchten Sie bestellen?</p>
                      <span className="text-[10px] text-gray-400 block text-right mt-0.5">9:41</span>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-[#dcf8c6] rounded-xl rounded-tr-sm px-3 py-2 max-w-[85%] shadow-sm">
                      <p className="text-[13px] text-gray-800">2x Margherita und 1x Tiramisu bitte</p>
                      <span className="text-[10px] text-gray-500 block text-right mt-0.5">9:41 ✓✓</span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-white rounded-xl rounded-tl-sm px-3 py-2 max-w-[85%] shadow-sm">
                      <p className="text-[13px] text-gray-800">Perfekt ✅ Ihre Bestellung: 2x Margherita, 1x Tiramisu — CHF 38.00. Wird jetzt zubereitet!</p>
                      <span className="text-[10px] text-gray-400 block text-right mt-0.5">9:42</span>
                    </div>
                  </div>
                </div>
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

        <footer className="border-t border-black/5 py-8">
          <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
            <span className="font-black text-black">ZELLOO.CH</span>
            <nav className="flex items-center gap-5">
              <a href="/about" className="hover:text-black">Über uns</a>
              <a href="/pricing" className="hover:text-black">Preise</a>
              <a href="/login" className="hover:text-black">Login</a>
            </nav>
          </div>
        </footer>
      </div>
    </LangProvider>
  )
}
