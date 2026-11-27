import type { OrderLang } from "../../lib/order-i18n";
import type { OpeningHours } from "../../lib/restaurant-settings";

type InfoStrings = {
  title: string;
  hours: string;
  closed: string;
  today: string;
  route: string;
  call: string;
};

const INFO_STRINGS: Record<OrderLang, InfoStrings> = {
  de: {
    title: "Infos",
    hours: "Öffnungszeiten",
    closed: "Geschlossen",
    today: "Heute",
    route: "Route anzeigen",
    call: "Anrufen",
  },
  fr: {
    title: "Infos",
    hours: "Heures d'ouverture",
    closed: "Fermé",
    today: "Aujourd'hui",
    route: "Itinéraire",
    call: "Appeler",
  },
  it: {
    title: "Info",
    hours: "Orari di apertura",
    closed: "Chiuso",
    today: "Oggi",
    route: "Mostra percorso",
    call: "Chiama",
  },
  en: {
    title: "Info",
    hours: "Opening hours",
    closed: "Closed",
    today: "Today",
    route: "Get directions",
    call: "Call",
  },
  ar: {
    title: "معلومات",
    hours: "ساعات الدوام",
    closed: "مغلق",
    today: "اليوم",
    route: "الاتجاهات",
    call: "اتصال",
  },
  tr: {
    title: "Bilgi",
    hours: "Çalışma saatleri",
    closed: "Kapalı",
    today: "Bugün",
    route: "Yol tarifi",
    call: "Ara",
  },
};

const LOCALES: Record<OrderLang, string> = {
  de: "de-CH",
  fr: "fr-CH",
  it: "it-CH",
  en: "en-GB",
  ar: "ar",
  tr: "tr",
};

export type RestaurantInfoData = {
  address: string | null;
  city: string | null;
  openingHours: OpeningHours | null;
  todayIndex: number;
};

function weekdayName(lang: OrderLang, index: number) {
  // 1 January 2024 is a Monday, so index 0 = Monday.
  return new Intl.DateTimeFormat(LOCALES[lang], {
    weekday: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2024, 0, 1 + index)));
}

export function RestaurantInfo({
  lang,
  restaurantName,
  phone,
  info,
}: {
  lang: OrderLang;
  restaurantName: string;
  phone: string | null;
  info: RestaurantInfoData;
}) {
  const t = INFO_STRINGS[lang];
  const hours =
    info.openingHours && info.openingHours.length === 7 ? info.openingHours : null;
  const place = [info.address, info.city].filter(Boolean).join(", ");

  if (!hours && !place && !phone) return null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [restaurantName, place].filter(Boolean).join(", ")
  )}`;

  return (
    <section
      aria-labelledby="restaurant-info-title"
      className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4"
    >
      <h2 id="restaurant-info-title" className="text-lg font-black">
        {t.title}
      </h2>

      {place && (
        <p className="text-sm text-gray-700" dir="auto">
          {place}
        </p>
      )}

      {(place || phone) && (
        <div className="flex flex-wrap gap-2">
          {place && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center justify-center rounded-full bg-black px-5 text-sm font-bold text-white"
            >
              {t.route}
            </a>
          )}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 px-5 text-sm font-bold text-gray-900"
            >
              {t.call}
            </a>
          )}
        </div>
      )}

      {hours && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-black text-gray-900">{t.hours}</h3>
          <ul className="flex flex-col">
            {hours.map((day, index) => {
              const isToday = index === info.todayIndex;
              return (
                <li
                  key={index}
                  aria-current={isToday ? "date" : undefined}
                  className={`flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm ${
                    isToday ? "bg-orange-50 font-bold text-gray-900" : "text-gray-700"
                  }`}
                >
                  <span>
                    {weekdayName(lang, index)}
                    {isToday && (
                      <span className="ms-2 text-xs font-bold text-orange-600">
                        {t.today}
                      </span>
                    )}
                  </span>
                  <span dir="ltr" className="tabular-nums">
                    {day.closed ? t.closed : `${day.open} – ${day.close}`}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
