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
    demo: string
    ctaNote: string
    check1: string
    check2: string
  }
> = {
  de: {
    headline: ["Nie mehr eine", "Bestellung verpassen.", "Fixer Preis. 0% Kommission."],
    channels: "Bestell-Link für Google, Instagram und Facebook · QR-Code am Tisch",
    badge1: "Ein fixer Monatspreis. Keine Kommission pro Bestellung.",
    badge2: "Bis zu 15 Std./Monat gespart",
    cta: "Jetzt registrieren - 15 Tage gratis",
    demo: "Zelloo ausprobieren",
    ctaNote: "Ohne Kreditkarte · Jederzeit kündbar",
    check1: "In 10 Minuten eingerichtet",
    check2: "Bestellungen per Text oder Sprache, direkt per QR-Code",
  },
  fr: {
    headline: ["Plus jamais une", "commande manquée.", "Prix fixe. 0% de commission."],
    channels: "Lien de commande pour Google, Instagram et Facebook · QR code sur la table",
    badge1: "Un prix mensuel fixe. Aucune commission par commande.",
    badge2: "Jusqu'à 15h/mois économisées",
    cta: "S'inscrire maintenant - 15 jours gratuits",
    demo: "Essayer Zelloo",
    ctaNote: "Sans carte de crédit · Annulable à tout moment",
    check1: "Installé en 10 minutes",
    check2: "Commandes par texte ou voix, directement via QR code",
  },
  it: {
    headline: ["Non perdere più", "nessun ordine.", "Prezzo fisso. 0% di commissione."],
    channels: "Link d'ordine per Google, Instagram e Facebook · QR code al tavolo",
    badge1: "Un prezzo mensile fisso. Nessuna commissione per ordine.",
    badge2: "Fino a 15 ore/mese risparmiate",
    cta: "Registrati ora - 15 giorni gratis",
    demo: "Prova Zelloo",
    ctaNote: "Senza carta di credito · Annullabile in ogni momento",
    check1: "Pronto in 10 minuti",
    check2: "Ordini con testo o voce, direttamente tramite QR code",
  },
  en: {
    headline: ["Never miss", "an order again.", "Fixed price. 0% commission."],
    channels: "Order link for Google, Instagram and Facebook · QR code at the table",
    badge1: "One fixed monthly price. No commission per order.",
    badge2: "Up to 15 hrs/month saved",
    cta: "Sign up now - 15 days free",
    demo: "Try Zelloo",
    ctaNote: "No credit card · Cancel anytime",
    check1: "Set up in 10 minutes",
    check2: "Orders by text or voice, straight from a QR code",
  },
  ar: {
    headline: ["ما تفوّتي ولا طلب", "بعد اليوم.", "سعر ثابت. 0% عمولة."],
    channels: "رابط طلب لـ Google وInstagram وFacebook · كود QR على الطاولة",
    badge1: "سعر شهري ثابت. بدون عمولة على كل طلب.",
    badge2: "وفّري حتى 15 ساعة بالشهر",
    cta: "سجّلي الآن - 15 يوم مجاناً",
    demo: "جرّبي Zelloo",
    ctaNote: "بدون بطاقة ائتمان · إلغاء بأي وقت",
    check1: "جاهز خلال 10 دقائق",
    check2: "طلبات بالنص أو الصوت، مباشرة من رمز QR",
  },
  tr: {
    headline: ["Bir daha sipariş", "kaçırmayın.", "Sabit fiyat. %0 komisyon."],
    channels: "Google, Instagram ve Facebook için sipariş bağlantısı · masada QR kodu",
    badge1: "Sabit aylık ücret. Sipariş başına komisyon yok.",
    badge2: "Ayda 15 saate kadar tasarruf",
    cta: "Şimdi kaydol - 15 gün ücretsiz",
    demo: "Zelloo'yu dene",
    ctaNote: "Kredi kartı gerekmez · Her zaman iptal edilebilir",
    check1: "10 dakikada kurulur",
    check2: "Metin veya sesle sipariş, doğrudan QR kod ile",
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
    shareBadge: string
    shareTitle: [string, string]
    shareParagraph: string
    shareChecks: [string, string, string]
    shareCopy: string
    shareNote: string
    directTitle: string
    directParagraph: string
    directPoints: [string, string, string]
    directNote: string
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
  footerPrivacy: string
  footerTerms: string
  footerRestaurants: string
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
    shareBadge: "Ein Link für alle Kanäle",
    shareTitle: ["Ein Link.", "Überall teilen."],
    shareParagraph:
      "Teilen Sie Ihre Bestellseite per WhatsApp, Instagram, Facebook, Telegram, SMS oder E-Mail. Ihre Gäste sehen das Menü und bestellen direkt, ohne App und ohne Kommission.",
    shareChecks: [
      "Link kopieren und überall einfügen",
      "Menü sehen, bevor man bestellt",
      "Bestellung landet direkt in Ihrem Dashboard",
    ],
    shareCopy: "Link kopieren",
    shareNote: "Instagram und TikTok erlauben kein direktes Teilen. Fügen Sie den Link einfach in Ihre Bio oder Story ein.",
    directTitle: "Direkt bestellen, ohne Provision",
    directParagraph:
      "Ihre Stammgäste bestellen direkt bei Ihnen — zum Mitnehmen, mit Lieferung oder am Tisch. Sie sparen die Provision pro Bestellung. CHF 39 pro Monat, fix.",
    directPoints: [
      "QR-Code für Ihr Restaurant — an der Kasse, auf der Speisekarte oder in der Verpackung",
      "Bestellung per Text oder Sprache",
      "Keine Provision, nie",
    ],
    directNote: "Teilen Sie Ihren Link per WhatsApp, Instagram, Facebook und mehr.",
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
    pricingTitle: "Fixer Monatspreis. 0% Kommission.",
    pricingSubtitle: "Keine Kommission pro Bestellung, egal wie viele eingehen. Einfacher Preis, keine Überraschungen.",
    priceMonth: "/Monat",
    priceNote: "Jederzeit kündbar · Ohne Vertragsbindung",
    finalCtaTitle: "Bereit, Zeit und Kosten zu sparen?",
    finalCtaSubtitle: "Starten Sie noch heute automatisiert — ohne Kreditkarte, ohne Risiko.",
  footerAbout: "Über uns",
  footerPricing: "Preise",
  footerLogin: "Login",
  footerPrivacy: "Datenschutz",
    footerTerms: "AGB",
    footerRestaurants: "Restaurants",

  },
  fr: {
    howItWorksTitle: "Comment ça marche",
    howItWorksSubtitle: "Du scan à la cuisine — en temps réel.",
    journeySteps: [
      { title: "Scanner le code QR sur la table", description: "Le client ouvre l'appareil photo et scanne le code — aucune application à télécharger." },
      { title: "Ouvrir le menu et commander", description: "Le menu s'ouvre directement dans le navigateur. Le client choisit ses plats et confirme." },
      { title: "La commande arrive sur le tableau de bord", description: "Un son fort alerte l'équipe — la commande est visible immédiatement, prête à être préparée." },
    ],
    shareBadge: "Un lien pour tous les canaux",
    shareTitle: ["Un lien.", "À partager partout."],
    shareParagraph:
      "Partagez votre page de commande par WhatsApp, Instagram, Facebook, Telegram, SMS ou e-mail. Vos clients voient le menu et commandent directement, sans application et sans commission.",
    shareChecks: [
      "Copiez le lien et collez-le partout",
      "Voir le menu avant de commander",
      "La commande arrive directement dans votre tableau de bord",
    ],
    shareCopy: "Copier le lien",
    shareNote: "Instagram et TikTok n'autorisent pas le partage direct. Collez simplement le lien dans votre bio ou votre story.",
    directTitle: "Commandez en direct, sans commission",
    directParagraph:
      "Vos clients habituels commandent directement chez vous — à emporter, en livraison ou à table. Vous économisez la commission sur chaque commande. CHF 39 par mois, fixe.",
    directPoints: [
      "Un code QR pour votre restaurant — à la caisse, sur la carte ou dans l'emballage",
      "Commande par texte ou par la voix",
      "Aucune commission, jamais",
    ],
    directNote: "Partagez votre lien par WhatsApp, Instagram, Facebook et plus.",
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
    pricingTitle: "Prix mensuel fixe. 0% de commission.",
    pricingSubtitle: "Aucune commission par commande, quel que soit leur nombre. Prix simple, aucune surprise.",
    priceMonth: "/mois",
    priceNote: "Annulable à tout moment · Sans engagement",
    finalCtaTitle: "Prêt à gagner du temps et économiser ?",
    finalCtaSubtitle: "Démarrez dès aujourd'hui automatiquement — sans carte de crédit, sans risque.",
  footerAbout: "À propos",
  footerPricing: "Tarifs",
  footerLogin: "Connexion",
  footerPrivacy: "Confidentialité",
    footerTerms: "CGV",
    footerRestaurants: "Restaurants",

  },
  it: {
    howItWorksTitle: "Come funziona",
    howItWorksSubtitle: "Dalla scansione alla cucina — in tempo reale.",
    journeySteps: [
      { title: "Scansiona il codice QR al tavolo", description: "Il cliente apre la fotocamera e scansiona il codice — nessuna app da scaricare." },
      { title: "Apri il menu e ordina", description: "Il menu si apre direttamente nel browser. Il cliente scegli i piatti e confirma." },
      { title: "L'ordine arriva nella dashboard", description: "Un suono forte avvisa il team — l'ordine è visibile subito, pronto per la preparazione." },
    ],
    shareBadge: "Un link per tutti i canali",
    shareTitle: ["Un link.", "Condividilo ovunque."],
    shareParagraph:
      "Condividi la tua pagina d'ordine via WhatsApp, Instagram, Facebook, Telegram, SMS o e-mail. I tuoi clienti vedono il menu e ordinano direttamente, senza app e senza commissioni.",
    shareChecks: [
      "Copia il link e incollalo ovunque",
      "Vedere il menu prima di ordinare",
      "L'ordine arriva direttamente nella tua dashboard",
    ],
    shareCopy: "Copia link",
    shareNote: "Instagram e TikTok non permettono la condivisione diretta. Incolla semplicemente il link nella tua bio o nella tua storia.",
    directTitle: "Ordina direttamente, senza commissioni",
    directParagraph:
      "I tuoi clienti abituali ordinano direttamente da te — da asporto, a domicilio o al tavolo. Risparmi la commissione su ogni ordine. CHF 39 al mese, fissi.",
    directPoints: [
      "Un codice QR per il tuo ristorante — alla cassa, sul menu o nella confezione",
      "Ordine con testo o voce",
      "Nessuna commissione, mai",
    ],
    directNote: "Condividi il tuo link su WhatsApp, Instagram, Facebook e altro.",
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
    pricingTitle: "Prezzo mensile fisso. 0% di commissione.",
    pricingSubtitle: "Nessuna commissione per ordine, a prescindere da quanti ne arrivano. Prezzo semplice, nessuna sorpresa.",
    priceMonth: "/mese",
    priceNote: "Annullabile in ogni momento · Senza vincoli contrattuali",
    finalCtaTitle: "Pronto a risparmiare tempo e costi?",
    finalCtaSubtitle: "Inizia oggi in modo automatizzato — senza carta di credito, senza rischi.",
  footerAbout: "Chi siamo",
  footerPricing: "Prezzi",
  footerLogin: "Accedi",
  footerPrivacy: "Privacy",
    footerTerms: "Termini",
    footerRestaurants: "Ristoranti",

  },
  en: {
    howItWorksTitle: "How it works",
    howItWorksSubtitle: "From scan to kitchen — in real time.",
    journeySteps: [
      { title: "Scan the QR code at the table", description: "The guest opens the camera and scans the code — no app download needed." },
      { title: "Open the menu & order", description: "The menu opens directly in the browser. The guest picks dishes and confirms." },
      { title: "Order arrives on the dashboard", description: "A loud tone alerts the team — the order is instantly visible, ready to prepare." },
    ],
    shareBadge: "One link for every channel",
    shareTitle: ["One link.", "Share it anywhere."],
    shareParagraph:
      "Share your ordering page on WhatsApp, Instagram, Facebook, Telegram, SMS or email. Your guests see the menu and order directly, with no app and no commission.",
    shareChecks: [
      "Copy the link and paste it anywhere",
      "See the menu before ordering",
      "Orders land straight in your dashboard",
    ],
    shareCopy: "Copy link",
    shareNote: "Instagram and TikTok don't allow direct link sharing. Just paste the link into your bio or story.",
    directTitle: "Order direct, no commission",
    directParagraph:
      "Your regular guests order straight from you — takeaway, delivery or at the table. You save the commission on every order. CHF 39 per month, fixed.",
    directPoints: [
      "A QR code for your restaurant — at the till, on the menu or in the packaging",
      "Order by text or voice",
      "No commission, ever",
    ],
    directNote: "Share your link on WhatsApp, Instagram, Facebook and more.",
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
    pricingTitle: "Fixed monthly price. 0% commission.",
    pricingSubtitle: "No commission per order, no matter how many come in. Simple pricing, no surprises.",
    priceMonth: "/month",
    priceNote: "Cancel anytime · No contract",
    finalCtaTitle: "Ready to save time and costs?",
    finalCtaSubtitle: "Start automating today — no credit card, no risk.",
  footerAbout: "About us",
  footerPricing: "Pricing",
  footerLogin: "Login",
  footerPrivacy: "Privacy",
    footerTerms: "Terms",
    footerRestaurants: "Restaurants",

  },
  ar: {
    howItWorksTitle: "كيف يعمل",
    howItWorksSubtitle: "من المسح إلى المطبخ — بالوقت الحقيقي.",
    journeySteps: [
      { title: "مسح كود QR على الطاولة", description: "الزبون يفتح الكاميرا ويمسح الكود — بلا تحميل أي تطبيق." },
      { title: "فتح المنيو والطلب", description: "المنيو يفتح مباشرة بالمتصفح. الزبون يختار الأطباق ويؤكد." },
      { title: "الطلب يصل للوحة التحكم", description: "صوت عالي ينبّه الفريق — الطلب يظهر فوراً، جاهز للتحضير." },
    ],
    shareBadge: "رابط واحد لكل القنوات",
    shareTitle: ["رابط واحد.", "شاركه بأي مكان."],
    shareParagraph:
      "شارك صفحة الطلب عبر واتساب أو إنستغرام أو فيسبوك أو تيليغرام أو SMS أو البريد. زبائنك بيشوفوا القائمة وبيطلبوا مباشرة، بلا تطبيق وبلا عمولة.",
    shareChecks: [
      "انسخ الرابط والصقه بأي مكان",
      "الزبون بيشوف القائمة قبل ما يطلب",
      "الطلب بيوصل مباشرة للوحة التحكم",
    ],
    shareCopy: "نسخ الرابط",
    shareNote: "إنستغرام وتيك توك ما بيسمحوا بمشاركة الروابط مباشرة. بس الصق الرابط بالبايو أو الستوري.",
    directTitle: "اطلب مباشرة، بدون عمولة",
    directParagraph:
      "زبائنك المعتادين بيطلبوا مباشرة منك — استلام أو توصيل أو على الطاولة. بتوفّر العمولة على كل طلب. 39 فرنك بالشهر، ثابتة.",
    directPoints: [
      "رمز QR لمطعمك — عند الكاشير أو على القائمة أو على التغليف",
      "الطلب بالنص أو بالصوت",
      "بدون عمولة، أبداً",
    ],
    directNote: "شارك رابطك عبر واتساب وإنستغرام وفيسبوك وغيرها.",
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
    pricingTitle: "سعر شهري ثابت. 0% عمولة.",
    pricingSubtitle: "بدون عمولة على أي طلب، مهما كان عددها. سعر بسيط، بلا مفاجآت.",
    priceMonth: "/شهرياً",
    priceNote: "إلغاء بأي وقت · بلا التزام بعقد",
    finalCtaTitle: "جاهزة توفّري وقت وتكاليف؟",
    finalCtaSubtitle: "ابدئي اليوم بشكل آلي — بلا بطاقة ائتمان، بلا مخاطرة.",
  footerAbout: "من نحن",
  footerPricing: "الأسعار",
  footerLogin: "تسجيل الدخول",
  footerPrivacy: "الخصوصية",
    footerTerms: "الشروط",
    footerRestaurants: "المطاعم",

  },
  tr: {
    howItWorksTitle: "Nasıl çalışır",
    howItWorksSubtitle: "Taramadan mutfağa — gerçek zamanlı.",
    journeySteps: [
      { title: "Masadaki QR kodunu tarayın", description: "Müşteri kamerayı açar ve kodu tarar — uygulama indirmeye gerek yok." },
      { title: "Menüyü açın ve sipariş verin", description: "Menü doğrudan tarayıcıda açılır. Müşteri yemekleri seçer ve onaylar." },
      { title: "Sipariş panele ulaşır", description: "Yüksek bir ses ekibi uyarır — sipariş anında görünür, hazırlanmaya hazırdır." },
    ],
    shareBadge: "Tüm kanallar için tek bağlantı",
    shareTitle: ["Tek bağlantı.", "Her yerde paylaşın."],
    shareParagraph:
      "Sipariş sayfanızı WhatsApp, Instagram, Facebook, Telegram, SMS veya e-posta ile paylaşın. Misafirleriniz menüyü görür ve doğrudan sipariş verir, uygulama ve komisyon yok.",
    shareChecks: [
      "Bağlantıyı kopyalayıp her yere yapıştırın",
      "Sipariş vermeden önce menüyü görün",
      "Sipariş doğrudan panelinize düşer",
    ],
    shareCopy: "Bağlantıyı kopyala",
    shareNote: "Instagram ve TikTok doğrudan paylaşıma izin vermez. Bağlantıyı biyografinize veya hikayenize yapıştırmanız yeterli.",
    directTitle: "Doğrudan sipariş, komisyonsuz",
    directParagraph:
      "Müdavimleriniz size doğrudan sipariş verir — paket servis, teslimat veya masada. Her siparişte komisyon ödemezsiniz. Ayda sabit CHF 39.",
    directPoints: [
      "Restoranınız için bir QR kod — kasada, menüde veya ambalajda",
      "Metin veya sesle sipariş",
      "Komisyon yok, asla",
    ],
    directNote: "Bağlantınızı WhatsApp, Instagram, Facebook ve daha fazlasında paylaşın.",
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
    pricingTitle: "Sabit aylık ücret. %0 komisyon.",
    pricingSubtitle: "Kaç sipariş gelirse gelsin, sipariş başına komisyon yok. Basit fiyat, sürpriz yok.",
    priceMonth: "/ay",
    priceNote: "Her zaman iptal edilebilir · Sözleşme yok",
    finalCtaTitle: "Zamandan ve maliyetten tasarruf etmeye hazır mısınız?",
    finalCtaSubtitle: "Bugün otomatikleştirmeye başlayın — kredi kartı yok, risk yok.",
  footerAbout: "Hakkımızda",
  footerPricing: "Fiyatlandırma",
  footerLogin: "Giriş",
  footerPrivacy: "Gizlilik",
    footerTerms: "Koşullar",
    footerRestaurants: "Restoranlar",

  },
  }

