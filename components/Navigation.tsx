"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, Info, Store } from "lucide-react";

const liens = [
  { href: "/", label: "Accueil", icone: Home },
  { href: "/recherche", label: "Recherche", icone: Search },
  { href: "/favoris", label: "Favoris", icone: Heart },
  { href: "/a-propos", label: "À propos", icone: Info },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop */}
      <header className="hidden md:flex sticky top-0 z-40 items-center justify-between px-8 py-4 bg-stone-50/90 backdrop-blur border-b border-stone-200">
        <Link href="/" className="font-display text-2xl font-semibold text-indigo-900">
          E-<span className="text-piment-500">Mboppi</span>
        </Link>
        <nav className="flex items-center gap-8 font-medium text-sm">
          {liens.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`transition-colors ${
                pathname === l.href ? "text-piment-500" : "text-indigo-900/70 hover:text-indigo-900"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/a-propos#devenir-vendeur"
          className="flex items-center gap-2 bg-indigo-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-800 transition-colors"
        >
          <Store size={16} /> Devenir vendeur
        </Link>
      </header>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-center py-3 bg-stone-50/90 backdrop-blur border-b border-stone-200">
        <Link href="/" className="font-display text-xl font-semibold text-indigo-900">
          E-<span className="text-piment-500">Mboppi</span>
        </Link>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-white border-t border-stone-200 py-2">
        {liens.map((l) => {
          const Icone = l.icone;
          const actif = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs ${
                actif ? "text-piment-500" : "text-indigo-900/60"
              }`}
            >
              <Icone size={20} />
              {l.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
