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
          <div className="w-[300px] bg-black p-2 rounded-[36px]">
            <div className="bg-white rounded-[28px] overflow-hidden">
              <div className="bg-[#c41e24] text-white p-4 font-bold">Bestellungen</div>
              <div className="p-3 bg-[#f7f7f7] space-y-3">
                <div className="bg-white p-4 rounded-xl"><div className="text-[10px] bg-green-100 inline px-2 rounded-full">Aktiv</div><div className="font-black">#1024</div><div className="text-sm">2x Margherita, 1x Caesar</div></div>
                <div className="bg-white p-4 rounded-xl"><div className="font-black">#1023</div><div className="text-sm">1x Prosciutto, 2x Cola</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center font-bold py-10">Alles automatisiert. Für mehr Zeit für Ihre Gäste.</div>
    </div>
  )
}
