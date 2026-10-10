"use client"

import { Logo } from "@/components/logo";
import { AnimatedJourney } from "@/components/landing/animated-journey"
import { Faq } from "./faq"
import { heroCopy, pageCopy, useLang } from "./language-switcher"

export function PageSections() {
  const { lang } = useLang()
  const p = pageCopy[lang]
  const h = heroCopy[lang]
  const isRtl = lang === "ar"

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      {/* How it works */}
      <div className="bg-[#f7f7f7] mt-16 py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-center text-balance">{p.howItWorksTitle}</h2>
          <p className="text-gray-500 text-center mt-2">{p.howItWorksSubtitle}</p>

          <div className="mt-10" dir="ltr">
            <AnimatedJourney steps={p.journeySteps} />
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
                {p.whatsappBadge}
              </span>
              <h2 className="text-3xl md:text-[40px] font-black text-white leading-[1.05] mt-4 text-balance">
                {p.whatsappTitle[0]}
                <br />
                {p.whatsappTitle[1]}
              </h2>
              <p className="text-gray-400 mt-4 leading-relaxed">{p.whatsappParagraph}</p>
              <div className="mt-6 space-y-3">
                {p.whatsappChecks.map((check) => (
                  <div key={check} className="flex items-center gap-2.5">
                    <svg
                      className="w-4 h-4 text-[#25D366] shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" />
                    </svg>
                    <span className="text-sm text-gray-300">{check}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center" dir="ltr">
              <div className="w-[260px] bg-[#e5ddd5] rounded-[28px] p-3 shadow-2xl ring-1 ring-white/10 space-y-2">
                <div className="flex items-start">
                  <div className="bg-white rounded-xl rounded-tl-sm px-3 py-2 max-w-[85%] shadow-sm">
                    <p className="text-[13px] text-gray-800">
                      Hallo! 👋 Willkommen bei Zelloo Pizzeria. Was möchten Sie bestellen?
                    </p>
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
                    <p className="text-[13px] text-gray-800">
                      Perfekt ✅ Ihre Bestellung: 2x Margherita, 1x Tiramisu — CHF 38.00. Wird jetzt zubereitet!
                    </p>
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
          <h2 className="text-3xl md:text-4xl font-black text-center text-balance">{p.featuresTitle}</h2>
          <p className="text-gray-500 text-center mt-2">{p.featuresSubtitle}</p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 mt-10">
            {p.features.map((feature) => (
              <div key={feature.title} className="border rounded-2xl p-5">
                <h3 className="font-bold">{feature.title}</h3>
                <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing teaser */}
      <div className="bg-black text-white py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-balance">{p.pricingTitle}</h2>
          <p className="text-gray-400 mt-2">{p.pricingSubtitle}</p>
          <div className="mt-8 inline-flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl px-10 py-8">
            <span className="text-5xl font-black" dir="ltr">
              CHF 39<span className="text-lg font-semibold text-gray-400">{p.priceMonth}</span>
            </span>
            <span className="text-sm text-gray-400 mt-2">{p.priceNote}</span>
          </div>
        </div>
      </div>

      <Faq />

      {/* Final CTA */}
      <div className="py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-balance">{p.finalCtaTitle}</h2>
          <p className="text-gray-500 mt-2">{p.finalCtaSubtitle}</p>
          <a
            href="/dashboard"
            className="inline-block bg-[#c41e24] text-white font-bold px-8 py-3 rounded-lg mt-6 min-h-11"
          >
            {h.cta}
          </a>
          <p className="text-sm text-gray-500 mt-3">{h.ctaNote}</p>
        </div>
      </div>

      <footer className="border-t border-black/5 py-8">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
            <Logo size="sm" label="ZELLOO.CH" className="text-black" />
            <nav className="flex flex-wrap items-center justify-center gap-5">
              <a href="/about" className="hover:text-black">
                {p.footerAbout}
              </a>
              <a href="/pricing" className="hover:text-black">
                {p.footerPricing}
              </a>
              <a href="/login" className="hover:text-black">
                {p.footerLogin}
              </a>
              <a href="/privacy" className="hover:text-black">
                {p.footerPrivacy}
              </a>
              <a href="/terms" className="hover:text-black">
                {p.footerTerms}
              </a>
              <a href="/impressum" className="hover:text-black">
                Impressum
              </a>
            </nav>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-gray-500 border-t border-black/5 pt-5">
            <a href="mailto:info@zelloo.ch" className="hover:text-black">
              info@zelloo.ch
            </a>
            <span className="hidden sm:inline text-gray-300">•</span>
            <a href="tel:+41445053220" className="hover:text-black" dir="ltr">
              +41 44 505 32 20
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