export const reservationCopy: Record<
  Lang,
  {
    heroBadge: string
    badge: string
    title: string
    paragraph: string
    points: [string, string, string]
    cardTitle: string
    cardNew: string
    cardWhen: string
    cardGuests: string
    cardGuest: string
    confirm: string
    decline: string
    cta: string
    note: string
  }
> = {
  de: {
    heroBadge: "Neu: Tischreservierung",
    badge: "Neu · Tischreservierung",
    title: "Gäste reservieren online, Sie bestätigen mit einem Tipp",
    paragraph:
      "Ihre Gäste reservieren direkt auf Ihrer Bestellseite. Die Anfrage landet im selben Dashboard wie Ihre Bestellungen, mit Ton und Zähler.",
    points: [
      "Gast wählt Tag, Uhrzeit und Personenzahl, passend zu Ihren Öffnungszeiten",
      "Sie bestätigen oder lehnen mit einem Tipp ab, auch vom Handy",
      "Der Gast erhält eine E-Mail und einen Link zum Status seiner Reservierung",
    ],
    cardTitle: "Tisch reservieren",
    cardNew: "Neu",
    cardWhen: "Fr 19:00",
    cardGuests: "4 Personen",
    cardGuest: "Familie Meier",
    confirm: "Bestätigen",
    decline: "Ablehnen",
    cta: "Reservierung ausprobieren",
    note: "Im Demo wird nichts gespeichert und keine E-Mail gesendet.",
  },
  fr: {
    heroBadge: "Nouveau : réservation de table",
    badge: "Nouveau · Réservation de table",
    title: "Vos clients réservent en ligne, vous confirmez d'un geste",
    paragraph:
      "Vos clients réservent directement sur votre page de commande. La demande arrive dans le même tableau de bord que vos commandes, avec son et compteur.",
    points: [
      "Le client choisit le jour, l'heure et le nombre de personnes, selon vos horaires",
      "Vous confirmez ou refusez d'un geste, même depuis votre téléphone",
      "Le client reçoit un e-mail et un lien pour suivre sa réservation",
    ],
    cardTitle: "Réserver une table",
    cardNew: "Nouveau",
    cardWhen: "Ven 19:00",
    cardGuests: "4 personnes",
    cardGuest: "Famille Meier",
    confirm: "Confirmer",
    decline: "Refuser",
    cta: "Essayer la réservation",
    note: "Dans la démo, rien n'est enregistré et aucun e-mail n'est envoyé.",
  },
  it: {
    heroBadge: "Novità: prenotazione tavolo",
    badge: "Novità · Prenotazione tavolo",
    title: "I clienti prenotano online, tu confermi con un tocco",
    paragraph:
      "I tuoi clienti prenotano direttamente dalla pagina degli ordini. La richiesta arriva nella stessa dashboard degli ordini, con suono e contatore.",
    points: [
      "Il cliente sceglie giorno, orario e numero di persone, secondo i tuoi orari",
      "Confermi o rifiuti con un tocco, anche dal telefono",
      "Il cliente riceve un'e-mail e un link per seguire la prenotazione",
    ],
    cardTitle: "Prenota un tavolo",
    cardNew: "Nuova",
    cardWhen: "Ven 19:00",
    cardGuests: "4 persone",
    cardGuest: "Famiglia Meier",
    confirm: "Conferma",
    decline: "Rifiuta",
    cta: "Prova la prenotazione",
    note: "Nella demo non viene salvato nulla né inviata alcuna e-mail.",
  },
  en: {
    heroBadge: "New: table reservations",
    badge: "New · Table reservations",
    title: "Guests book online, you confirm with one tap",
    paragraph:
      "Your guests reserve right from your order page. The request lands in the same dashboard as your orders, with sound and a counter.",
    points: [
      "Guests pick the day, time and party size, based on your opening hours",
      "You confirm or decline with one tap, even from your phone",
      "The guest gets an email and a link to track their reservation",
    ],
    cardTitle: "Reserve a table",
    cardNew: "New",
    cardWhen: "Fri 19:00",
    cardGuests: "4 people",
    cardGuest: "Meier family",
    confirm: "Confirm",
    decline: "Decline",
    cta: "Try a reservation",
    note: "In the demo nothing is saved and no email is sent.",
  },
  ar: {
    heroBadge: "جديد: حجز الطاولات",
    badge: "جديد · حجز الطاولات",
    title: "الزبون بيحجز أونلاين وإنتِ بتأكدي بلمسة",
    paragraph:
      "زبائنك بيحجزوا مباشرة من صفحة الطلب عندك. الحجز بيوصل لنفس لوحة الطلبات، مع صوت وعدّاد.",
    points: [
      "الزبون بيختار اليوم والساعة وعدد الأشخاص حسب أوقات دوامك",
      "بتأكدي أو بترفضي بلمسة، حتى من الموبايل",
      "الزبون بيوصله إيميل ورابط لمتابعة حالة حجزه",
    ],
    cardTitle: "حجز طاولة",
    cardNew: "جديد",
    cardWhen: "الجمعة 19:00",
    cardGuests: "4 أشخاص",
    cardGuest: "عائلة ماير",
    confirm: "تأكيد",
    decline: "رفض",
    cta: "جرّب الحجز",
    note: "بالتجريبي ما بينحفظ شي وما بيتبعت إيميل.",
  },
  tr: {
    heroBadge: "Yeni: masa rezervasyonu",
    badge: "Yeni · Masa rezervasyonu",
    title: "Misafirler online rezervasyon yapar, siz tek dokunuşla onaylarsınız",
    paragraph:
      "Misafirleriniz doğrudan sipariş sayfanızdan rezervasyon yapar. Talep, siparişlerinizle aynı panele ses ve sayaçla düşer.",
    points: [
      "Misafir çalışma saatlerinize göre gün, saat ve kişi sayısını seçer",
      "Telefonunuzdan bile tek dokunuşla onaylar veya reddedersiniz",
      "Misafir e-posta ve rezervasyon durumu için bir bağlantı alır",
    ],
    cardTitle: "Masa ayırt",
    cardNew: "Yeni",
    cardWhen: "Cum 19:00",
    cardGuests: "4 kişi",
    cardGuest: "Meier ailesi",
    confirm: "Onayla",
    decline: "Reddet",
    cta: "Rezervasyonu dene",
    note: "Demoda hiçbir şey kaydedilmez ve e-posta gönderilmez.",
  },
}

