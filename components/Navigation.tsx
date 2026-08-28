"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Clapperboard, Mail, Info, Store, Heart, LogIn, User } from "lucide-react";

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
  { href: "/boutiques", label: "Boutiques" },
  { href: "/favoris", label: "Favoris" },
  { href: "/contact", label: "Contact" },
  { href: "/a-propos", label: "À propos" },
];

type Session = { connecte: boolean; role?: "CLIENT" | "VENDEUR" | "ADMIN"; nom?: string };

export default function Navigation() {
  const pathname = usePathname();
  // Session vendeur/admin — lue côté client pour adapter le menu (afficher
  // "Mon profil" plutôt que "Connexion") sans jamais déconnecter qui que ce
  // soit : la session reste vivante tant que le middleware la rafraîchit
  // (voir middleware.ts). null = pas encore vérifié.
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then(setSession)
      .catch(() => setSession({ connecte: false }));
  }, []);

  const estVendeurConnecte = session?.connecte && (session.role === "VENDEUR" || session.role === "ADMIN");
  const hrefProfilVendeur = session?.role === "ADMIN" ? "/admin" : "/vendeur/profil";
  const hrefProfil = estVendeurConnecte ? hrefProfilVendeur : "/mon-profil";

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
          <Link
            href={hrefProfil}
            className={`transition-colors ${
              pathname === hrefProfil ? "text-neon-600" : "text-indigo-900/70 hover:text-indigo-900"
            }`}
          >
            Mon profil
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {estVendeurConnecte ? (
            <Link
              href={hrefProfilVendeur}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                pathname === hrefProfilVendeur ? "text-neon-600" : "text-indigo-900/70 hover:text-indigo-900"
              }`}
            >
              <Store size={16} /> {session?.nom ? `Bonjour, ${session.nom}` : "Ma boutique"}
            </Link>
          ) : (
            <>
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
            </>
          )}
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-indigo-950/95 backdrop-blur border-b border-white/5">
        <Link
          href={estVendeurConnecte ? hrefProfilVendeur : "/vendeur/connexion"}
          aria-label={estVendeurConnecte ? "Ma boutique" : "Connexion"}
          className="text-white/80"
        >
          {estVendeurConnecte ? (
            <Store size={20} className={pathname === hrefProfilVendeur ? "text-neon-400" : ""} />
          ) : (
            <LogIn size={20} className={pathname === "/vendeur/connexion" ? "text-neon-400" : ""} />
          )}
        </Link>
        <Link href="/" className="font-display text-xl font-semibold tracking-tight text-white logo-glow-pulse">
          <span className="italic">E</span>
          <span className="text-neon-400">-</span>
          <span className="logo-gradient">Mboppi</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/favoris" aria-label="Favoris" className="text-white/80">
            <Heart size={20} className={pathname === "/favoris" ? "fill-piment-500 text-piment-500" : ""} />
          </Link>
          {!estVendeurConnecte && (
            <Link href="/mon-profil" aria-label="Mon profil" className="text-white/80">
              <User size={20} className={pathname === "/mon-profil" ? "text-neon-400" : ""} />
            </Link>
          )}
        </div>
      </header>

      {/* Mobile bottom nav — façon TikTok */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around min-h-16 bg-indigo-950/95 backdrop-blur border-t border-white/5"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {liensBas.map((l) => {
          const Icone = l.icone;
          const actif = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-col items-center gap-0.5 py-1.5 min-w-[56px] text-[10px] font-medium transition-colors ${
                actif ? "text-neon-400" : "text-white/55"
              }`}
            >
              <span
                className={`flex items-center justify-center w-9 h-7 rounded-full transition-colors ${
                  actif ? "bg-neon-500/15 neon-text" : ""
                }`}
              >
                <Icone size={20} />
              </span>
              {l.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
