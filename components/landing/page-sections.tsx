"use client"

import { Logo } from "@/components/logo";
import { AnimatedJourney } from "@/components/landing/animated-journey"
import { Faq } from "./faq"
import { googleCopy, heroCopy, pageCopy, reservationCopy, useLang } from "./language-switcher"

export function PageSections() {
  const { lang } = useLang()
  const p = pageCopy[lang]
  const g = googleCopy[lang]
  const rv = reservationCopy[lang]
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

      {/* Table reservation */}
      <div className="py-16">
        <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-orange-50 text-orange-800 px-3 py-1.5 rounded-full">
              {rv.badge}
            </span>
            <h2 className="text-3xl md:text-4xl font-black mt-4 text-balance">{rv.title}</h2>
            <p className="text-gray-500 mt-3 leading-relaxed text-pretty">{rv.paragraph}</p>
            <ul className="mt-6 space-y-3">
              {rv.points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-[#c41e24] shrink-0 mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" />
                  </svg>
                  <span className="font-semibold leading-snug">{point}</span>
                </li>
              ))}
            </ul>
            <a
              href={`/demo?lang=${lang}`}
              className="inline-flex items-center border border-black text-black font-bold px-8 py-3 rounded-lg mt-6 min-h-11"
            >
              {rv.cta}
            </a>
            <p className="text-sm text-gray-500 mt-3">{rv.note}</p>
          </div>

          <div className="flex justify-center" dir="ltr">
            <div className="w-full max-w-[320px] rounded-3xl border bg-white shadow-xl overflow-hidden">
              <div className="bg-black text-white px-5 py-4 font-bold">{rv.cardTitle}</div>
              <div className="p-5 space-y-3">
                <span className="inline-block text-[11px] font-bold bg-green-100 text-green-800 px-2.5 py-1 rounded-full">
                  {rv.cardNew}
                </span>
                <p className="text-xl font-black">{rv.cardWhen}</p>
                <p className="text-sm font-bold text-gray-600">{rv.cardGuests}</p>
                <p className="text-sm">{rv.cardGuest}</p>
                <div className="flex gap-2 pt-1">
                  <span className="flex-1 min-h-11 rounded-xl bg-orange-500 text-black font-black flex items-center justify-center">
                    {rv.confirm}
                  </span>
                  <span className="flex-1 min-h-11 rounded-xl border border-gray-300 font-bold flex items-center justify-center">
                    {rv.decline}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Direct ordering without commission */}
      <div className="py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-center text-balance">{p.directTitle}</h2>
          <p className="text-gray-500 text-center mt-3 max-w-2xl mx-auto leading-relaxed text-pretty">
            {p.directParagraph}
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-10">
            {p.directPoints.map((point) => (
              <div key={point} className="flex items-start gap-3 border rounded-2xl p-5">
                <svg
                  className="w-5 h-5 text-[#c41e24] shrink-0 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" />
                </svg>
                <span className="font-semibold leading-snug">{point}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 text-center mt-5">{p.directNote}</p>
        </div>
      </div>

      {/* Found on Google */}
      <div className="py-16">
        <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div className="md:order-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-orange-50 text-orange-800 px-3 py-1.5 rounded-full">
              {g.badge}
            </span>
            <h2 className="text-3xl md:text-4xl font-black mt-4 text-balance">{g.title}</h2>
            <p className="text-gray-500 mt-3 leading-relaxed text-pretty">{g.paragraph}</p>
            <ul className="mt-6 space-y-3">
              {g.points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-[#c41e24] shrink-0 mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" />
                  </svg>
                  <span className="font-semibold leading-snug">{point}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-500 mt-5">{g.note}</p>
          </div>

          <div className="flex justify-center md:order-1" dir="ltr">
            <div className="w-full max-w-[320px] rounded-3xl border bg-white shadow-xl overflow-hidden">
              <div className="bg-gray-100 px-5 py-3 text-xs font-semibold text-gray-500">google.com/maps</div>
              <div className="p-5 space-y-3">
                <p className="text-xl font-black">{g.mockName}</p>
                <p className="text-sm text-gray-600">{g.mockMeta}</p>
                <div className="flex gap-2 pt-1">
                  <span className="flex-1 min-h-11 rounded-xl bg-[#c41e24] text-white font-black flex items-center justify-center">
                    {g.mockOrder}
                  </span>
                  <span className="flex-1 min-h-11 rounded-xl border border-gray-300 font-bold flex items-center justify-center">
                    {g.mockMenu}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share your ordering link */}
      <div className="py-16 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="bg-[#0a0a0a] rounded-[32px] px-6 py-12 md:px-14 md:py-16 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-orange-500/15 text-orange-400 px-3 py-1.5 rounded-full">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
                </svg>
                {p.shareBadge}
              </span>
              <h2 className="text-3xl md:text-[40px] font-black text-white leading-[1.05] mt-4 text-balance">
                {p.shareTitle[0]}
                <br />
                {p.shareTitle[1]}
              </h2>
              <p className="text-gray-400 mt-4 leading-relaxed text-pretty">{p.shareParagraph}</p>
              <div className="mt-6 space-y-3">
                {p.shareChecks.map((check) => (
                  <div key={check} className="flex items-center gap-2.5">
                    <svg
                      className="w-4 h-4 text-orange-400 shrink-0"
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
              <div className="w-full max-w-[300px] bg-white rounded-[28px] p-4 shadow-2xl ring-1 ring-white/10">
                <div className="rounded-xl bg-gray-100 px-3 py-3 text-[13px] font-semibold text-gray-800 truncate">
                  zelloo.ch/r/ihr-restaurant
                </div>
                <div className="mt-2 min-h-11 rounded-xl border border-gray-300 font-bold text-sm flex items-center justify-center">
                  {p.shareCopy}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {["WhatsApp", "Telegram", "Facebook", "SMS", "E-Mail"].map((name) => (
                    <div
                      key={name}
                      className="min-h-11 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 flex items-center justify-center"
                    >
                      {name}
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-gray-500 mt-3 leading-snug">{p.shareNote}</p>
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
