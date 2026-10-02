export const ORDER_LANGS = ["de", "fr", "it", "en", "ar"] as const;
export type OrderLang = (typeof ORDER_LANGS)[number];

export const LANG_LABELS: Record<OrderLang, string> = {
  de: "DE",
  fr: "FR",
  it: "IT",
  en: "EN",
  ar: "عربي",
};

export const LANG_STORAGE_KEY = "zelloo-order-lang";

export function isOrderLang(value: unknown): value is OrderLang {
  return typeof value === "string" && (ORDER_LANGS as readonly string[]).includes(value);
}

export function detectLang(languages: readonly string[]): OrderLang {
  for (const entry of languages) {
    const code = entry.toLowerCase().split("-")[0];
    if (isOrderLang(code)) return code;
  }
  return "de";
}

export type OrderStrings = {
  languageLabel: string;
  table: (table: string) => string;
  payAtCounter: string;
  menuUnavailableTitle: string;
  menuUnavailableText: string;
  menuLabel: string;
  otherCategory: string;
  add: (name: string) => string;
  remove: (name: string) => string;
  aiTitle: string;
  aiExample: string;
  aiLabel: string;
  aiPlaceholder: string;
  aiSubmit: string;
  aiLoading: string;
  aiAdded: (count: number) => string;
  aiAddedOne: (quantity: number, name: string) => string;
  aiNotFound: (list: string) => string;
  aiNothing: string;
  aiError: string;
  micStart: string;
  micStop: string;
  micListening: string;
  micTranscribing: string;
  micDenied: string;
  micUnsupported: string;
  micError: string;
  didYouMean: string;
  viewCart: (count: number) => string;
  closeCart: string;
  nameLabel: string;
  noteLabel: string;
  notePlaceholder: string;
  finalPriceInfo: string;
  sending: string;
  order: (total: string) => string;
  sendError: string;
  statusLabel: string;
  steps: { new: string; accepted: string; preparing: string; ready: string };
  badgeSent: string;
  badgeReady: string;
  badgeCancelled: string;
  headline: {
    new: string;
    accepted: string;
    preparing: string;
    ready: string;
    cancelled: string;
  };
  orderNumber: (id: string, total: string) => string;
  anotherOrder: string;
};

const de: OrderStrings = {
  languageLabel: "Sprache",
  table: (t) => `Tisch ${t}`,
  payAtCounter: "Bezahlung an der Kasse",
  menuUnavailableTitle: "Speisekarte noch nicht verfügbar",
  menuUnavailableText: "Bitte bestellen Sie direkt beim Personal.",
  menuLabel: "Speisekarte",
  otherCategory: "Weitere",
  add: (n) => `${n} hinzufügen`,
  remove: (n) => `${n} entfernen`,
  aiTitle: "Einfach schreiben, was Sie möchten",
  aiExample: "Zum Beispiel: «2 Cappuccino und ein Gipfeli»",
  aiLabel: "Bestellung in eigenen Worten",
  aiPlaceholder: "Ich hätte gerne...",
  aiSubmit: "Zum Warenkorb hinzufügen",
  aiLoading: "Wird verstanden...",
  aiAdded: (c) => `${c} Artikel zum Warenkorb hinzugefügt.`,
  aiAddedOne: (q, n) => `${q}× ${n} zum Warenkorb hinzugefügt.`,
  aiNotFound: (l) => `Nicht gefunden: ${l}`,
  aiNothing: "Keine passenden Artikel gefunden. Bitte anders formulieren.",
  aiError: "Bestellung konnte nicht verstanden werden.",
  micStart: "Tippen und sprechen",
  micStop: "Aufnahme beenden",
  micListening: "Ich höre zu...",
  micTranscribing: "Wird umgewandelt...",
  micDenied: "Kein Zugriff aufs Mikrofon. Bitte schreiben Sie Ihre Bestellung.",
  micUnsupported: "Sprachaufnahme wird hier nicht unterstützt. Bitte schreiben Sie.",
  micError: "Wir konnten Sie nicht verstehen. Bitte nochmals versuchen.",
  didYouMean: "Meinten Sie:",
  viewCart: (c) => `Warenkorb ansehen (${c})`,
  closeCart: "Warenkorb schliessen",
  nameLabel: "Ihr Name (optional)",
  noteLabel: "Hinweis (optional)",
  notePlaceholder: "z. B. Allergien",
  finalPriceInfo: "Der Endbetrag wird vom Restaurant anhand der aktuellen Preise berechnet.",
  sending: "Wird gesendet...",
  order: (t) => `Bestellen · ${t}`,
  sendError: "Bestellung konnte nicht gesendet werden.",
  statusLabel: "Bestellstatus",
  steps: { new: "Eingegangen", accepted: "Angenommen", preparing: "In Zubereitung", ready: "Bereit" },
  badgeSent: "BESTELLUNG GESENDET",
  badgeReady: "BEREIT",
  badgeCancelled: "STORNIERT",
  headline: {
    new: "Danke! Ihre Bestellung ist eingegangen.",
    accepted: "Ihre Bestellung wurde angenommen.",
    preparing: "Ihre Bestellung wird zubereitet.",
    ready: "Ihre Bestellung ist bereit!",
    cancelled: "Ihre Bestellung wurde storniert.",
  },
  orderNumber: (id, t) => `Nr. #${id} · ${t} · Bezahlung an der Kasse`,
  anotherOrder: "Weitere Bestellung",
};

