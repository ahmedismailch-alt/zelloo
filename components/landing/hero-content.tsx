"use client"

import { heroCopy, useLang } from "./language-switcher"

export function HeroContent() {
  const { lang } = useLang()
  const t = heroCopy[lang]
  const isRtl = lang === "ar"

  return (
    <div className="max-w-[1200px] mx-auto px-6 pt-16 grid md:grid-cols-2 gap-10" dir={isRtl ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-[40px] sm:text-[56px] font-black leading-[0.95] text-balance">
          {t.headline[0]}
          <br />
          {t.headline[1]}
          <br />
          {t.headline[2]}
        </h1>
        <p className="text-gray-500 mt-4">{t.channels}</p>

        <div className="flex flex-wrap gap-2 mt-5">
          <span className="inline-flex items-center gap-1.5 text-base font-bold bg-green-50 text-green-700 px-4 py-2 rounded-2xl text-pretty">
            {t.badge1}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
            {t.badge2}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <a href="/dashboard" className="bg-[#c41e24] text-white font-bold px-8 py-3 rounded-lg min-h-11 flex items-center">
            {t.cta}
          </a>
          <a
            href="/demo"
            className="border border-black text-black font-bold px-8 py-3 rounded-lg min-h-11 flex items-center"
          >
            {t.demo}
          </a>
        </div>
        <p className="text-sm text-gray-500 mt-3">{t.ctaNote}</p>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-[#c41e24] shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" />
            </svg>
            <span className="text-sm text-gray-600">{t.check1}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-[#c41e24] shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" />
            </svg>
            <span className="text-sm text-gray-600">{t.check2}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-2" dir="ltr">
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
              <div className="text-[9px] text-gray-400">QR-Code · jetzt</div>
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
  )
}
