"use client";

import { useState } from "react";
import { Clapperboard } from "lucide-react";

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
  const actif = medias[indexActif];

  if (!actif) {
    return <div className="rounded-2xl bg-indigo-950 aspect-[9/16] max-h-[560px] mx-auto w-full" />;
  }

  return (
    <div>
      <div className="rounded-2xl overflow-hidden bg-indigo-950 aspect-[9/16] max-h-[560px] mx-auto w-full relative">
        {actif.type === "video" ? (
          <video src={actif.url} controls autoPlay muted loop className="w-full h-full object-cover" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={actif.url} alt={titre} className="w-full h-full object-cover" />
        )}
      </div>

      {medias.length > 1 && (
        <div className="flex gap-2 mt-3 justify-center flex-wrap">
          {medias.map((m, i) => (
            <button
              key={m.url + i}
              onClick={() => setIndexActif(i)}
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