const fr: OrderStrings = {
  languageLabel: "Langue",
  table: (t) => `Table ${t}`,
  payAtCounter: "Paiement à la caisse",
  menuUnavailableTitle: "Carte pas encore disponible",
  menuUnavailableText: "Veuillez commander directement auprès du personnel.",
  menuLabel: "Carte",
  otherCategory: "Autres",
  add: (n) => `Ajouter ${n}`,
  remove: (n) => `Retirer ${n}`,
  aiTitle: "Écrivez simplement ce que vous voulez",
  aiExample: "Par exemple : «2 cappuccinos et un croissant»",
  aiLabel: "Commande avec vos propres mots",
  aiPlaceholder: "Je voudrais...",
  aiSubmit: "Ajouter au panier",
  aiLoading: "Analyse en cours...",
  aiAdded: (c) => `${c} article(s) ajouté(s) au panier.`,
  aiAddedOne: (q, n) => `${q}× ${n} ajouté au panier.`,
  aiNotFound: (l) => `Introuvable : ${l}`,
  aiNothing: "Aucun article correspondant. Veuillez reformuler.",
  aiError: "La commande n'a pas pu être comprise.",
  micStart: "Touchez et parlez",
  micStop: "Arrêter l'enregistrement",
  micListening: "Je vous écoute...",
  micTranscribing: "Conversion en cours...",
  micDenied: "Pas d'accès au micro. Veuillez écrire votre commande.",
  micUnsupported: "L'enregistrement vocal n'est pas pris en charge ici. Veuillez écrire.",
  micError: "Nous n'avons pas pu vous comprendre. Veuillez réessayer.",
  didYouMean: "Vouliez-vous dire :",
  viewCart: (c) => `Voir le panier (${c})`,
  closeCart: "Fermer le panier",
  nameLabel: "Votre nom (facultatif)",
  noteLabel: "Remarque (facultatif)",
  notePlaceholder: "p. ex. allergies",
  finalPriceInfo: "Le montant final est calculé par le restaurant selon les prix actuels.",
  sending: "Envoi en cours...",
  order: (t) => `Commander · ${t}`,
  sendError: "La commande n'a pas pu être envoyée.",
  statusLabel: "Statut de la commande",
  steps: { new: "Reçue", accepted: "Acceptée", preparing: "En préparation", ready: "Prête" },
  badgeSent: "COMMANDE ENVOYÉE",
  badgeReady: "PRÊTE",
  badgeCancelled: "ANNULÉE",
  headline: {
    new: "Merci ! Votre commande a été reçue.",
    accepted: "Votre commande a été acceptée.",
    preparing: "Votre commande est en préparation.",
    ready: "Votre commande est prête !",
    cancelled: "Votre commande a été annulée.",
  },
  orderNumber: (id, t) => `N° #${id} · ${t} · Paiement à la caisse`,
  anotherOrder: "Nouvelle commande",
};

