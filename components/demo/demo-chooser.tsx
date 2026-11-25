import Link from "next/link";

export type DemoLang = "de" | "fr" | "it" | "en" | "ar" | "tr";

export const DEMO_LANGS: { code: DemoLang; label: string }[] = [
  { code: "de", label: "DE" },
  { code: "fr", label: "FR" },
  { code: "it", label: "IT" },
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
  { code: "tr", label: "TR" },
];

type DemoCopy = {
  title: string;
  subtitle: string;
  restaurant: string;
  restaurantText: string;
  cafe: string;
  cafeText: string;
  back: string;
};

const COPY: Record<DemoLang, DemoCopy> = {
  de: {
    title: "Was möchten Sie ausprobieren?",
    subtitle: "Wählen Sie Ihre Betriebsart, wir zeigen Ihnen die passende Demo.",
    restaurant: "Restaurant",
    restaurantText: "Bestellung am Tisch, Abholung und Lieferung",
    cafe: "Café",
    cafeText: "Schnell bestellen, Bestellnummer und Abholung",
    back: "Zurück",
  },
  fr: {
    title: "Que souhaitez-vous essayer ?",
    subtitle: "Choisissez votre type d'établissement, nous vous montrons la démo adaptée.",
    restaurant: "Restaurant",
    restaurantText: "Commande à table, à emporter et livraison",
    cafe: "Café",
    cafeText: "Commande rapide, numéro de commande et retrait",
    back: "Retour",
  },
  it: {
    title: "Cosa vuoi provare?",
    subtitle: "Scegli il tuo tipo di locale, ti mostriamo la demo giusta.",
    restaurant: "Ristorante",
    restaurantText: "Ordine al tavolo, ritiro e consegna",
    cafe: "Caffè",
    cafeText: "Ordine rapido, numero d'ordine e ritiro",
    back: "Indietro",
  },
  en: {
    title: "What would you like to try?",
    subtitle: "Pick your type of venue and we'll show you the matching demo.",
    restaurant: "Restaurant",
    restaurantText: "Table ordering, pickup and delivery",
    cafe: "Café",
    cafeText: "Quick ordering, order number and pickup",
    back: "Back",
  },
  ar: {
    title: "شو بدك تجرّب؟",
    subtitle: "اختر نوع محلك وبنعرضلك الديمو المناسب.",
    restaurant: "مطعم",
    restaurantText: "طلب على الطاولة، استلام وتوصيل",
    cafe: "كافيه",
    cafeText: "طلب سريع، رقم طلب واستلام",
    back: "رجوع",
  },
  tr: {
    title: "Neyi denemek istersiniz?",
    subtitle: "İşletme türünüzü seçin, size uygun demoyu gösterelim.",
    restaurant: "Restoran",
    restaurantText: "Masada sipariş, gel-al ve teslimat",
    cafe: "Kafe",
    cafeText: "Hızlı sipariş, sipariş numarası ve gel-al",
    back: "Geri",
  },
};

export function isDemoLang(value: unknown): value is DemoLang {
  return typeof value === "string" && value in COPY;
}

export function DemoChooser({ lang }: { lang: DemoLang }) {
  const t = COPY[lang];
  const isRtl = lang === "ar";

  const options = [
    { type: "restaurant", name: t.restaurant, text: t.restaurantText },
    { type: "cafe", name: t.cafe, text: t.cafeText },
  ];

  return (
    <main
      dir={isRtl ? "rtl" : "ltr"}
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-8"
    >
      <nav aria-label="Language" className="flex flex-wrap items-center gap-2">
        {DEMO_LANGS.map((l) => (
          <a
            key={l.code}
            href={`/demo?lang=${l.code}`}
            aria-current={l.code === lang ? "true" : undefined}
            className={`flex min-h-11 min-w-11 items-center justify-center rounded-full border px-3 text-xs font-semibold ${
              l.code === lang ? "border-black bg-black text-white" : "border-black/15 text-gray-600"
            }`}
          >
            {l.label}
          </a>
        ))}
      </nav>

      <div className="flex flex-1 flex-col justify-center py-10">
        <h1 className="text-balance text-3xl font-black leading-tight">{t.title}</h1>
        <p className="mt-3 text-pretty leading-relaxed text-gray-500">{t.subtitle}</p>

        <div className="mt-8 flex flex-col gap-4">
          {options.map((option) => (
            <a
              key={option.type}
              href={`/demo?type=${option.type}&lang=${lang}`}
              className="group flex min-h-28 flex-col justify-center rounded-2xl border-2 border-black px-6 py-5 transition-colors hover:bg-black hover:text-white focus-visible:bg-black focus-visible:text-white"
            >
              <span className="text-2xl font-black">{option.name}</span>
              <span className="mt-1 text-sm text-gray-500 group-hover:text-white/70 group-focus-visible:text-white/70">
                {option.text}
              </span>
            </a>
          ))}
        </div>
      </div>

      <Link href="/" className="flex min-h-11 items-center text-sm font-semibold text-gray-500">
        {t.back}
      </Link>
    </main>
  );
}
