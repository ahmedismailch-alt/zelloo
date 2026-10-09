"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { supabase } from "@/lib/supabase";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

function IconOrders() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M9 2v3m6-3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 13h8M8 17h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M5 4h14M5 10h14M5 16h9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconTables() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M3 10h18M9 10v10" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconStats() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M4 20V10m6 10V4m6 16v-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M19.4 13a7.97 7.97 0 0 0 0-2l2.03-1.58a.5.5 0 0 0 .12-.65l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a8 8 0 0 0-1.73-1l-.36-2.54a.5.5 0 0 0-.5-.43h-3.84a.5.5 0 0 0-.5.43l-.36 2.54a8 8 0 0 0-1.73 1l-2.39-.96a.5.5 0 0 0-.6.22L2.75 8.77a.5.5 0 0 0 .12.65L4.9 11a7.97 7.97 0 0 0 0 2l-2.03 1.58a.5.5 0 0 0-.12.65l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96a8 8 0 0 0 1.73 1l.36 2.54a.5.5 0 0 0 .5.43h3.84a.5.5 0 0 0 .5-.43l.36-2.54a8 8 0 0 0 1.73-1l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.65L19.4 13Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconQr() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M14 14h3v3h-3zM20 14v.01M14 20h3m3-3v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMore() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Bestellungen", icon: <IconOrders /> },
  { href: "/menu", label: "Menü", icon: <IconMenu /> },
  { href: "/dashboard/tables", label: "Tische", icon: <IconTables /> },
  { href: "/dashboard/stats", label: "Statistiken", icon: <IconStats /> },
  { href: "/dashboard/settings", label: "Einstellungen", icon: <IconSettings /> },
];

/**
 * Desktop-only sidebar for the restaurant owner dashboard.
 *
 * Renders nothing meaningful below the `md` breakpoint (mobile stays exactly
 * as before). From `md` up it becomes a fixed left sidebar, and the caller
 * is expected to add `md:pl-64` to its own scrolling container so content
 * doesn't sit underneath it.
 */
export function DashboardShell({ restaurantName }: { restaurantName?: string }) {
  return (
    <>
      <MobileBottomNav />
      <DesktopSidebar restaurantName={restaurantName} />
    </>
  );
}

const mobileTabs: { href: string; label: string; icon: React.ReactNode }[] = [
  {
    href: "/dashboard",
    label: "Bestellungen",
    icon: (
      <span className="[&>svg]:h-6 [&>svg]:w-6">
        <IconOrders />
      </span>
    ),
  },
  {
    href: "/menu",
    label: "Menü",
    icon: (
      <span className="[&>svg]:h-6 [&>svg]:w-6">
        <IconMenu />
      </span>
    ),
  },
  { href: "/dashboard/tables", label: "QR", icon: <IconQr /> },
];

/**
 * Mobile-only fixed bottom navigation: Bestellungen | Menü | QR | Mehr.
 * "Mehr" opens a small sheet with Statistiken, Einstellungen and Abmelden.
 */
function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const moreActive =
    pathname?.startsWith("/dashboard/stats") ||
    pathname?.startsWith("/dashboard/settings");

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (error) {
      console.error(error);
      setLoggingOut(false);
    }
  }

  const tabClass = (active: boolean) =>
    `flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-bold ${
      active ? "text-orange-600" : "text-gray-500"
    }`;

  return (
    <div className="md:hidden print:hidden">
      {moreOpen && (
        <>
          <button
            type="button"
            aria-label="Menü schliessen"
            onClick={() => setMoreOpen(false)}
            className="fixed inset-0 z-40 bg-black/30"
          />
          <div
            role="menu"
            className="fixed inset-x-3 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-50 rounded-2xl border border-black/10 bg-white p-2 shadow-xl"
          >
            <Link
              href="/dashboard/stats"
              role="menuitem"
              onClick={() => setMoreOpen(false)}
              className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-black active:bg-gray-100"
            >
              <IconStats />
              Statistiken
            </Link>
            <Link
              href="/dashboard/settings"
              role="menuitem"
              onClick={() => setMoreOpen(false)}
              className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-black active:bg-gray-100"
            >
              <IconSettings />
              Einstellungen
            </Link>
            <button
              type="button"
              role="menuitem"
              disabled={loggingOut}
              onClick={() => void handleLogout()}
              className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-red-700 active:bg-red-50 disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M9 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h3M16 8l4 4-4 4M20 12H9"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {loggingOut ? "Wird abgemeldet..." : "Abmelden"}
            </button>
          </div>
        </>
      )}

      <nav
        aria-label="Hauptnavigation"
        className="fixed inset-x-0 bottom-0 z-50 flex border-t border-black/10 bg-white pb-[env(safe-area-inset-bottom)]"
      >
        {mobileTabs.map((tab) => {
          const active =
            tab.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              onClick={() => setMoreOpen(false)}
              className={tabClass(Boolean(active))}
            >
              {tab.icon}
              {tab.label}
            </Link>
          );
        })}
        <button
          type="button"
          aria-expanded={moreOpen}
          aria-haspopup="menu"
          onClick={() => setMoreOpen((open) => !open)}
          className={tabClass(Boolean(moreActive) || moreOpen)}
        >
          <IconMore />
          Mehr
        </button>
      </nav>
    </div>
  );
}

function DesktopSidebar({ restaurantName }: { restaurantName?: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Dashboard-Navigation"
      className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex md:w-64 md:flex-col md:border-r md:border-black/10 md:bg-white"
    >
      <div className="flex h-16 items-center gap-2 border-b border-black/10 px-6">
        <Logo size="sm" className="text-black" />
      </div>

      {restaurantName && (
        <div className="border-b border-black/10 px-6 py-4">
          <p className="truncate text-sm font-semibold text-black">
            {restaurantName}
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname?.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-black"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