const it: OrderStrings = {
  languageLabel: "Lingua",
  table: (t) => `Tavolo ${t}`,
  payAtCounter: "Pagamento alla cassa",
  menuUnavailableTitle: "Menù non ancora disponibile",
  menuUnavailableText: "Si prega di ordinare direttamente al personale.",
  menuLabel: "Menù",
  otherCategory: "Altro",
  add: (n) => `Aggiungi ${n}`,
  remove: (n) => `Rimuovi ${n}`,
  aiTitle: "Scrivi semplicemente cosa desideri",
  aiExample: "Per esempio: «2 cappuccini e un cornetto»",
  aiLabel: "Ordine con parole tue",
  aiPlaceholder: "Vorrei...",
  aiSubmit: "Aggiungi al carrello",
  aiLoading: "Sto capendo...",
  aiAdded: (c) => `${c} articolo/i aggiunto/i al carrello.`,
  aiAddedOne: (q, n) => `${q}× ${n} aggiunto al carrello.`,
  aiNotFound: (l) => `Non trovato: ${l}`,
  aiNothing: "Nessun articolo corrispondente. Prova a riformulare.",
  aiError: "Non è stato possibile capire l'ordine.",
  micStart: "Tocca e parla",
  micStop: "Termina registrazione",
  micListening: "Ti ascolto...",
  micTranscribing: "Conversione in corso...",
  micDenied: "Nessun accesso al microfono. Scrivi il tuo ordine.",
  micUnsupported: "La registrazione vocale non è supportata qui. Scrivi il tuo ordine.",
  micError: "Non siamo riusciti a capirti. Riprova.",
  didYouMean: "Intendevi:",
  viewCart: (c) => `Vedi carrello (${c})`,
  closeCart: "Chiudi carrello",
  nameLabel: "Il tuo nome (facoltativo)",
  noteLabel: "Nota (facoltativo)",
  notePlaceholder: "es. allergie",
  finalPriceInfo: "L'importo finale viene calcolato dal ristorante in base ai prezzi attuali.",
  sending: "Invio in corso...",
  order: (t) => `Ordina · ${t}`,
  sendError: "Non è stato possibile inviare l'ordine.",
  statusLabel: "Stato dell'ordine",
  steps: { new: "Ricevuto", accepted: "Accettato", preparing: "In preparazione", ready: "Pronto" },
  badgeSent: "ORDINE INVIATO",
  badgeReady: "PRONTO",
  badgeCancelled: "ANNULLATO",
  headline: {
    new: "Grazie! Il tuo ordine è stato ricevuto.",
    accepted: "Il tuo ordine è stato accettato.",
    preparing: "Il tuo ordine è in preparazione.",
    ready: "Il tuo ordine è pronto!",
    cancelled: "Il tuo ordine è stato annullato.",
  },
  orderNumber: (id, t) => `N. #${id} · ${t} · Pagamento alla cassa`,
  anotherOrder: "Nuovo ordine",
};

const en: OrderStrings = {
  languageLabel: "Language",
  table: (t) => `Table ${t}`,
  payAtCounter: "Pay at the counter",
  menuUnavailableTitle: "Menu not available yet",
  menuUnavailableText: "Please order directly with the staff.",
  menuLabel: "Menu",
  otherCategory: "Other",
  add: (n) => `Add ${n}`,
  remove: (n) => `Remove ${n}`,
  aiTitle: "Just write what you'd like",
  aiExample: "For example: «2 cappuccinos and a croissant»",
  aiLabel: "Order in your own words",
  aiPlaceholder: "I'd like...",
  aiSubmit: "Add to cart",
  aiLoading: "Understanding...",
  aiAdded: (c) => `${c} item(s) added to cart.`,
  aiAddedOne: (q, n) => `${q}× ${n} added to cart.`,
  aiNotFound: (l) => `Not found: ${l}`,
  aiNothing: "No matching items found. Please try different words.",
  aiError: "Your order could not be understood.",
  micStart: "Tap and speak",
  micStop: "Stop recording",
  micListening: "Listening...",
  micTranscribing: "Converting...",
  micDenied: "No microphone access. Please type your order.",
  micUnsupported: "Voice recording isn't supported here. Please type your order.",
  micError: "We couldn't understand you. Please try again.",
  didYouMean: "Did you mean:",
  viewCart: (c) => `View cart (${c})`,
  closeCart: "Close cart",
  nameLabel: "Your name (optional)",
  noteLabel: "Note (optional)",
  notePlaceholder: "e.g. allergies",
  finalPriceInfo: "The final amount is calculated by the restaurant using current prices.",
  sending: "Sending...",
  order: (t) => `Order · ${t}`,
  sendError: "Your order could not be sent.",
  statusLabel: "Order status",
  steps: { new: "Received", accepted: "Accepted", preparing: "Preparing", ready: "Ready" },
  badgeSent: "ORDER SENT",
  badgeReady: "READY",
  badgeCancelled: "CANCELLED",
  headline: {
    new: "Thank you! Your order has been received.",
    accepted: "Your order has been accepted.",
    preparing: "Your order is being prepared.",
    ready: "Your order is ready!",
    cancelled: "Your order has been cancelled.",
  },
  orderNumber: (id, t) => `No. #${id} · ${t} · Pay at the counter`,
  anotherOrder: "New order",
};