export const googleCopy: Record<
  Lang,
  {
    badge: string
    title: string
    paragraph: string
    points: [string, string, string]
    mockName: string
    mockMeta: string
    mockOrder: string
    mockMenu: string
    note: string
  }
> = {
  de: {
    badge: "Neu · Auf Google gefunden werden",
    title: "Ihr Restaurant oder Café, schnell auf Google gefunden.",
    paragraph:
      "Gäste in Ihrer Nähe sehen Sie auf Google Maps und bestellen direkt bei Ihnen. Ohne Provision.",
    points: [
      "Bestell-Link für Google Maps, fertig zum Kopieren",
      "Eigene Seite im Zelloo-Verzeichnis Ihrer Stadt",
      "Marketing-Vorlagen mit Logo und QR-Code: Tischaufsteller, Poster, Instagram",
    ],
    mockName: "Café Sonnenhof",
    mockMeta: "Café · Zürich · Geöffnet bis 18:00",
    mockOrder: "Bestellen",
    mockMenu: "Speisekarte",
    note: "Sie tragen nur Ort und Adresse ein, den Rest erklärt Ihnen Zelloo Schritt für Schritt.",
  },
  fr: {
    badge: "Nouveau · Être trouvé sur Google",
    title: "Votre restaurant ou café, trouvé rapidement sur Google.",
    paragraph:
      "Les clients près de chez vous vous voient sur Google Maps et commandent directement chez vous. Sans commission.",
    points: [
      "Lien de commande pour Google Maps, prêt à copier",
      "Votre propre page dans l'annuaire Zelloo de votre ville",
      "Modèles marketing avec logo et code QR : chevalet de table, affiche, Instagram",
    ],
    mockName: "Café Sonnenhof",
    mockMeta: "Café · Zurich · Ouvert jusqu'à 18h00",
    mockOrder: "Commander",
    mockMenu: "Menu",
    note: "Vous saisissez seulement la ville et l'adresse, Zelloo vous guide pour le reste, étape par étape.",
  },
  it: {
    badge: "Novità · Farsi trovare su Google",
    title: "Il tuo ristorante o caffè, trovato subito su Google.",
    paragraph:
      "I clienti vicino a te ti vedono su Google Maps e ordinano direttamente da te. Senza commissioni.",
    points: [
      "Link per ordinare su Google Maps, pronto da copiare",
      "Una tua pagina nell'elenco Zelloo della tua città",
      "Modelli marketing con logo e codice QR: segnatavolo, poster, Instagram",
    ],
    mockName: "Café Sonnenhof",
    mockMeta: "Caffè · Zurigo · Aperto fino alle 18:00",
    mockOrder: "Ordina",
    mockMenu: "Menu",
    note: "Inserisci solo città e indirizzo, Zelloo ti guida passo dopo passo per il resto.",
  },
  en: {
    badge: "New · Get found on Google",
    title: "Your restaurant or café, quickly found on Google.",
    paragraph:
      "People nearby see you on Google Maps and order straight from you. No commission.",
    points: [
      "Order link for Google Maps, ready to copy",
      "Your own page in the Zelloo directory for your city",
      "Marketing templates with your logo and QR code: table stand, poster, Instagram",
    ],
    mockName: "Café Sonnenhof",
    mockMeta: "Café · Zurich · Open until 6:00 pm",
    mockOrder: "Order",
    mockMenu: "Menu",
    note: "You only enter your city and address, Zelloo walks you through the rest step by step.",
  },
  ar: {
    badge: "جديد · ظهور على غوغل",
    title: "مطعمك أو مقهاك، يظهر بسرعة على غوغل.",
    paragraph:
      "الناس القريبة منك يشوفوك على خرائط غوغل ويطلبوا مباشرة منك. بدون عمولة.",
    points: [
      "رابط طلب لخرائط غوغل، جاهز للنسخ",
      "صفحة خاصة فيك في دليل Zelloo لمدينتك",
      "قوالب تسويق بلوغو ورمز QR: ملصق للطاولة وبوستر وإنستغرام",
    ],
    mockName: "Café Sonnenhof",
    mockMeta: "مقهى · زيورخ · مفتوح حتى 18:00",
    mockOrder: "اطلب",
    mockMenu: "القائمة",
    note: "بتكتب فقط المدينة والعنوان، وZelloo بيشرح لك الباقي خطوة بخطوة.",
  },
  tr: {
    badge: "Yeni · Google'da bulunun",
    title: "Restoranınız veya kafeniz Google'da hızlıca bulunsun.",
    paragraph:
      "Yakınınızdaki kişiler sizi Google Haritalar'da görür ve doğrudan sizden sipariş verir. Komisyon yok.",
    points: [
      "Google Haritalar için sipariş bağlantısı, kopyalamaya hazır",
      "Şehrinizin Zelloo rehberinde kendi sayfanız",
      "Logo ve QR kodlu pazarlama şablonları: masa standı, poster, Instagram",
    ],
    mockName: "Café Sonnenhof",
    mockMeta: "Kafe · Zürih · 18:00'e kadar açık",
    mockOrder: "Sipariş ver",
    mockMenu: "Menü",
    note: "Sadece şehir ve adresi girersiniz, gerisini Zelloo adım adım anlatır.",
  },
}

