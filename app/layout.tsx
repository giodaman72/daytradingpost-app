import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://daytradingpost.com"),
  title: {
    default: "DayTradingPost | Market Intelligence for Active Traders",
    template: "%s | DayTradingPost",
  },
  description:
    "Daily market analysis, trading education, technical insights and premium resources for active traders.",
  keywords: [
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
    description: "Professional market intelligence for active traders.",
    url: "https://daytradingpost.com",
    siteName: "DayTradingPost",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DayTradingPost",
    description: "Professional market intelligence for active traders.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
