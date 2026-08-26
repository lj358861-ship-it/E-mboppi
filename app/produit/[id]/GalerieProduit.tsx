"use client";

import { useRef, useState } from "react";
import { Clapperboard, ChevronLeft, ChevronRight } from "lucide-react";

type Media = { type: "video" | "photo"; url: string };

export default function GalerieProduit({
  videoUrl,
  photos,
  titre,
}: {
  videoUrl: string | null;
  photos: string[];
  titre: string;
}) {
  const medias: Media[] = [
    ...(videoUrl ? [{ type: "video" as const, url: videoUrl }] : []),
    ...photos.map((url) => ({ type: "photo" as const, url })),
  ];
  const [indexActif, setIndexActif] = useState(0);
  const [glissementPx, setGlissementPx] = useState(0);
  const [enGlissement, setEnGlissement] = useState(false);
  const departXRef = useRef(0);
  const conteneurRef = useRef<HTMLDivElement>(null);

  const dernierIndex = medias.length - 1;

  function allerA(i: number) {
    setIndexActif(Math.max(0, Math.min(dernierIndex, i)));
  }

  function debutGlissement(e: React.TouchEvent) {
    departXRef.current = e.touches[0].clientX;
    setEnGlissement(true);
  }

  function pendantGlissement(e: React.TouchEvent) {
    setGlissementPx(e.touches[0].clientX - departXRef.current);
  }

  function finGlissement() {
    const largeur = conteneurRef.current?.offsetWidth ?? 300;
    const seuil = Math.max(50, largeur * 0.15);
    if (glissementPx < -seuil && indexActif < dernierIndex) {
      allerA(indexActif + 1);
    } else if (glissementPx > seuil && indexActif > 0) {
      allerA(indexActif - 1);
    }
    setGlissementPx(0);
    setEnGlissement(false);
  }

  if (medias.length === 0) {
    return <div className="rounded-2xl bg-stone-100 aspect-[4/5] max-h-[560px] mx-auto w-full" />;
  }

  return (
    <div>
      <div
        ref={conteneurRef}
        className="relative rounded-2xl overflow-hidden bg-stone-100 aspect-[4/5] max-h-[560px] mx-auto w-full group"
        onTouchStart={debutGlissement}
        onTouchMove={pendantGlissement}
        onTouchEnd={finGlissement}
      >
        {/* Piste défilante : toutes les photos/vidéos côte à côte, on décale
            la piste pour afficher celle en cours — le glissement du doigt
            met à jour ce décalage en direct. */}
        <div
          className={`flex h-full ${enGlissement ? "" : "transition-transform duration-300 ease-out"}`}
          style={{ transform: `translateX(calc(-${indexActif * 100}% + ${glissementPx}px))` }}
        >
          {medias.map((m, i) => (
            <div key={m.url + i} className="w-full h-full flex-shrink-0">
              {m.type === "video" ? (
                <video
                  src={m.url}
                  controls
                  autoPlay={i === indexActif}
                  muted
                  loop
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt={titre} className="w-full h-full object-contain" draggable={false} />
              )}
            </div>
          ))}
        </div>

        {medias.length > 1 && (
          <>
            {/* Flèches — visibles au survol sur desktop, masquées sur mobile (le swipe suffit) */}
            {indexActif > 0 && (
              <button
                type="button"
                onClick={() => allerA(indexActif - 1)}
                aria-label="Photo précédente"
                className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            {indexActif < dernierIndex && (
              <button
                type="button"
                onClick={() => allerA(indexActif + 1)}
                aria-label="Photo suivante"
                className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={20} />
              </button>
            )}

            {/* Points de pagination */}
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
              {medias.map((_, i) => (
                <button
                  key={i}
                  onClick={() => allerA(i)}
                  aria-label={`Aller à l'élément ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === indexActif ? "w-5 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {medias.length > 1 && (
        <div className="hidden md:flex gap-2 mt-3 justify-center flex-wrap">
          {medias.map((m, i) => (
            <button
              key={m.url + i}
              onClick={() => allerA(i)}
              className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                i === indexActif ? "border-indigo-800" : "border-transparent opacity-70"
              }`}
              aria-label={`Voir ${m.type === "video" ? "la vidéo" : `la photo ${i + 1}`}`}
            >
              {m.type === "video" ? (
                <>
                  <video src={m.url} muted className="w-full h-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Clapperboard size={16} className="text-white" />
                  </span>
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt="" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
