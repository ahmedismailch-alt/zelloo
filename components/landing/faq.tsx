"use client"

import { useLang, type Lang } from "./language-switcher"

type Entry = { q: string; a: string }

const faqCopy: Record<Lang, { title: string; items: Entry[] }> = {
  de: {
    title: "Häufige Fragen",
    items: [
      {
        q: "Was ist im Abo für CHF 39 pro Monat enthalten?",
        a: "Bestellseite mit QR-Code, Dashboard mit Bestell-Alarm, Menüverwaltung mit KI-Import, Statistiken und WhatsApp-Bestellungen. Es gibt keine Kommission pro Bestellung.",
      },
      {
        q: "Wie verbinde ich meine Nummer mit WhatsApp?",
        a: "Wir richten die WhatsApp-Anbindung gemeinsam mit Ihnen ein. Schreiben Sie uns an info@zelloo.ch oder rufen Sie an.",
      },
      {
        q: "Was passiert nach den 15 Gratis-Tagen?",
        a: "Sie entscheiden selbst, ob Sie das Abo starten. Das Abo ist jederzeit kündbar.",
      },
      {
        q: "Gibt es Gebühren pro Bestellung?",
        a: "Nein. Sie zahlen nur das monatliche Abo, ohne Kommission.",
      },
    ],
  },
  fr: {
    title: "Questions fréquentes",
    items: [
      {
        q: "Que comprend l'abonnement à CHF 39 par mois ?",
        a: "Page de commande avec QR code, tableau de bord avec alarme de commande, gestion du menu avec import IA, statistiques et commandes WhatsApp. Aucune commission par commande.",
      },
      {
        q: "Comment connecter mon numéro à WhatsApp ?",
        a: "Nous configurons la connexion WhatsApp avec vous. Écrivez-nous à info@zelloo.ch ou appelez-nous.",
      },
      {
        q: "Que se passe-t-il après les 15 jours gratuits ?",
        a: "Vous décidez vous-même de démarrer l'abonnement. Il est résiliable à tout moment.",
      },
      {
        q: "Y a-t-il des frais par commande ?",
        a: "Non. Vous ne payez que l'abonnement mensuel, sans commission.",
      },
    ],
  },
  it: {
    title: "Domande frequenti",
    items: [
      {
        q: "Cosa include l'abbonamento da CHF 39 al mese?",
        a: "Pagina d'ordine con QR code, dashboard con allarme ordini, gestione del menu con import IA, statistiche e ordini WhatsApp. Nessuna commissione per ordine.",
      },
      {
        q: "Come collego il mio numero a WhatsApp?",
        a: "Configuriamo insieme a voi il collegamento WhatsApp. Scrivete a info@zelloo.ch o chiamateci.",
      },
      {
        q: "Cosa succede dopo i 15 giorni gratuiti?",
        a: "Decidete voi se attivare l'abbonamento. È disdicibile in qualsiasi momento.",
      },
      {
        q: "Ci sono costi per ogni ordine?",
        a: "No. Pagate solo l'abbonamento mensile, senza commissioni.",
      },
    ],
  },
  en: {
    title: "Frequently asked questions",
    items: [
      {
        q: "What does the CHF 39 per month plan include?",
        a: "An ordering page with QR code, a dashboard with order alarm, menu management with AI import, statistics and WhatsApp orders. There is no commission per order.",
      },
      {
        q: "How do I connect my number to WhatsApp?",
        a: "We set up the WhatsApp connection together with you. Email info@zelloo.ch or give us a call.",
      },
      {
        q: "What happens after the 15 free days?",
        a: "You decide whether to start the subscription. You can cancel at any time.",
      },
      {
        q: "Are there fees per order?",
        a: "No. You only pay the monthly subscription, with no commission.",
      },
    ],
  },
  ar: {
    title: "أسئلة شائعة",
    items: [
      {
        q: "شو بيشمل الاشتراك بـ 39 فرنك بالشهر؟",
        a: "صفحة طلب مع رمز QR، لوحة تحكم مع تنبيه للطلبات، إدارة المنيو باستيراد بالذكاء الاصطناعي، إحصائيات وطلبات عبر واتساب. بدون أي عمولة على الطلبات.",
      },
      {
        q: "كيف بربط رقمي مع واتساب؟",
        a: "منجهّز ربط واتساب معك. راسلنا على info@zelloo.ch أو اتصل فينا.",
      },
      {
        q: "شو بيصير بعد الـ 15 يوم المجانية؟",
        a: "أنت بتقرر إذا بدك تبدأ الاشتراك. وبتقدر تلغيه بأي وقت.",
      },
      {
        q: "في رسوم على كل طلب؟",
        a: "لا. بتدفع الاشتراك الشهري بس، بدون عمولة.",
      },
    ],
  },
  tr: {
    title: "Sık sorulan sorular",
    items: [
      {
        q: "Aylık CHF 39 aboneliğe neler dahil?",
        a: "QR kodlu sipariş sayfası, sipariş alarmlı panel, yapay zeka ile menü aktarımı, istatistikler ve WhatsApp siparişleri. Sipariş başına komisyon yoktur.",
      },
      {
        q: "Numaramı WhatsApp'a nasıl bağlarım?",
        a: "WhatsApp bağlantısını sizinle birlikte kuruyoruz. info@zelloo.ch adresine yazın veya bizi arayın.",
      },
      {
        q: "15 ücretsiz günden sonra ne olur?",
        a: "Aboneliği başlatıp başlatmayacağınıza siz karar verirsiniz. İstediğiniz zaman iptal edebilirsiniz.",
      },
      {
        q: "Sipariş başına ücret var mı?",
        a: "Hayır. Yalnızca aylık abonelik ödersiniz, komisyon yoktur.",
      },
    ],
  },
}

export function Faq() {
  const { lang } = useLang()
  const copy = faqCopy[lang]

  return (
    <section className="py-16" dir={lang === "ar" ? "rtl" : "ltr"} aria-labelledby="faq-title">
      <div className="max-w-[800px] mx-auto px-6">
        <h2 id="faq-title" className="text-3xl md:text-4xl font-black text-center text-balance">
          {copy.title}
        </h2>
        <div className="mt-8 flex flex-col gap-3">
          {copy.items.map((item) => (
            <details key={item.q} className="group border rounded-2xl px-5">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 py-4 font-bold">
                <span className="text-pretty">{item.q}</span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-xl transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-4 text-sm leading-relaxed text-gray-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
