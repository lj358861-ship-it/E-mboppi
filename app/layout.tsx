import type { Metadata } from "next";
import { Fraunces, Manrope, IBM_Plex_Mono } from "next/font/google";
import Navigation from "@/components/Navigation";
import MainWrapper from "@/components/MainWrapper";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
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
  title: "E-Mboppi — Le marché Mboppi, en ligne",
  description:
    "E-Mboppi, la plateforme créée par Kmer Vision qui rapproche les vendeurs du marché Mboppi de leurs clients, partout au Cameroun.",
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
      </body>
    </html>
  );
}
