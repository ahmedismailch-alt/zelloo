export default function RestaurantLoading() {
  return (
    <main
      role="status"
      aria-busy="true"
      aria-label="Zelloo"
      className="min-h-screen bg-slate-50"
    >
      <span className="sr-only">Laden…</span>
      <header className="bg-black px-4 pb-6 pt-14 text-white">
        <p className="text-sm font-extrabold tracking-wide text-orange-500">
          ZELLOO
        </p>
        <div className="mt-3 h-9 w-2/3 animate-pulse rounded-lg bg-white/15" />
        <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-white/10" />
      </header>

      <div className="space-y-4 px-4 pt-5">
        <div className="h-12 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
        <div className="h-48 animate-pulse rounded-3xl bg-white ring-1 ring-slate-200" />
        <div className="flex gap-2 overflow-hidden">
          <div className="h-11 w-16 shrink-0 animate-pulse rounded-full bg-slate-200" />
          <div className="h-11 w-28 shrink-0 animate-pulse rounded-full bg-slate-200" />
          <div className="h-11 w-20 shrink-0 animate-pulse rounded-full bg-slate-200" />
        </div>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex gap-3 rounded-3xl bg-white p-3 ring-1 ring-slate-200"
          >
            <div className="h-20 w-20 shrink-0 animate-pulse rounded-2xl bg-slate-200" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
