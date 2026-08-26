import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, IBM_Plex_Mono } from "next/font/google";
import Navigation from "@/components/Navigation";
import MainWrapper from "@/components/MainWrapper";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://e-mboppi-production.up.railway.app";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "E-Mboppi — Le marché Mboppi, en ligne",
    template: "%s — E-Mboppi",
  },
  description:
    "E-Mboppi, la plateforme créée par Kmer Vision qui rapproche les vendeurs du marché Mboppi de leurs clients, partout au Cameroun.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "E-Mboppi",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "E-Mboppi",
    title: "E-Mboppi — Le marché Mboppi, en ligne",
    description:
      "La plateforme créée par Kmer Vision qui rapproche les vendeurs du marché Mboppi de leurs clients, partout au Cameroun.",
    images: [{ url: "/logo-e-mboppi.png", width: 1254, height: 1254, alt: "E-Mboppi" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "E-Mboppi — Le marché Mboppi, en ligne",
    images: ["/logo-e-mboppi.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FAFAF8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${fraunces.variable} ${manrope.variable} ${mono.variable} font-body bg-stone-50 text-indigo-950`}>
        <Navigation />
        <MainWrapper>{children}</MainWrapper>
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
