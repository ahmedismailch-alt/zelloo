import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zelloo.ch"),
  alternates: {
    canonical: "./",
  },
  title: "Zelloo – Bestellsystem für Restaurants und Cafés in der Schweiz",
  description:
    "Gäste bestellen per Text oder Sprache. Fixer Monatspreis, 0% Kommission pro Bestellung.",
  verification: {
    google: "eTx1Tlx4lhfZXSQzLfFClLjg6E0eoPTt_Vy2SN7UzWQ",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://zelloo.ch/#organization",
      name: "Zelloo",
      alternateName: "Zelloo.ch",
      url: "https://zelloo.ch",
      logo: "https://zelloo.ch/icon.png",
      description:
        "Zelloo ist ein Bestellsystem für Restaurants und Cafés in der Schweiz. Gäste bestellen per Text oder Sprache über QR-Code. Fixer Monatspreis, 0% Kommission pro Bestellung.",
      areaServed: { "@type": "Country", name: "Switzerland" },
      email: "info@zelloo.ch",
      telephone: "+41445053220",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "info@zelloo.ch",
        telephone: "+41445053220",
        areaServed: "CH",
        availableLanguage: ["de", "fr", "it", "en"],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://zelloo.ch/#website",
      url: "https://zelloo.ch",
      name: "Zelloo",
      alternateName: "Zelloo Bestellsystem für Restaurants",
      inLanguage: "de-CH",
      publisher: { "@id": "https://zelloo.ch/#organization" },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
