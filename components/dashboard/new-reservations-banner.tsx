import Link from "next/link";

export function NewReservationsBanner({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <Link
      href="/dashboard/reservations"
      role="alert"
      aria-live="assertive"
      className="mb-6 flex min-h-14 items-center justify-between gap-3 rounded-xl bg-orange-500 px-4 py-3 text-black shadow-md"
    >
      <span className="min-w-0">
        <span className="block text-lg font-black animate-pulse">
          {count === 1 ? "Neue Tischreservierung!" : `${count} neue Tischreservierungen!`}
        </span>
        <span className="block text-sm font-semibold">Zum Bestätigen oder Ablehnen tippen</span>
      </span>
      <span className="shrink-0 rounded-lg bg-black px-4 py-2 text-sm font-black text-white">
        Ansehen
      </span>
    </Link>
  );
}