export const mwstCopy: Record<
  Lang,
  {
    badge: string
    title: string
    paragraph: string
    points: [string, string, string, string]
    cardTitle: string
    cardInHouse: string
    cardTakeaway: string
    cardTotal: string
    cardExport: string
    note: string
  }
> = {
  de: {
    badge: "Neu · Schweizer MWST",
    title: "MWST und Buchhaltung, fertig für Ihren Treuhänder.",
    paragraph:
      "Zelloo trennt jede Bestellung automatisch nach Steuersatz: 8.1% im Lokal, 2.6% bei Take-away und Lieferung. Am Abend sehen Sie den Tagesabschluss, am Monatsende laden Sie alles als CSV herunter.",
    points: [
      "Tagesabschluss mit MWST pro Steuersatz",
      "Monatsexport als CSV (Excel) für die Buchhaltung",
      "Alkoholische Getränke korrekt mit 8.1%",
      "Im Abo enthalten, ohne Zusatzkosten",
    ],
    cardTitle: "Tagesabschluss",
    cardInHouse: "Im Lokal · 8.1%",
    cardTakeaway: "Take-away · 2.6%",
    cardTotal: "MWST total",
    cardExport: "CSV exportieren",
    note: "Richtwerte auf Basis der aktuellen Schweizer Sätze. Bitte mit Ihrer Treuhandstelle abstimmen.",
  },
  fr: {
    badge: "Nouveau · TVA suisse",
    title: "TVA et comptabilité, prêtes pour votre fiduciaire.",
    paragraph:
      "Zelloo sépare automatiquement chaque commande par taux : 8.1% sur place, 2.6% à emporter et en livraison. Le soir, vous voyez la clôture du jour ; en fin de mois, vous téléchargez tout en CSV.",
    points: [
      "Clôture du jour avec la TVA par taux",
      "Export mensuel en CSV (Excel) pour la comptabilité",
      "Boissons alcoolisées correctement à 8.1%",
      "Inclus dans l'abonnement, sans frais supplémentaires",
    ],
    cardTitle: "Clôture du jour",
    cardInHouse: "Sur place · 8.1%",
    cardTakeaway: "À emporter · 2.6%",
    cardTotal: "TVA totale",
    cardExport: "Exporter en CSV",
    note: "Valeurs indicatives basées sur les taux suisses actuels. À valider avec votre fiduciaire.",
  },
  it: {
    badge: "Novità · IVA svizzera",
    title: "IVA e contabilità, pronte per il tuo fiduciario.",
    paragraph:
      "Zelloo separa automaticamente ogni ordine per aliquota: 8.1% al tavolo, 2.6% per asporto e consegna. La sera vedi la chiusura giornaliera, a fine mese scarichi tutto in CSV.",
    points: [
      "Chiusura giornaliera con IVA per aliquota",
      "Esportazione mensile in CSV (Excel) per la contabilità",
      "Bevande alcoliche correttamente all'8.1%",
      "Incluso nell'abbonamento, senza costi aggiuntivi",
    ],
    cardTitle: "Chiusura giornaliera",
    cardInHouse: "Al tavolo · 8.1%",
    cardTakeaway: "Asporto · 2.6%",
    cardTotal: "IVA totale",
    cardExport: "Esporta in CSV",
    note: "Valori indicativi basati sulle aliquote svizzere attuali. Da verificare con il tuo fiduciario.",
  },
  en: {
    badge: "New · Swiss VAT",
    title: "VAT and bookkeeping, ready for your accountant.",
    paragraph:
      "Zelloo automatically splits every order by tax rate: 8.1% dine-in, 2.6% takeaway and delivery. In the evening you see the daily closing, at month end you download everything as CSV.",
    points: [
      "Daily closing with VAT per tax rate",
      "Monthly CSV (Excel) export for your bookkeeping",
      "Alcoholic drinks correctly at 8.1%",
      "Included in your plan, no extra cost",
    ],
    cardTitle: "Daily closing",
    cardInHouse: "Dine-in · 8.1%",
    cardTakeaway: "Takeaway · 2.6%",
    cardTotal: "VAT total",
    cardExport: "Export CSV",
    note: "Indicative values based on current Swiss rates. Please confirm with your accountant.",
  },
  ar: {
    badge: "جديد · ضريبة القيمة المضافة السويسرية",
    title: "الضريبة والمحاسبة، جاهزة للمحاسب تبعك.",
    paragraph:
      "Zelloo بيفصل كل طلب تلقائياً حسب نسبة الضريبة: 8.1% للأكل بالمطعم، و2.6% للاستلام والتوصيل. بالمساء بتشوف إغلاق اليوم، وبآخر الشهر بتنزّل كل شي بملف CSV.",
    points: [
      "إغلاق يومي مع الضريبة لكل نسبة",
      "تصدير شهري بملف CSV (Excel) للمحاسبة",
      "المشروبات الكحولية بنسبة 8.1% بشكل صحيح",
      "مشمول بالاشتراك، بدون تكلفة إضافية",
    ],
    cardTitle: "إغلاق اليوم",
    cardInHouse: "بالمطعم · 8.1%",
    cardTakeaway: "استلام · 2.6%",
    cardTotal: "إجمالي الضريبة",
    cardExport: "تصدير CSV",
    note: "أرقام تقريبية حسب النسب السويسرية الحالية. يرجى مراجعتها مع المحاسب.",
  },
  tr: {
    badge: "Yeni · İsviçre KDV'si",
    title: "KDV ve muhasebe, mali müşavirinize hazır.",
    paragraph:
      "Zelloo her siparişi otomatik olarak vergi oranına göre ayırır: salonda %8.1, paket ve teslimatta %2.6. Akşam gün sonu raporunu görür, ay sonunda her şeyi CSV olarak indirirsiniz.",
    points: [
      "Vergi oranına göre KDV'li gün sonu raporu",
      "Muhasebe için aylık CSV (Excel) dışa aktarma",
      "Alkollü içecekler doğru şekilde %8.1",
      "Aboneliğe dahil, ek maliyet yok",
    ],
    cardTitle: "Gün sonu",
    cardInHouse: "Salonda · %8.1",
    cardTakeaway: "Paket · %2.6",
    cardTotal: "Toplam KDV",
    cardExport: "CSV dışa aktar",
    note: "Güncel İsviçre oranlarına dayalı yaklaşık değerlerdir. Lütfen mali müşavirinizle doğrulayın.",
  },
}

