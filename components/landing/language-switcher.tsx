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

export const pageCopy: Record<
  Lang,
  {
    howItWorksTitle: string
    howItWorksSubtitle: string
    journeySteps: [
      { title: string; description: string },
      { title: string; description: string },
      { title: string; description: string },
    ]
    whatsappBadge: string
    whatsappTitle: [string, string]
    whatsappParagraph: string
    whatsappChecks: [string, string, string]
    featuresTitle: string
    featuresSubtitle: string
    features: [
      { title: string; desc: string },
      { title: string; desc: string },
      { title: string; desc: string },
      { title: string; desc: string },
      { title: string; desc: string },
      { title: string; desc: string },
    ]
    pricingTitle: string
    pricingSubtitle: string
    priceMonth: string
    priceNote: string
    finalCtaTitle: string
    finalCtaSubtitle: string
    footerAbout: string
    footerPricing: string
    footerLogin: string
  }
> = {
  de: {
    howItWorksTitle: "So funktioniert's",
    howItWorksSubtitle: "Vom Scan bis zur Küche — in Echtzeit.",
    journeySteps: [
      { title: "QR-Code am Tisch scannen", description: "Der Gast öffnet die Kamera und scannt den Code — kein App-Download nötig." },
      { title: "Menü öffnen & bestellen", description: "Das Menü öffnet sich direkt im Browser. Der Gast wählt Gerichte und bestätigt." },
      { title: "Bestellung kommt im Dashboard an", description: "Ein lauter Ton weckt das Team — die Bestellung ist sofort sichtbar, bereit zur Zubereitung." },
    ],
    whatsappBadge: "WhatsApp-Bestellung",
    whatsappTitle: ["Ihr Gast schreibt \"Hallo\".", "Die Bestellung kommt an."],
    whatsappParagraph:
      "Kein App-Download, keine Registrierung. Ihr Gast schreibt einfach eine WhatsApp-Nachricht — der Zelloo-Bot führt ihn durchs Menü, nimmt die Bestellung auf und schickt sie direkt in Ihr Dashboard. Rund um die Uhr, in 5 Sprachen.",
    whatsappChecks: [
      "Keine App, keine Wartezeit — Bestellung direkt im Chat",
      "Antwortet sofort, auch nachts und am Wochenende",
      "Landet sofort im selben Dashboard wie alle anderen Bestellungen",
    ],
    featuresTitle: "Alles, was Ihr Restaurant braucht",
    featuresSubtitle: "Entwickelt für Schweizer Restaurants und Cafés.",
    features: [
      { title: "Sprachbestellung", desc: "Gäste bestellen einfach per Sprache — kein Tippen nötig." },
      { title: "QR-Code am Tisch", desc: "Jeder Tisch hat seinen eigenen Code für direkte Bestellungen." },
      { title: "5 Sprachen", desc: "DE, FR, IT, EN und AR — für jeden Gast verständlich." },
      { title: "Lauter Bestellton", desc: "Funktioniert auch bei stummgeschaltetem Handy — keine Bestellung geht verloren." },
      { title: "TWINT & Karte", desc: "Sichere Zahlungen direkt über Stripe — ganz ohne Bargeld." },
      { title: "Live-Statistiken", desc: "Umsatz, Bestellzeiten und Top-Gerichte auf einen Blick." },
    ],
    pricingTitle: "Einfacher Preis. Keine Überraschungen.",
    pricingSubtitle: "Ein fixer Monatspreis — 0% Kommission auf jede Bestellung.",
    priceMonth: "/Monat",
    priceNote: "Jederzeit kündbar · Ohne Vertragsbindung",
    finalCtaTitle: "Bereit, Zeit und Kosten zu sparen?",
    finalCtaSubtitle: "Starten Sie noch heute automatisiert — ohne Kreditkarte, ohne Risiko.",
    footerAbout: "Über uns",
    footerPricing: "Preise",
    footerLogin: "Login",
  },
  fr: {
    howItWorksTitle: "Comment ça marche",
    howItWorksSubtitle: "Du scan à la cuisine — en temps réel.",
    journeySteps: [
      { title: "Scanner le code QR sur la table", description: "Le client ouvre l'appareil photo et scanne le code — aucune application à télécharger." },
      { title: "Ouvrir le menu et commander", description: "Le menu s'ouvre directement dans le navigateur. Le client choisit ses plats et confirme." },
      { title: "La commande arrive sur le tableau de bord", description: "Un son fort alerte l'équipe — la commande est visible immédiatement, prête à être préparée." },
    ],
    whatsappBadge: "Commande WhatsApp",
    whatsappTitle: ["Votre client écrit \"Bonjour\".", "La commande arrive."],
    whatsappParagraph:
      "Aucune application, aucune inscription. Votre client envoie simplement un message WhatsApp — le bot Zelloo le guide dans le menu, enregistre la commande et l'envoie directement à votre tableau de bord. 24h/24, en 5 langues.",
    whatsappChecks: [
      "Pas d'app, pas d'attente — commande directement dans le chat",
      "Répond instantanément, même la nuit et le week-end",
      "Arrive immédiatement dans le même tableau de bord que toutes les autres commandes",
    ],
    featuresTitle: "Tout ce dont votre restaurant a besoin",
    featuresSubtitle: "Conçu pour les restaurants et cafés suisses.",
    features: [
      { title: "Commande vocale", desc: "Les clients commandent simplement à la voix — pas besoin de taper." },
      { title: "Code QR sur table", desc: "Chaque table a son propre code pour des commandes directes." },
      { title: "5 langues", desc: "DE, FR, IT, EN et AR — compréhensible par tous les clients." },
      { title: "Son de commande fort", desc: "Fonctionne même en mode silencieux — aucune commande n'est perdue." },
      { title: "TWINT & carte", desc: "Paiements sécurisés directement via Stripe — sans espèces." },
      { title: "Statistiques en direct", desc: "Chiffre d'affaires, horaires et plats les plus vendus en un coup d'œil." },
    ],
    pricingTitle: "Prix simple. Aucune surprise.",
    pricingSubtitle: "Un prix mensuel fixe — 0% de commission sur chaque commande.",
    priceMonth: "/mois",
    priceNote: "Annulable à tout moment · Sans engagement",
    finalCtaTitle: "Prêt à gagner du temps et économiser ?",
    finalCtaSubtitle: "Démarrez dès aujourd'hui automatiquement — sans carte de crédit, sans risque.",
    footerAbout: "À propos",
    footerPricing: "Tarifs",
    footerLogin: "Connexion",
  },
  it: {
    howItWorksTitle: "Come funziona",
    howItWorksSubtitle: "Dalla scansione alla cucina — in tempo reale.",
    journeySteps: [
      { title: "Scansiona il codice QR al tavolo", description: "Il cliente apre la fotocamera e scansiona il codice — nessuna app da scaricare." },
      { title: "Apri il menu e ordina", description: "Il menu si apre direttamente nel browser. Il cliente scegli i piatti e confirma." },
      { title: "L'ordine arriva nella dashboard", description: "Un suono forte avvisa il team — l'ordine è visibile subito, pronto per la preparazione." },
    ],
    whatsappBadge: "Ordine via WhatsApp",
    whatsappTitle: ["Il cliente scrive \"Ciao\".", "L'ordine arriva."],
    whatsappParagraph:
      "Nessuna app, nessuna registrazione. Il cliente scrive semplicemente un messaggio WhatsApp — il bot Zelloo lo guida nel menu, registra l'ordine e lo invia direttamente alla tua dashboard. 24 ore su 24, in 5 lingue.",
    whatsappChecks: [
      "Nessuna app, nessuna attesa — ordine diretto nella chat",
      "Risponde immediatamente, anche di notte e nei weekend",
      "Arriva subito nella stessa dashboard di tutti gli altri ordini",
    ],
    featuresTitle: "Tutto ciò di cui il tuo ristorante ha bisogno",
    featuresSubtitle: "Pensato per ristoranti e caffè svizzeri.",
    features: [
      { title: "Ordine vocale", desc: "I clienti ordinano semplicemente parlando — non serve digitare." },
      { title: "QR code al tavolo", desc: "Ogni tavolo ha il proprio codice per ordini diretti." },
      { title: "5 lingue", desc: "DE, FR, IT, EN e AR — comprensibile per ogni cliente." },
      { title: "Suono forte per ordini", desc: "Funziona anche con il telefono silenzioso — nessun ordine va perso." },
      { title: "TWINT e carta", desc: "Pagamenti sicuri direttamente via Stripe — senza contanti." },
      { title: "Statistiche live", desc: "Fatturato, orari e piatti più venduti a colpo d'occhio." },
    ],
    pricingTitle: "Prezzo semplice. Nessuna sorpresa.",
    pricingSubtitle: "Un prezzo mensile fisso — 0% di commissione su ogni ordine.",
    priceMonth: "/mese",
    priceNote: "Annullabile in ogni momento · Senza vincoli contrattuali",
    finalCtaTitle: "Pronto a risparmiare tempo e costi?",
    finalCtaSubtitle: "Inizia oggi in modo automatizzato — senza carta di credito, senza rischi.",
    footerAbout: "Chi siamo",
    footerPricing: "Prezzi",
    footerLogin: "Accedi",
  },
  en: {
    howItWorksTitle: "How it works",
    howItWorksSubtitle: "From scan to kitchen — in real time.",
    journeySteps: [
      { title: "Scan the QR code at the table", description: "The guest opens the camera and scans the code — no app download needed." },
      { title: "Open the menu & order", description: "The menu opens directly in the browser. The guest picks dishes and confirms." },
      { title: "Order arrives on the dashboard", description: "A loud tone alerts the team — the order is instantly visible, ready to prepare." },
    ],
    whatsappBadge: "WhatsApp ordering",
    whatsappTitle: ["Your guest types \"Hi\".", "The order comes in."],
    whatsappParagraph:
      "No app download, no sign-up. Your guest simply sends a WhatsApp message — the Zelloo bot guides them through the menu, takes the order, and sends it straight to your dashboard. Around the clock, in 5 languages.",
    whatsappChecks: [
      "No app, no waiting — order directly in chat",
      "Replies instantly, even at night and on weekends",
      "Lands immediately in the same dashboard as every other order",
    ],
    featuresTitle: "Everything your restaurant needs",
    featuresSubtitle: "Built for Swiss restaurants and cafés.",
    features: [
      { title: "Voice ordering", desc: "Guests simply order by voice — no typing needed." },
      { title: "QR code per table", desc: "Every table has its own code for direct orders." },
      { title: "5 languages", desc: "DE, FR, IT, EN and AR — understandable for every guest." },
      { title: "Loud order alert", desc: "Works even on silent mode — no order ever gets missed." },
      { title: "TWINT & card", desc: "Secure payments directly via Stripe — fully cashless." },
      { title: "Live statistics", desc: "Revenue, order times, and top dishes at a glance." },
    ],
    pricingTitle: "Simple pricing. No surprises.",
    pricingSubtitle: "One fixed monthly price — 0% commission on every order.",
    priceMonth: "/month",
    priceNote: "Cancel anytime · No contract",
    finalCtaTitle: "Ready to save time and costs?",
    finalCtaSubtitle: "Start automating today — no credit card, no risk.",
    footerAbout: "About us",
    footerPricing: "Pricing",
    footerLogin: "Login",
  },
  ar: {
    howItWorksTitle: "كيف يعمل",
    howItWorksSubtitle: "من المسح إلى المطبخ — بالوقت الحقيقي.",
    journeySteps: [
      { title: "مسح كود QR على الطاولة", description: "الزبون يفتح الكاميرا ويمسح الكود — بلا تحميل أي تطبيق." },
      { title: "فتح المنيو والطلب", description: "المنيو يفتح مباشرة بالمتصفح. الزبون يختار الأطباق ويؤكد." },
      { title: "الطلب يصل للوحة التحكم", description: "صوت عالي ينبّه الفريق — الطلب يظهر فوراً، جاهز للتحضير." },
    ],
    whatsappBadge: "طلب عبر واتساب",
    whatsappTitle: ["الزبون يكتب \"سلام\".", "الطلب يصل."],
    whatsappParagraph:
      "بلا تحميل تطبيق، بلا تسجيل. الزبون بس بيبعت رسالة واتساب — روبوت zelloo بيوجّهه بالمنيو، بياخد الطلب، وبيبعته مباشرة لصفحة التحكم. على مدار الساعة، بـ5 لغات.",
    whatsappChecks: [
      "بلا تطبيق، بلا انتظار — الطلب مباشرة بالمحادثة",
      "بيرد فوراً، حتى بالليل وبعطلة نهاية الأسبوع",
      "بيوصل فوراً لنفس لوحة التحكم مع كل الطلبات الأخرى",
    ],
    featuresTitle: "كل شي مطعمك محتاجه",
    featuresSubtitle: "مصمم خصيصاً للمطاعم والمقاهي السويسرية.",
    features: [
      { title: "الطلب بالصوت", desc: "الزبون بيطلب بصوته بس — بلا كتابة." },
      { title: "QR لكل طاولة", desc: "كل طاولة إلها كود خاص للطلب المباشر." },
      { title: "5 لغات", desc: "ألماني، فرنسي، إيطالي، إنجليزي، وعربي — مفهوم لكل زبون." },
      { title: "صوت طلب عالي", desc: "بيشتغل حتى بوضع الصامت — ما في ولا طلب بيضيع." },
      { title: "TWINT وبطاقة", desc: "دفع آمن مباشرة عبر Stripe — بلا كاش." },
      { title: "إحصائيات حية", desc: "الإيرادات، أوقات الطلب، وأكتر الأطباق طلباً بنظرة واحدة." },
    ],
    pricingTitle: "سعر بسيط. بلا مفاجآت.",
    pricingSubtitle: "سعر شهري ثابت — 0% عمولة على كل طلب.",
    priceMonth: "/شهرياً",
    priceNote: "إلغاء بأي وقت · بلا التزام بعقد",
    finalCtaTitle: "جاهزة توفّري وقت وتكاليف؟",
    finalCtaSubtitle: "ابدئي اليوم بشكل آلي — بلا بطاقة ائتمان، بلا مخاطرة.",
    footerAbout: "من نحن",
    footerPricing: "الأسعار",
    footerLogin: "تسجيل الدخول",
  },
  tr: {
    howItWorksTitle: "Nasıl çalışır",
    howItWorksSubtitle: "Taramadan mutfağa — gerçek zamanlı.",
    journeySteps: [
      { title: "Masadaki QR kodunu tarayın", description: "Müşteri kamerayı açar ve kodu tarar — uygulama indirmeye gerek yok." },
      { title: "Menüyü açın ve sipariş verin", description: "Menü doğrudan tarayıcıda açılır. Müşteri yemekleri seçer ve onaylar." },
      { title: "Sipariş panele ulaşır", description: "Yüksek bir ses ekibi uyarır — sipariş anında görünür, hazırlanmaya hazırdır." },
    ],
    whatsappBadge: "WhatsApp siparişi",
    whatsappTitle: ["Müşteriniz \"Merhaba\" yazar.", "Sipariş gelir."],
    whatsappParagraph:
      "Uygulama indirme yok, kayıt yok. Müşteriniz sadece bir WhatsApp mesajı gönderir — Zelloo botu onu menüde yönlendirir, siparişi alır ve doğrudan panelinize gönderir. Günün her saati, 5 dilde.",
    whatsappChecks: [
      "Uygulama yok, bekleme yok — sipariş doğrudan sohbette",
      "Anında yanıtlar, gece ve hafta sonları da dahil",
      "Diğer tüm siparişlerle aynı panele anında ulaşır",
    ],
    featuresTitle: "Restoranınızın ihtiyacı olan her şey",
    featuresSubtitle: "İsviçre restoranları ve kafeleri için geliştirildi.",
    features: [
      { title: "Sesli sipariş", desc: "Müşteriler sadece sesle sipariş verir — yazmaya gerek yok." },
      { title: "Masa başına QR kodu", desc: "Her masanın doğrudan sipariş için kendi kodu vardır." },
      { title: "5 dil", desc: "DE, FR, IT, EN ve AR — her müşteri için anlaşılır." },
      { title: "Yüksek sesli sipariş uyarısı", desc: "Sessiz modda da çalışır — hiçbir sipariş kaçmaz." },
      { title: "TWINT ve kart", desc: "Stripe üzerinden doğrudan güvenli ödemeler — nakitsiz." },
      { title: "Canlı istatistikler", desc: "Ciro, sipariş saatleri ve en çok satan yemekler tek bakışta." },
    ],
    pricingTitle: "Basit fiyat. Sürpriz yok.",
    pricingSubtitle: "Sabit aylık ücret — her siparişte %0 komisyon.",
    priceMonth: "/ay",
    priceNote: "Her zaman iptal edilebilir · Sözleşme yok",
    finalCtaTitle: "Zamandan ve maliyetten tasarruf etmeye hazır mısınız?",
    finalCtaSubtitle: "Bugün otomatikleştirmeye başlayın — kredi kartı yok, risk yok.",
    footerAbout: "Hakkımızda",
    footerPricing: "Fiyatlandırma",
    footerLogin: "Giriş",
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
