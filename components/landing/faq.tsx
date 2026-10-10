"use client"

import { useLang, type Lang } from "./language-switcher"

type Entry = { q: string; a: string }

const faqCopy: Record<Lang, { title: string; items: Entry[] }> = {
  de: {
    title: "Häufige Fragen",
    items: [
      {
        q: "Was ist im Abo für CHF 39 pro Monat enthalten?",
        a: "Bestellseite mit QR-Code, Dashboard mit Bestell-Alarm, Menüverwaltung mit KI-Import, und Statistiken. Es gibt keine Kommission pro Bestellung.",
      },
      {
        q: "Wie bestellen Gäste über Google, Instagram und Facebook?",
        a: "Sie erhalten einen Bestell-Link und einen QR-Code. Den Link hinterlegen Sie in Ihrem Google-Profil, in der Instagram-Bio oder auf Ihrer Facebook-Seite, den QR-Code stellen Sie auf den Tisch. Gäste öffnen ihn und bestellen per Text oder Sprache direkt im Browser.",
      },
      {
        q: "Kann ich auch Bestellungen über WhatsApp erhalten?",
        a: "Die WhatsApp-Bestellung ist noch nicht allgemein verfügbar. Wir richten sie gemeinsam mit interessierten Restaurants ein. Schreiben Sie uns an info@zelloo.ch.",
      },
      {
        q: "Was passiert nach den 15 Gratis-Tagen?",
        a: "Sie entscheiden selbst, ob Sie das Abo starten. Das Abo ist jederzeit kündbar.",
      },
      {
        q: "Gibt es Gebühren pro Bestellung?",
        a: "Nein. Ein fixer Monatspreis, keine Kommission pro Bestellung.",
      },
    ],
  },
  fr: {
    title: "Questions fréquentes",
    items: [
      {
        q: "Que comprend l'abonnement à CHF 39 par mois ?",
        a: "Page de commande avec QR code, tableau de bord avec alarme de commande, gestion du menu avec import IA, et statistiques. Aucune commission par commande.",
      },
      {
        q: "Comment les clients commandent-ils via Google, Instagram et Facebook ?",
        a: "Vous recevez un lien de commande et un QR code. Le lien se place dans votre profil Google, la bio Instagram ou votre page Facebook, et le QR code sur la table. Les clients l'ouvrent et commandent par texte ou à la voix, directement dans le navigateur.",
      },
      {
        q: "Puis-je aussi recevoir des commandes par WhatsApp ?",
        a: "La commande WhatsApp n'est pas encore disponible pour tous. Nous la configurons avec les restaurants intéressés. Écrivez-nous à info@zelloo.ch.",
      },
      {
        q: "Que se passe-t-il après les 15 jours gratuits ?",
        a: "Vous décidez vous-même de démarrer l'abonnement. Il est résiliable à tout moment.",
      },
      {
        q: "Y a-t-il des frais par commande ?",
        a: "Non. Un prix mensuel fixe, sans commission par commande.",
      },
    ],
  },
  it: {
    title: "Domande frequenti",
    items: [
      {
        q: "Cosa include l'abbonamento da CHF 39 al mese?",
        a: "Pagina d'ordine con QR code, dashboard con allarme ordini, gestione del menu con import IA, e statistiche. Nessuna commissione per ordine.",
      },
      {
        q: "Come ordinano i clienti da Google, Instagram e Facebook?",
        a: "Ricevete un link d'ordine e un QR code. Il link va nel profilo Google, nella bio di Instagram o sulla pagina Facebook, il QR code sul tavolo. I clienti lo aprono e ordinano a testo o a voce direttamente nel browser.",
      },
      {
        q: "Posso ricevere ordini anche via WhatsApp?",
        a: "L'ordine via WhatsApp non è ancora disponibile per tutti. Lo configuriamo insieme ai ristoranti interessati. Scrivete a info@zelloo.ch.",
      },
      {
        q: "Cosa succede dopo i 15 giorni gratuiti?",
        a: "Decidete voi se attivare l'abbonamento. È disdicibile in qualsiasi momento.",
      },
      {
        q: "Ci sono costi per ogni ordine?",
        a: "No. Un prezzo mensile fisso, nessuna commissione per ordine.",
      },
    ],
  },
  en: {
    title: "Frequently asked questions",
    items: [
      {
        q: "What does the CHF 39 per month plan include?",
        a: "An ordering page with QR code, a dashboard with order alarm, menu management with AI import, and statistics. There is no commission per order.",
      },
      {
        q: "How do guests order through Google, Instagram and Facebook?",
        a: "You get an order link and a QR code. Put the link in your Google profile, Instagram bio or Facebook page, and the QR code on the table. Guests open it and order by text or voice right in the browser.",
      },
      {
        q: "Can I also receive orders via WhatsApp?",
        a: "WhatsApp ordering is not generally available yet. We set it up together with interested restaurants. Email info@zelloo.ch.",
      },
      {
        q: "What happens after the 15 free days?",
        a: "You decide whether to start the subscription. You can cancel at any time.",
      },
      {
        q: "Are there fees per order?",
        a: "No. One fixed monthly price, no commission per order.",
      },
    ],
  },
  ar: {
    title: "أسئلة شائعة",
    items: [
      {
        q: "شو بيشمل الاشتراك بـ 39 فرنك بالشهر؟",
        a: "صفحة طلب مع رمز QR، لوحة تحكم مع تنبيه للطلبات، إدارة المنيو باستيراد بالذكاء الاصطناعي، وإحصائيات. بدون أي عمولة على الطلبات.",
      },
      {
        q: "كيف بيطلب الزبائن عبر Google وInstagram وFacebook؟",
        a: "بتاخد رابط طلب وكود QR. الرابط بتحطه ببروفايل Google أو بايو Instagram أو صفحة Facebook، والكود على الطاولة. الزبون بيفتحه وبيطلب بالكتابة أو بالصوت مباشرة بالمتصفح.",
      },
      {
        q: "بقدر استقبل طلبات عبر واتساب كمان؟",
        a: "الطلب عبر واتساب لسا مو متاح للكل. منجهّزه مع المطاعم المهتمة. راسلنا على info@zelloo.ch.",
      },
      {
        q: "شو بيصير بعد الـ 15 يوم المجانية؟",
        a: "أنت بتقرر إذا بدك تبدأ الاشتراك. وبتقدر تلغيه بأي وقت.",
      },
      {
        q: "في رسوم على كل طلب؟",
        a: "لا. سعر شهري ثابت، بدون عمولة على كل طلب.",
      },
    ],
  },
  tr: {
    title: "Sık sorulan sorular",
    items: [
      {
        q: "Aylık CHF 39 aboneliğe neler dahil?",
        a: "QR kodlu sipariş sayfası, sipariş alarmlı panel, yapay zeka ile menü aktarımı, ve istatistikler. Sipariş başına komisyon yoktur.",
      },
      {
        q: "Müşteriler Google, Instagram ve Facebook üzerinden nasıl sipariş verir?",
        a: "Bir sipariş bağlantısı ve QR kodu alırsınız. Bağlantıyı Google profilinize, Instagram biyografinize veya Facebook sayfanıza, QR kodunu masaya koyarsınız. Müşteriler açıp doğrudan tarayıcıda yazıyla veya sesle sipariş verir.",
      },
      {
        q: "WhatsApp üzerinden de sipariş alabilir miyim?",
        a: "WhatsApp siparişi henüz herkese açık değil. İlgilenen restoranlarla birlikte kuruyoruz. info@zelloo.ch adresine yazın.",
      },
      {
        q: "15 ücretsiz günden sonra ne olur?",
        a: "Aboneliği başlatıp başlatmayacağınıza siz karar verirsiniz. İstediğiniz zaman iptal edebilirsiniz.",
      },
      {
        q: "Sipariş başına ücret var mı?",
        a: "Hayır. Sabit aylık ücret, sipariş başına komisyon yok.",
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
