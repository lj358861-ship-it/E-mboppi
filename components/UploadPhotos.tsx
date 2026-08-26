"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { PHOTOS_MAX_PAR_ARTICLE as MAX_PHOTOS } from "@/lib/media-limits";

export type PhotoUploadee = { url: string; publicId: string };

export default function UploadPhotos({
  valeur,
  onChange,
}: {
  valeur: PhotoUploadee[];
  onChange: (photos: PhotoUploadee[]) => void;
}) {
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function ajouterFichiers(fichiers: FileList | null) {
    if (!fichiers || fichiers.length === 0) return;
    setErreur(null);

    const placesRestantes = MAX_PHOTOS - valeur.length;
    if (placesRestantes <= 0) {
      setErreur(`Vous avez déjà ${MAX_PHOTOS} photos, le maximum autorisé par article.`);
      return;
    }

    const aEnvoyer = Array.from(fichiers).slice(0, placesRestantes);
    setEnvoi(true);

    try {
      const nouvellesPhotos: PhotoUploadee[] = [];
      for (const fichier of aEnvoyer) {
        const donnees = new FormData();
        donnees.append("fichier", fichier);
        donnees.append("type", "photo");
        const res = await fetch("/api/upload", { method: "POST", body: donnees });
        const resultat = await res.json();
        if (!res.ok) throw new Error(resultat.erreur || "Échec de l'envoi d'une photo");
        nouvellesPhotos.push({ url: resultat.url, publicId: resultat.publicId });
      }
      onChange([...valeur, ...nouvellesPhotos]);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Échec de l'envoi des photos");
    } finally {
      setEnvoi(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function retirer(index: number) {
    onChange(valeur.filter((_, i) => i !== index));
  }

  return (
    <div>
      <p className="text-xs font-medium text-indigo-900/70 mb-2">
        Photos de l&apos;article ({valeur.length}/{MAX_PHOTOS})
      </p>
      <div className="grid grid-cols-5 gap-2 mb-2">
        {valeur.map((photo, i) => (
          <div key={photo.publicId} className="relative aspect-square rounded-xl overflow-hidden bg-stone-100">
            <Image src={photo.url} alt={`Photo ${i + 1}`} fill sizes="80px" className="object-cover" />
            <button
              type="button"
              onClick={() => retirer(i)}
              className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white"
              aria-label="Retirer cette photo"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {valeur.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={envoi}
            className="aspect-square rounded-xl border-2 border-dashed border-stone-300 flex items-center justify-center text-indigo-900/40 hover:border-indigo-800 hover:text-indigo-800 transition-colors disabled:opacity-60"
          >
            {envoi ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => ajouterFichiers(e.target.files)}
      />
      {erreur && <p className="text-xs text-piment-500">{erreur}</p>}
      <p className="text-[11px] text-indigo-900/40">1 à {MAX_PHOTOS} photos, 10 Mo max chacune.</p>
    </div>
  );
}
