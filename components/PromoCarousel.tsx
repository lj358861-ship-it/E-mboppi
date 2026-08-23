"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Slide = {
  image: string;
  eyebrow: string;
  titre: string;
  texte: string;
  cta: { label: string; href: string };
};

const slides: Slide[] = [
  {
    image: "/promo/slide-boutique.jpg",
    eyebrow: "Kmer Vision présente",
    titre: "Le marché, chez vous.",
    texte: "Visitez et commandez sans bouger — le marché Mboppi à portée de main.",
    cta: { label: "Découvrir les stands", href: "#produits" },
  },
  {
    image: "/promo/slide-cuisinieres.jpg",
    eyebrow: "Tous les articles du marché",
    titre: "Électroménager, mode, déco...",
    texte: "Des centaines d'articles, choisis directement chez le vendeur du marché.",
    cta: { label: "Explorer le catalogue", href: "#produits" },
  },
  {
    image: "/promo/slide-electromenager-couple.jpg",
    eyebrow: "Vidéos courtes",
    titre: "Voyez chaque article en vrai.",
    texte: "Des vidéos comme si vous étiez devant l'étal, avant même de contacter le vendeur.",
    cta: { label: "Voir les vidéos", href: "/videos" },
  },
  {
    image: "/promo/slide-decoration.jpg",
    eyebrow: "Vendeurs du marché",
    titre: "Ouvrez votre stand en ligne.",
    texte: "Seulement 2000F par mois pour être visible par tous les clients, partout au Cameroun.",
    cta: { label: "Devenir vendeur", href: "/a-propos#devenir-vendeur" },
  },
];

const DUREE_MS = 5500;

export default function PromoCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const minuteur = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, DUREE_MS);
    return () => clearInterval(minuteur);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-tr-3xl rounded-bl-3xl bg-indigo-950 min-h-[300px] md:min-h-[380px]">
      {/* Photos en fond, en fondu-enchaîné */}
      {slides.map((slide, i) => (
        <div
          key={slide.image}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.image}
            alt=""
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ))}

      {/* Voile violet néon + dégradé pour la lisibilité du texte */}
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-indigo-950/70 to-indigo-950/30" />
      <div className="absolute inset-0 bg-neon-700/25 mix-blend-multiply" />

      {/* Halos décoratifs */}
      <div className="neon-blob w-64 h-64 bg-neonpink-500 -top-10 -right-10 animate-float-slow" />
      <div
        className="neon-blob w-72 h-72 bg-neon-500 -bottom-16 -left-10 animate-float-slow"
        style={{ animationDelay: "1.5s" }}
      />

      <div className="relative px-6 py-10 md:px-14 md:py-16 min-h-[300px] md:min-h-[380px] flex flex-col justify-center">
        {slides.map((slide, i) => {
          const actif = i === index;
          return (
            <div
              key={slide.titre}
              className={`transition-opacity duration-700 ${
                actif ? "opacity-100 relative" : "opacity-0 absolute inset-0 px-6 md:px-14 pointer-events-none"
              }`}
            >
              {actif && (
                <>
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1 rounded-full mb-4 animate-fade-in-up">
                    <span className="w-1.5 h-1.5 rounded-full bg-neonpink-500 neon-dot" />
                    <span className="font-mono text-neon-300 text-xs tracking-widest uppercase">
                      {slide.eyebrow}
                    </span>
                  </div>
                  <h1
                    className="font-display text-3xl md:text-5xl font-semibold text-white max-w-xl leading-tight neon-text animate-fade-in-up"
                    style={{ animationDelay: "0.08s" }}
                  >
                    {slide.titre}
                  </h1>
                  <p
                    className="mt-3 text-stone-200 max-w-md text-sm md:text-base animate-fade-in-up"
                    style={{ animationDelay: "0.16s" }}
                  >
                    {slide.texte}
                  </p>
                  <Link
                    href={slide.cta.href}
                    className="btn-neon mt-6 px-5 py-3 text-sm font-medium w-fit animate-fade-in-up"
                    style={{ animationDelay: "0.24s" }}
                  >
                    {slide.cta.label}
                  </Link>
                </>
              )}
            </div>
          );
        })}

        {/* Indicateurs */}
        <div className="relative flex gap-2 mt-8">
          {slides.map((s, i) => (
            <button
              key={s.titre}
              onClick={() => setIndex(i)}
              aria-label={`Aller au slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-8 bg-neon-400 neon-dot" : "w-3 bg-white/25"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
