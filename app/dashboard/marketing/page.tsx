"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { supabase } from "@/lib/supabase";
import { readBrandColor, readLogoUrl } from "@/lib/branding";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MarketingKit } from "@/components/dashboard/marketing-kit";

type Restaurant = {
  id: number | string;
  name: string;
  logoUrl: string | null;
  brandColor: string | null;
};

export default function MarketingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [origin, setOrigin] = useState("");
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (cancelled) return;

        if (userError || !user) {
          router.replace("/login");
          return;
        }

        const { data, error } = await supabase
          .from("restaurants")
          .select("id, name")
          .eq("owner_id", user.id)
          .maybeSingle();
        if (error) throw error;
        if (cancelled) return;

        let logoUrl: string | null = null;
        let brandColor: string | null = null;
        if (data) {
          // logo_url / brand_color may not exist yet; the kit then uses defaults.
          const { data: branding } = await supabase
            .from("restaurants")
            .select("logo_url, brand_color")
            .eq("id", data.id)
            .maybeSingle();
          logoUrl = readLogoUrl(branding?.logo_url);
          brandColor = readBrandColor(branding?.brand_color);
        }
        if (cancelled) return;

        setOrigin(window.location.origin);
        setRestaurant(
          data
            ? { id: data.id, name: data.name, logoUrl, brandColor }
            : null
        );
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setPageError(
            "Restaurant konnte nicht geladen werden. Bitte versuchen Sie es erneut."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-gray-400">Wird geladen...</p>
      </main>
    );
  }

  if (pageError || !restaurant) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f9fb] p-5">
        <div className="max-w-md rounded-2xl border bg-white p-6">
          <p role="alert" className="text-red-700">
            {pageError || "Kein Restaurant gefunden."}
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-black px-4 font-bold text-white"
          >
            Zum Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const restaurantLink = `${origin}/r/${encodeURIComponent(String(restaurant.id))}`;

  return (
    <>
      <DashboardShell restaurantName={restaurant.name} />
      <main className="min-h-screen bg-[#f8f9fb] p-5 pb-24 text-black md:pb-5 md:pl-[17rem] print:min-h-0 print:bg-white print:p-0 print:md:pl-0">
        <div className="mx-auto max-w-2xl">
          <div className="print:hidden">
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-gray-600"
            >
              {"← Zurück zum Dashboard"}
            </Link>
            <Logo size="sm" className="mt-2 text-orange-500" />
            <h1 className="mt-1 text-balance text-3xl font-black">Marketing</h1>
            <p className="mt-2 text-pretty leading-relaxed text-gray-500">
              Fertige Vorlagen mit Ihrem Namen, Logo, Ihrer Farbe und Ihrem QR-Code.
              Ausdrucken oder als Bild für Social Media speichern.
            </p>
          </div>

          <MarketingKit
            restaurantName={restaurant.name}
            restaurantLink={restaurantLink}
            logoUrl={restaurant.logoUrl}
            brandColor={restaurant.brandColor}
          />
        </div>
      </main>
    </>
  );
}
