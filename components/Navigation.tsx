"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Clapperboard, Mail, Info, Store, Heart, LogIn } from "lucide-react";

const liensBas = [
  { href: "/", label: "Accueil", icone: Home },
  { href: "/videos", label: "Vidéos", icone: Clapperboard },
  { href: "/recherche", label: "Recherche", icone: Search },
  { href: "/contact", label: "Contact", icone: Mail },
  { href: "/a-propos", label: "À propos", icone: Info },
];

const liensDesktop = [
  { href: "/", label: "Accueil" },
  { href: "/videos", label: "Vidéos courtes" },
  { href: "/recherche", label: "Recherche" },
  { href: "/favoris", label: "Favoris" },
  { href: "/contact", label: "Contact" },
  { href: "/a-propos", label: "À propos" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop */}
      <header className="hidden md:flex sticky top-0 z-40 items-center justify-between px-8 py-4 bg-stone-50/90 backdrop-blur border-b border-stone-200">
        <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-indigo-950 logo-glow-soft">
          <span className="italic">E</span>
          <span className="text-neon-500">-</span>
          <span className="logo-gradient">Mboppi</span>
        </Link>
        <nav className="flex items-center gap-7 font-medium text-sm">
          {liensDesktop.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`transition-colors ${
                pathname === l.href ? "text-neon-600" : "text-indigo-900/70 hover:text-indigo-900"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/vendeur/connexion"
            className={`text-sm font-medium transition-colors ${
              pathname === "/vendeur/connexion" ? "text-neon-600" : "text-indigo-900/70 hover:text-indigo-900"
            }`}
          >
            Connexion
          </Link>
          <Link href="/a-propos#devenir-vendeur" className="btn-neon px-4 py-2 text-sm font-medium">
            <Store size={16} /> Devenir vendeur
          </Link>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-indigo-950/95 backdrop-blur border-b border-white/5">
        <Link href="/vendeur/connexion" aria-label="Connexion" className="text-white/80">
          <LogIn size={20} className={pathname === "/vendeur/connexion" ? "text-neon-400" : ""} />
        </Link>
        <Link href="/" className="font-display text-xl font-semibold tracking-tight text-white logo-glow-pulse">
          <span className="italic">E</span>
          <span className="text-neon-400">-</span>
          <span className="logo-gradient">Mboppi</span>
        </Link>
        <Link href="/favoris" aria-label="Favoris" className="text-white/80">
          <Heart size={20} className={pathname === "/favoris" ? "fill-piment-500 text-piment-500" : ""} />
        </Link>
      </header>

      {/* Mobile bottom nav — façon TikTok */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-indigo-950/95 backdrop-blur border-t border-white/5 py-2">
        {liensBas.map((l) => {
          const Icone = l.icone;
          const actif = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1 text-[10px] transition-colors ${
                actif ? "text-neon-400" : "text-white/55"
              }`}
            >
              <span className={actif ? "neon-text" : ""}>
                <Icone size={21} />
              </span>
              {l.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
