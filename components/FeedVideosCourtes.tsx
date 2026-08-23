"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Volume2, VolumeX, Store } from "lucide-react";
import { lienContacterVendeur } from "@/lib/whatsapp";

type Produit = {
  id: string;
  titre: string;
  prix: number;
  videoUrl: string | null;
  vendeur: { id: string; nomBoutique: string; utilisateur: { whatsapp: string } };
};

export default function FeedVideosCourtes({ produits }: { produits: Produit[] }) {
  const [coupe, setCoupe] = useState(true);
  const conteneurRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

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
  }, [produits]);

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
    <div
      ref={conteneurRef}
      className="snap-y snap-mandatory overflow-y-auto scrollbar-none bg-black"
      style={{ height: "calc(100dvh - 112px)" }}
    >
      {produits.map((p) => (
        <div
          key={p.id}
          className="relative snap-start w-full flex items-center justify-center bg-indigo-950"
          style={{ height: "calc(100dvh - 112px)" }}
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

          {/* Pastille néon "vidéo courte" */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/40 backdrop-blur px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-neonpink-500 neon-dot" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/90">
              vidéo courte
            </span>
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
              <span className="font-mono text-mango-400 font-semibold text-sm">
                {p.prix.toLocaleString("fr-FR")} F
              </span>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function BoutonsAction({ produit }: { produit: Produit }) {
  const [favori, setFavori] = useState(false);

  async function basculerFavori() {
    setFavori((f) => !f);
    await fetch("/api/favoris", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produitId: produit.id }),
    });
  }

  return (
    <div className="absolute bottom-6 right-3 flex flex-col items-center gap-5">
      <button onClick={basculerFavori} className="flex flex-col items-center gap-1 text-white">
        <span className="bg-black/35 backdrop-blur rounded-full p-2.5">
          <Heart size={22} className={favori ? "fill-piment-500 text-piment-500" : "text-white"} />
        </span>
        <span className="text-[10px]">J&apos;aime</span>
      </button>
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
