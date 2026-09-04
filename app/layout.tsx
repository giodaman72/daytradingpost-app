import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { HomeSectionOrder } from "@/components/home/HomeSectionOrder";
import { APP_CONFIG } from "@/lib/config";
import { getRequestLocale } from "@/lib/i18n/server";
import "./globals.css";
import "./desktop-centering.css";
import "./home-reference.css";

// The header is personalized from the verified Supabase session on every request.
export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const spanish = locale === "es";
  const description = spanish
    ? "Análisis diario de mercados, formación en trading, información técnica y recursos premium para traders activos."
    : "Daily market analysis, trading education, technical insights and premium resources for active traders.";

  return {
    metadataBase: new URL(APP_CONFIG.siteUrl),
    title: {
      default: spanish
        ? "DayTradingPost | Inteligencia de mercado para traders activos"
        : "DayTradingPost | Market Intelligence for Active Traders",
      template: "%s | DayTradingPost",
    },
    description,
    keywords: spanish
      ? [
          "trading intradía",
          "análisis técnico",
          "análisis de mercados",
          "formación en trading",
          "forex",
          "índices",
          "materias primas",
          "criptomonedas",
        ]
      : [
          "day trading",
          "technical analysis",
          "market analysis",
          "trading education",
          "forex",
          "indices",
          "commodities",
          "cryptocurrency",
        ],
    openGraph: {
      title: "DayTradingPost",
      description: spanish
        ? "Inteligencia profesional de mercados para traders activos."
        : "Professional market intelligence for active traders.",
      url: spanish ? "/es" : "/",
      siteName: "DayTradingPost",
      locale: spanish ? "es_ES" : "en_US",
      alternateLocale: spanish ? ["en_US"] : ["es_ES"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "DayTradingPost",
      description: spanish
        ? "Inteligencia profesional de mercados para traders activos."
        : "Professional market intelligence for active traders.",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <html
      className={`${geistSans.variable} ${geistMono.variable}`}
      data-scroll-behavior="smooth"
      lang={locale}
    >
      <body className="antialiased">
        {children}
        <HomeSectionOrder />
      </body>
    </html>
  );
}
