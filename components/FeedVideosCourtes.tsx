"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Volume2, VolumeX, Store, Percent, Star } from "lucide-react";
import { lienContacterVendeur } from "@/lib/whatsapp";
import { classesBadgeStock, labelStatutStock, StatutStock, CLASSES_BADGE_PROMO, LABEL_BADGE_PROMO } from "@/lib/stock";
import { CATEGORIES } from "@/lib/categories";

type Produit = {
  id: string;
  titre: string;
  prix: number;
  description: string | null;
  videoUrl: string | null;
  statutStock: StatutStock;
  boost: boolean;
  enPromo: boolean;
  categorie: string | null;
  noteMoyenne: number;
  nbAvis: number;
  vendeur: { id: string; nomBoutique: string; utilisateur: { whatsapp: string } };
};

type Filtre = "tous" | "promo" | "hot" | string;

export default function FeedVideosCourtes({ produits }: { produits: Produit[] }) {
  const [coupe, setCoupe] = useState(true);
  const [filtre, setFiltre] = useState<Filtre>("tous");
  const conteneurRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const produitsFiltres = useMemo(() => {
    if (filtre === "tous") return produits;
    if (filtre === "promo") return produits.filter((p) => p.enPromo);
    if (filtre === "hot") return produits.filter((p) => p.boost);
    return produits.filter((p) => p.categorie === filtre);
  }, [produits, filtre]);

  useEffect(() => {
    const observateur = new IntersectionObserver(
      (entrees) => {
        entrees.forEach((entree) => {
          const video = entree.target as HTMLVideoElement;
          if (entree.isIntersecting && entree.intersectionRatio > 0.6) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: [0, 0.6, 1] }
    );

    videoRefs.current.forEach((video) => observateur.observe(video));
    return () => observateur.disconnect();
  }, [produitsFiltres]);

  if (produits.length === 0) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center px-6 text-center bg-indigo-950 text-white">
        <p className="font-display text-xl mb-2">Aucune vidéo pour le moment.</p>
        <p className="text-sm text-stone-300">
          Les vendeurs du marché arrivent avec leurs vidéos très bientôt.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Barre de filtre — Tous / Promo / Hot Sales / catégorie, superposée
          en haut du fil, ne bloque pas le défilement vertical des vidéos */}
      <div className="absolute top-3 left-0 right-0 z-30 flex gap-1.5 overflow-x-auto scrollbar-none px-3">
        {(
          [
            { valeur: "tous", label: "Tous" },
            { valeur: "promo", label: "Promo" },
            { valeur: "hot", label: "Hot Sales" },
            ...CATEGORIES.map((c) => ({ valeur: c, label: c })),
          ] as { valeur: Filtre; label: string }[]
        ).map((f) => (
          <button
            key={f.valeur}
            onClick={() => setFiltre(f.valeur)}
            className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur transition-colors ${
              filtre === f.valeur ? "bg-white text-indigo-950" : "bg-black/40 text-white/85"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {produitsFiltres.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center px-6 text-center bg-indigo-950 text-white gap-2"
          style={{ height: "calc(100dvh - var(--mobile-header-h) - var(--mobile-navbar-h) - env(safe-area-inset-bottom))" }}
        >
          <p className="font-display text-lg">Aucune vidéo dans ce filtre.</p>
          <button onClick={() => setFiltre("tous")} className="text-sm text-neon-400 underline">
            Voir toutes les vidéos
          </button>
        </div>
      ) : (
        <div
          ref={conteneurRef}
          className="snap-y snap-mandatory overflow-y-auto scrollbar-none bg-black"
          style={{ height: "calc(100dvh - var(--mobile-header-h) - var(--mobile-navbar-h) - env(safe-area-inset-bottom))" }}
        >
          {produitsFiltres.map((p) => (
            <div
              key={p.id}
              className="relative snap-start w-full flex items-center justify-center bg-indigo-950"
              style={{ height: "calc(100dvh - var(--mobile-header-h) - var(--mobile-navbar-h) - env(safe-area-inset-bottom))" }}
            >
              {p.videoUrl ? (
                <video
                  ref={(el) => {
                    if (el) videoRefs.current.set(p.id, el);
                  }}
                  src={p.videoUrl}
                  muted={coupe}
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-neon" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />

              {/* Pastille néon "vidéo courte" + Promo */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-neonpink-500 neon-dot" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/90">
                vidéo courte
              </span>
            </div>
            {p.boost && (
              <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${CLASSES_BADGE_PROMO}`}>
                {LABEL_BADGE_PROMO}
              </span>
            )}
            {p.enPromo && (
              <span className="price-tag tag-hole flex items-center gap-1 bg-feuille-500 text-white text-[10px] font-bold pl-2 pr-3 py-1 shadow-sm">
                <Percent size={10} /> Promo
              </span>
            )}
          </div>

          {/* Son on/off */}
          <button
            onClick={() => setCoupe((c) => !c)}
            className="absolute top-4 right-4 bg-black/40 backdrop-blur rounded-full p-2 text-white"
            aria-label={coupe ? "Activer le son" : "Couper le son"}
          >
            {coupe ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Colonne d'actions façon TikTok */}
          <BoutonsAction produit={p} />

          {/* Infos produit */}
          <div className="absolute bottom-6 left-4 right-20 text-white">
            <Link
              href={`/vendeur/${p.vendeur.id}`}
              className="flex items-center gap-1.5 text-xs opacity-90 mb-1 w-fit hover:underline"
            >
              <Store size={13} /> {p.vendeur.nomBoutique}
            </Link>
            <Link href={`/produit/${p.id}`}>
              <p className="font-medium text-base leading-snug line-clamp-2 mb-1.5">{p.titre}</p>
              <span className="font-display font-bold text-base leading-none tracking-tight text-mango-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]">
                {p.prix.toLocaleString("fr-FR")}
                <span className="text-[11px] font-semibold ml-1 text-mango-300/90">FCFA</span>
              </span>
              {p.nbAvis > 0 && (
                <span className="flex items-center gap-1 text-xs text-white/80 mt-1">
                  <Star size={11} className="fill-mango-400 text-mango-400" /> {p.noteMoyenne.toFixed(1)} ({p.nbAvis})
                </span>
              )}
              {p.statutStock !== "DISPONIBLE" && (
                <span
                  className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-semibold ${classesBadgeStock(p.statutStock)}`}
                >
                  {labelStatutStock(p.statutStock)}
                </span>
              )}
              {p.description && (
                <p className="text-xs text-white/70 leading-snug line-clamp-2 mt-1.5">{p.description}</p>
              )}
            </Link>
          </div>
        </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BoutonsAction({ produit }: { produit: Produit }) {
  const [favori, setFavori] = useState(false);
  const [notationOuverte, setNotationOuverte] = useState(false);
  const [noteEnvoyee, setNoteEnvoyee] = useState<number | null>(null);
  const [envoiNote, setEnvoiNote] = useState(false);

  async function basculerFavori() {
    setFavori((f) => !f);
    await fetch("/api/favoris", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produitId: produit.id }),
    });
  }

  async function noter(n: number) {
    setEnvoiNote(true);
    try {
      await fetch("/api/avis-produits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produitId: produit.id, note: n }),
      });
      setNoteEnvoyee(n);
      setNotationOuverte(false);
    } finally {
      setEnvoiNote(false);
    }
  }

  return (
    <div className="absolute bottom-6 right-3 flex flex-col items-center gap-5">
      <button onClick={basculerFavori} className="flex flex-col items-center gap-1 text-white">
        <span className="bg-black/35 backdrop-blur rounded-full p-2.5">
          <Heart size={22} className={favori ? "fill-piment-500 text-piment-500" : "text-white"} />
        </span>
        <span className="text-[10px]">J&apos;aime</span>
      </button>

      <div className="relative flex flex-col items-center">
        {notationOuverte && (
          <div className="absolute bottom-full mb-2 flex flex-col items-center gap-1 bg-black/60 backdrop-blur rounded-full py-2 px-1.5">
            {[5, 4, 3, 2, 1].map((n) => (
              <button
                key={n}
                onClick={() => noter(n)}
                disabled={envoiNote}
                aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
                className="text-white/90 hover:text-mango-400 transition-colors disabled:opacity-50"
              >
                <Star size={16} className={n <= (noteEnvoyee || 0) ? "fill-mango-400 text-mango-400" : ""} />
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setNotationOuverte((o) => !o)}
          className="flex flex-col items-center gap-1 text-white"
        >
          <span className="bg-black/35 backdrop-blur rounded-full p-2.5">
            <Star size={22} className={noteEnvoyee ? "fill-mango-400 text-mango-400" : "text-white"} />
          </span>
          <span className="text-[10px]">Noter</span>
        </button>
      </div>

      <a
        href={lienContacterVendeur(produit.vendeur.utilisateur.whatsapp, produit.titre)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-1 text-white"
      >
        <span className="bg-gradient-neon rounded-full p-2.5 animate-glow-pulse">
          <MessageCircle size={22} className="text-white" />
        </span>
        <span className="text-[10px]">Écrire</span>
      </a>
    </div>
  );
}
