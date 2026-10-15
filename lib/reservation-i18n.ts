import type { OrderLang } from "./order-i18n";

export type ReservationStrings = {
  button: string;
  title: string;
  dateLabel: string;
  timeLabel: string;
  partyLabel: string;
  partyCount: (count: number) => string;
  decrease: string;
  increase: string;
  maxParty: (max: number) => string;
  noSlots: string;
  nameLabel: string;
  phoneLabel: string;
  emailLabel: string;
  emailHint: string;
  noteLabel: string;
  notePlaceholder: string;
  submit: string;
  sending: string;
  close: string;
  missingFields: string;
  genericError: string;
  slotError: string;
  limitError: string;
  unavailableError: string;
  successTitle: string;
  successText: string;
  statusNew: string;
  statusConfirmed: string;
  statusDeclined: string;
  statusCancelled: string;
  statusNotFound: string;
  statusLinkLabel: string;
  copyLink: string;
  copied: string;
  backToMenu: string;
};

export const RESERVATION_STRINGS: Record<OrderLang, ReservationStrings> = {
  de: {
    button: "Tisch reservieren",
    title: "Tisch reservieren",
    dateLabel: "Datum",
    timeLabel: "Uhrzeit",
    partyLabel: "Personen",
    partyCount: (count) => (count === 1 ? "1 Person" : `${count} Personen`),
    decrease: "Weniger Personen",
    increase: "Mehr Personen",
    maxParty: (max) => `Für mehr als ${max} Personen bitte telefonisch reservieren.`,
    noSlots: "Keine freien Zeiten an diesem Tag.",
    nameLabel: "Name",
    phoneLabel: "Telefonnummer",
    emailLabel: "E-Mail (optional)",
    emailHint: "Wir schicken Ihnen die Bestätigung per E-Mail.",
    noteLabel: "Bemerkung (optional)",
    notePlaceholder: "z. B. Kinderstuhl, Allergien",
    submit: "Reservierung anfragen",
    sending: "Wird gesendet...",
    close: "Schliessen",
    missingFields: "Bitte Name und Telefonnummer angeben.",
    genericError: "Reservierung konnte nicht gesendet werden. Bitte erneut versuchen.",
    slotError: "Diese Zeit ist nicht mehr verfügbar. Bitte eine andere wählen.",
    limitError: "Sie haben bereits mehrere offene Reservierungen. Bitte rufen Sie das Restaurant an.",
    unavailableError: "Reservierungen sind gerade nicht möglich.",
    successTitle: "Anfrage gesendet",
    successText: "Das Restaurant prüft Ihre Anfrage und bestätigt sie in Kürze.",
    statusNew: "Wartet auf Bestätigung",
    statusConfirmed: "Bestätigt. Wir freuen uns auf Sie!",
    statusDeclined: "Leider nicht möglich. Bitte wählen Sie eine andere Zeit.",
    statusCancelled: "Storniert",
    statusNotFound: "Reservierung nicht gefunden.",
    statusLinkLabel: "Link zum Status dieser Reservierung",
    copyLink: "Link kopieren",
    copied: "Kopiert",
    backToMenu: "Zurück zur Speisekarte",
  },
  fr: {
    button: "Réserver une table",
    title: "Réserver une table",
    dateLabel: "Date",
    timeLabel: "Heure",
    partyLabel: "Personnes",
    partyCount: (count) => (count === 1 ? "1 personne" : `${count} personnes`),
    decrease: "Moins de personnes",
    increase: "Plus de personnes",
    maxParty: (max) => `Pour plus de ${max} personnes, veuillez réserver par téléphone.`,
    noSlots: "Aucun créneau libre ce jour-là.",
    nameLabel: "Nom",
    phoneLabel: "Numéro de téléphone",
    emailLabel: "E-mail (facultatif)",
    emailHint: "Nous vous enverrons la confirmation par e-mail.",
    noteLabel: "Remarque (facultatif)",
    notePlaceholder: "p. ex. chaise enfant, allergies",
    submit: "Demander la réservation",
    sending: "Envoi en cours...",
    close: "Fermer",
    missingFields: "Veuillez indiquer votre nom et votre numéro de téléphone.",
    genericError: "La réservation n'a pas pu être envoyée. Veuillez réessayer.",
    slotError: "Cet horaire n'est plus disponible. Veuillez en choisir un autre.",
    limitError: "Vous avez déjà plusieurs réservations ouvertes. Veuillez appeler le restaurant.",
    unavailableError: "Les réservations ne sont pas possibles pour le moment.",
    successTitle: "Demande envoyée",
    successText: "Le restaurant examine votre demande et la confirmera bientôt.",
    statusNew: "En attente de confirmation",
    statusConfirmed: "Confirmée. Nous nous réjouissons de vous accueillir !",
    statusDeclined: "Malheureusement impossible. Veuillez choisir un autre horaire.",
    statusCancelled: "Annulée",
    statusNotFound: "Réservation introuvable.",
    statusLinkLabel: "Lien vers le statut de cette réservation",
    copyLink: "Copier le lien",
    copied: "Copié",
    backToMenu: "Retour au menu",
  },
  it: {
    button: "Prenota un tavolo",
    title: "Prenota un tavolo",
    dateLabel: "Data",
    timeLabel: "Ora",
    partyLabel: "Persone",
    partyCount: (count) => (count === 1 ? "1 persona" : `${count} persone`),
    decrease: "Meno persone",
    increase: "Più persone",
    maxParty: (max) => `Per più di ${max} persone, prenota per telefono.`,
    noSlots: "Nessun orario libero in questo giorno.",
    nameLabel: "Nome",
    phoneLabel: "Numero di telefono",
    emailLabel: "E-mail (facoltativa)",
    emailHint: "Ti invieremo la conferma via e-mail.",
    noteLabel: "Nota (facoltativa)",
    notePlaceholder: "es. seggiolone, allergie",
    submit: "Richiedi la prenotazione",
    sending: "Invio in corso...",
    close: "Chiudi",
    missingFields: "Inserisci nome e numero di telefono.",
    genericError: "Impossibile inviare la prenotazione. Riprova.",
    slotError: "Questo orario non è più disponibile. Scegline un altro.",
    limitError: "Hai già diverse prenotazioni aperte. Chiama il ristorante.",
    unavailableError: "Al momento non è possibile prenotare.",
    successTitle: "Richiesta inviata",
    successText: "Il ristorante sta esaminando la tua richiesta e la confermerà a breve.",
    statusNew: "In attesa di conferma",
    statusConfirmed: "Confermata. Non vediamo l'ora di vederti!",
    statusDeclined: "Purtroppo non è possibile. Scegli un altro orario.",
    statusCancelled: "Annullata",
    statusNotFound: "Prenotazione non trovata.",
    statusLinkLabel: "Link allo stato di questa prenotazione",
    copyLink: "Copia il link",
    copied: "Copiato",
    backToMenu: "Torna al menu",
  },
  en: {
    button: "Reserve a table",
    title: "Reserve a table",
    dateLabel: "Date",
    timeLabel: "Time",
    partyLabel: "Guests",
    partyCount: (count) => (count === 1 ? "1 guest" : `${count} guests`),
    decrease: "Fewer guests",
    increase: "More guests",
    maxParty: (max) => `For more than ${max} guests, please book by phone.`,
    noSlots: "No free times on this day.",
    nameLabel: "Name",
    phoneLabel: "Phone number",
    emailLabel: "Email (optional)",
    emailHint: "We will email you the confirmation.",
    noteLabel: "Note (optional)",
    notePlaceholder: "e.g. high chair, allergies",
    submit: "Request reservation",
    sending: "Sending...",
    close: "Close",
    missingFields: "Please enter your name and phone number.",
    genericError: "The reservation could not be sent. Please try again.",
    slotError: "This time is no longer available. Please pick another.",
    limitError: "You already have several open reservations. Please call the restaurant.",
    unavailableError: "Reservations are not available right now.",
    successTitle: "Request sent",
    successText: "The restaurant is reviewing your request and will confirm it shortly.",
    statusNew: "Waiting for confirmation",
    statusConfirmed: "Confirmed. We look forward to seeing you!",
    statusDeclined: "Unfortunately not possible. Please choose another time.",
    statusCancelled: "Cancelled",
    statusNotFound: "Reservation not found.",
    statusLinkLabel: "Link to this reservation's status",
    copyLink: "Copy link",
    copied: "Copied",
    backToMenu: "Back to menu",
  },
  ar: {
    button: "احجز طاولة",
    title: "احجز طاولة",
    dateLabel: "التاريخ",
    timeLabel: "الوقت",
    partyLabel: "عدد الأشخاص",
    partyCount: (count) => `${count} أشخاص`,
    decrease: "أقل",
    increase: "أكثر",
    maxParty: (max) => `لأكثر من ${max} أشخاص، يرجى الحجز بالاتصال بالمطعم.`,
    noSlots: "لا توجد أوقات متاحة في هذا اليوم.",
    nameLabel: "الاسم",
    phoneLabel: "رقم الهاتف",
    emailLabel: "البريد الإلكتروني (اختياري)",
    emailHint: "سنرسل لك التأكيد على بريدك الإلكتروني.",
    noteLabel: "ملاحظة (اختياري)",
    notePlaceholder: "مثلاً: كرسي أطفال، حساسية",
    submit: "إرسال طلب الحجز",
    sending: "جارٍ الإرسال...",
    close: "إغلاق",
    missingFields: "يرجى إدخال الاسم ورقم الهاتف.",
    genericError: "تعذّر إرسال الحجز. يرجى المحاولة مرة أخرى.",
    slotError: "هذا الوقت لم يعد متاحاً. يرجى اختيار وقت آخر.",
    limitError: "لديك عدة حجوزات مفتوحة بالفعل. يرجى الاتصال بالمطعم.",
    unavailableError: "الحجز غير متاح حالياً.",
    successTitle: "تم إرسال الطلب",
    successText: "المطعم يراجع طلبك وسيؤكده قريباً.",
    statusNew: "بانتظار التأكيد",
    statusConfirmed: "تم التأكيد. بانتظارك!",
    statusDeclined: "للأسف غير ممكن. يرجى اختيار وقت آخر.",
    statusCancelled: "تم الإلغاء",
    statusNotFound: "الحجز غير موجود.",
    statusLinkLabel: "رابط حالة هذا الحجز",
    copyLink: "نسخ الرابط",
    copied: "تم النسخ",
    backToMenu: "العودة إلى القائمة",
  },
};
