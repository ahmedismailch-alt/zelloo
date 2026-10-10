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
  title: "Zelloo – Bestellsystem für Restaurants und Cafés in der Schweiz",
  description:
    "Gäste bestellen per Text oder Sprache. Fixer Monatspreis, 0% Kommission pro Bestellung.",
  verification: {
    google: "eTx1Tlx4lhfZXSQzLfFClLjg6E0eoPTt_Vy2SN7UzWQ",
  },
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