const ar: OrderStrings = {
  languageLabel: "اللغة",
  table: (t) => `طاولة ${t}`,
  payAtCounter: "الدفع عند الصندوق",
  menuUnavailableTitle: "قائمة الطعام غير متوفرة بعد",
  menuUnavailableText: "يرجى الطلب مباشرة من الموظفين.",
  menuLabel: "قائمة الطعام",
  otherCategory: "أخرى",
  add: (n) => `إضافة ${n}`,
  remove: (n) => `إزالة ${n}`,
  aiTitle: "اكتب ببساطة ما تريد",
  aiExample: "مثلاً: «٢ كابتشينو وكرواسون»",
  aiLabel: "اكتب طلبك بكلماتك",
  aiPlaceholder: "بدي...",
  aiSubmit: "أضف إلى السلة",
  aiLoading: "جارٍ الفهم...",
  aiAdded: (c) => `تمت إضافة ${c} صنف إلى السلة.`,
  aiAddedOne: (q, n) => `تمت إضافة ${q}× ${n} إلى السلة.`,
  aiNotFound: (l) => `غير موجود: ${l}`,
  aiNothing: "لم نجد أصنافاً مطابقة. جرّب كتابة الطلب بطريقة أخرى.",
  aiError: "لم نتمكن من فهم الطلب.",
  micStart: "اضغط وتكلّم",
  micStop: "إيقاف التسجيل",
  micListening: "جاري الاستماع...",
  micTranscribing: "جاري التحويل إلى نص...",
  micDenied: "لا يوجد إذن للميكروفون. يرجى كتابة طلبك.",
  micUnsupported: "التسجيل الصوتي غير مدعوم هنا. يرجى كتابة طلبك.",
  micError: "لم نتمكن من فهم الصوت. يرجى المحاولة مرة أخرى.",
  didYouMean: "هل تقصد:",
  viewCart: (c) => `عرض السلة (${c})`,
  closeCart: "إغلاق السلة",
  nameLabel: "اسمك (اختياري)",
  noteLabel: "ملاحظة (اختياري)",
  notePlaceholder: "مثلاً: حساسية",
  finalPriceInfo: "يحسب المطعم المبلغ النهائي حسب الأسعار الحالية.",
  sending: "جارٍ الإرسال...",
  order: (t) => `اطلب · ${t}`,
  sendError: "لم نتمكن من إرسال الطلب.",
  statusLabel: "حالة الطلب",
  steps: { new: "تم الاستلام", accepted: "تم القبول", preparing: "قيد التحضير", ready: "جاهز" },
  badgeSent: "تم إرسال الطلب",
  badgeReady: "جاهز",
  badgeCancelled: "ملغى",
  headline: {
    new: "شكراً! تم استلام طلبك.",
    accepted: "تم قبول طلبك.",
    preparing: "طلبك قيد التحضير.",
    ready: "طلبك جاهز!",
    cancelled: "تم إلغاء طلبك.",
  },
  orderNumber: (id, t) => `رقم #${id} · ${t} · الدفع عند الصندوق`,
  anotherOrder: "طلب جديد",
};

export const ORDER_STRINGS: Record<OrderLang, OrderStrings> = { de, fr, it, en, ar };