export const conversionCopy: Record<
  Lang,
  {
    trustLine: string
    compareTitle: string
    compareExample: string
    platformName: string
    platformValue: string
    platformSub: string
    zellooValue: string
    zellooSub: string
    compareNote: string
    pricingPoints: [string, string, string]
    pricingDetails: string
  }
> = {
  de: {
    trustLine: "Für die Schweiz entwickelt · Preise in CHF und MWST · Gästeseite in 5 Sprachen",
    compareTitle: "Provision oder fixer Preis?",
    compareExample: "Beispiel: 100 Bestellungen à CHF 30 pro Monat",
    platformName: "Lieferplattform",
    platformValue: "bis CHF 900",
    platformSub: "bei bis zu 30% Provision",
    zellooValue: "CHF 39",
    zellooSub: "fixer Monatspreis, 0% Kommission",
    compareNote: "Illustrative Beispielrechnung. Die Provisionen der Plattformen variieren.",
    pricingPoints: ["15 Tage gratis", "Ohne Kreditkarte", "Jederzeit kündbar"],
    pricingDetails: "Alle Preisdetails ansehen",
  },
  fr: {
    trustLine: "Conçu pour la Suisse · Prix en CHF et TVA · Page client en 5 langues",
    compareTitle: "Commission ou prix fixe ?",
    compareExample: "Exemple : 100 commandes à CHF 30 par mois",
    platformName: "Plateforme de livraison",
    platformValue: "jusqu'à CHF 900",
    platformSub: "avec jusqu'à 30% de commission",
    zellooValue: "CHF 39",
    zellooSub: "prix mensuel fixe, 0% de commission",
    compareNote: "Calcul d'exemple à titre indicatif. Les commissions des plateformes varient.",
    pricingPoints: ["15 jours gratuits", "Sans carte de crédit", "Annulable à tout moment"],
    pricingDetails: "Voir tous les détails des prix",
  },
  it: {
    trustLine: "Pensato per la Svizzera · Prezzi in CHF e IVA · Pagina clienti in 5 lingue",
    compareTitle: "Commissione o prezzo fisso?",
    compareExample: "Esempio: 100 ordini da CHF 30 al mese",
    platformName: "Piattaforma di consegna",
    platformValue: "fino a CHF 900",
    platformSub: "con fino al 30% di commissione",
    zellooValue: "CHF 39",
    zellooSub: "prezzo mensile fisso, 0% di commissione",
    compareNote: "Calcolo di esempio a scopo illustrativo. Le commissioni delle piattaforme variano.",
    pricingPoints: ["15 giorni gratis", "Senza carta di credito", "Annullabile in ogni momento"],
    pricingDetails: "Vedi tutti i dettagli dei prezzi",
  },
  en: {
    trustLine: "Built for Switzerland · Prices in CHF and VAT · Guest page in 5 languages",
    compareTitle: "Commission or fixed price?",
    compareExample: "Example: 100 orders at CHF 30 per month",
    platformName: "Delivery platform",
    platformValue: "up to CHF 900",
    platformSub: "at up to 30% commission",
    zellooValue: "CHF 39",
    zellooSub: "fixed monthly price, 0% commission",
    compareNote: "Illustrative example only. Platform commissions vary.",
    pricingPoints: ["15 days free", "No credit card", "Cancel anytime"],
    pricingDetails: "See full pricing details",
  },
  ar: {
    trustLine: "مصمم لسويسرا · أسعار بالفرنك السويسري مع ضريبة MWST · صفحة الضيوف بـ 5 لغات",
    compareTitle: "عمولة أم سعر ثابت؟",
    compareExample: "مثال: 100 طلب بقيمة 30 فرنك للطلب شهرياً",
    platformName: "منصة التوصيل",
    platformValue: "حتى 900 فرنك",
    platformSub: "بعمولة تصل إلى 30%",
    zellooValue: "39 فرنك",
    zellooSub: "سعر شهري ثابت، بدون عمولة",
    compareNote: "مثال توضيحي فقط. عمولات المنصات تختلف.",
    pricingPoints: ["15 يوماً مجاناً", "بدون بطاقة ائتمان", "إلغاء في أي وقت"],
    pricingDetails: "عرض تفاصيل الأسعار كاملة",
  },
  tr: {
    trustLine: "İsviçre için geliştirildi · CHF fiyatlar ve KDV · 5 dilde misafir sayfası",
    compareTitle: "Komisyon mu, sabit fiyat mı?",
    compareExample: "Örnek: ayda CHF 30'luk 100 sipariş",
    platformName: "Teslimat platformu",
    platformValue: "CHF 900'e kadar",
    platformSub: "%30'a varan komisyonla",
    zellooValue: "CHF 39",
    zellooSub: "sabit aylık ücret, %0 komisyon",
    compareNote: "Yalnızca örnek hesaptır. Platform komisyonları değişir.",
    pricingPoints: ["15 gün ücretsiz", "Kredi kartı gerekmez", "Her zaman iptal edilebilir"],
    pricingDetails: "Tüm fiyat ayrıntılarını gör",
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
