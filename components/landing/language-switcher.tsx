"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type Lang = "de" | "fr" | "it" | "en" | "ar" | "tr"

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
]

export const heroCopy: Record<
  Lang,
  {
    headline: [string, string, string]
    channels: string
    badge1: string
    badge2: string
    cta: string
    ctaNote: string
    check1: string
    check2: string
  }
> = {
  de: {
    headline: ["Nie mehr eine", "Bestellung verpassen.", "0% Kommission."],
    channels: "Google • Instagram • Facebook • WhatsApp • 100% automatisch",
    badge1: "0% Kommission pro Bestellung",
    badge2: "Bis zu 15 Std./Monat gespart",
    cta: "Jetzt registrieren - 15 Tage gratis",
    ctaNote: "Ohne Kreditkarte · Jederzeit kündbar",
    check1: "In 10 Minuten eingerichtet",
    check2: "WhatsApp-Bot nimmt Bestellungen 24/7",
  },
  fr: {
    headline: ["Plus jamais une", "commande manquée.", "0% de commission."],
    channels: "Google • Instagram • Facebook • WhatsApp • 100% automatique",
    badge1: "0% de commission par commande",
    badge2: "Jusqu'à 15h/mois économisées",
    cta: "S'inscrire maintenant - 15 jours gratuits",
    ctaNote: "Sans carte de crédit · Annulable à tout moment",
    check1: "Installé en 10 minutes",
    check2: "Bot WhatsApp 24/7 pour les commandes",
  },
  it: {
    headline: ["Non perdere più", "nessun ordine.", "0% di commissione."],
    channels: "Google • Instagram • Facebook • WhatsApp • 100% automatico",
    badge1: "0% di commissione per ordine",
    badge2: "Fino a 15 ore/mese risparmiate",
    cta: "Registrati ora - 15 giorni gratis",
    ctaNote: "Senza carta di credito · Annullabile in ogni momento",
    check1: "Pronto in 10 minuti",
    check2: "Bot WhatsApp riceve ordini 24/7",
  },
  en: {
    headline: ["Never miss", "an order again.", "0% commission."],
    channels: "Google • Instagram • Facebook • WhatsApp • 100% automated",
    badge1: "0% commission per order",
    badge2: "Up to 15 hrs/month saved",
    cta: "Sign up now - 15 days free",
    ctaNote: "No credit card · Cancel anytime",
    check1: "Set up in 10 minutes",
    check2: "WhatsApp bot takes orders 24/7",
  },
  ar: {
    headline: ["ما تفوّتي ولا طلب", "بعد اليوم.", "0% عمولة."],
    channels: "Google • Instagram • Facebook • WhatsApp • آلي 100%",
    badge1: "0% عمولة على كل طلب",
    badge2: "وفّري حتى 15 ساعة بالشهر",
    cta: "سجّلي الآن - 15 يوم مجاناً",
    ctaNote: "بدون بطاقة ائتمان · إلغاء بأي وقت",
    check1: "جاهز خلال 10 دقائق",
    check2: "روبوت واتساب يستقبل طلبات 24/7",
  },
  tr: {
    headline: ["Bir daha sipariş", "kaçırmayın.", "%0 komisyon."],
    channels: "Google • Instagram • Facebook • WhatsApp • %100 otomatik",
    badge1: "Sipariş başına %0 komisyon",
    badge2: "Ayda 15 saate kadar tasarruf",
    cta: "Şimdi kaydol - 15 gün ücretsiz",
    ctaNote: "Kredi kartı gerekmez · Her zaman iptal edilebilir",
    check1: "10 dakikada kurulur",
    check2: "WhatsApp botu 7/24 sipariş alır",
  },
}

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "de",
  setLang: () => {},
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("de")
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export function useLang() {
  return useContext(LangContext)
}

export function LanguageSwitcher() {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const current = LANGUAGES.find((l) => l.code === lang)!

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 text-xs font-semibold border px-3 py-1.5 rounded-full min-h-11 sm:min-h-0"
      >
        <span aria-hidden="true">{current.flag}</span>
        <span>{current.code.toUpperCase()}</span>
        <svg className="w-3 h-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M5.3 7.3a1 1 0 011.4 0L10 10.6l3.3-3.3a1 1 0 111.4 1.4l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4z" />
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            className="absolute right-0 mt-2 w-40 bg-white border border-black/10 rounded-xl shadow-lg overflow-hidden z-20"
          >
            {LANGUAGES.map((l) => (
              <li key={l.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={l.code === lang}
                  onClick={() => {
                    setLang(l.code)
                    setOpen(false)
                  }}
                  className={`w-full flex items-center gap-2 text-sm px-3.5 py-2.5 min-h-11 text-left hover:bg-gray-50 ${
                    l.code === lang ? "font-bold bg-gray-50" : ""
                  }`}
                >
                  <span aria-hidden="true">{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
