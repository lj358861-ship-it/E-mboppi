"use client";

import { useRef, useState } from "react";
import { Video, X, Loader2 } from "lucide-react";
import { VIDEO_DUREE_MAX_SECONDES, VIDEO_TAILLE_MAX_OCTETS } from "@/lib/media-limits";

const TAILLE_MAX_MO = Math.round(VIDEO_TAILLE_MAX_OCTETS / (1024 * 1024));

export type VideoUploadee = { url: string; publicId: string } | null;

function lireDureeVideo(fichier: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => reject(new Error("Vidéo illisible"));
    video.src = URL.createObjectURL(fichier);
  });
}

export default function UploadVideo({
  valeur,
  onChange,
}: {
  valeur: VideoUploadee;
  onChange: (video: VideoUploadee) => void;
}) {
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function choisirFichier(fichiers: FileList | null) {
    const fichier = fichiers?.[0];
    if (!fichier) return;
    setErreur(null);

    if (fichier.size > VIDEO_TAILLE_MAX_OCTETS) {
      setErreur(`Cette vidéo pèse ${(fichier.size / (1024 * 1024)).toFixed(1)} Mo. Le maximum autorisé est ${TAILLE_MAX_MO} Mo.`);
      return;
    }

    try {
      const duree = await lireDureeVideo(fichier);
      if (duree > VIDEO_DUREE_MAX_SECONDES) {
        setErreur(
          `Cette vidéo dure ${Math.round(duree)}s. Les vidéos courtes (reels) sont limitées à ${VIDEO_DUREE_MAX_SECONDES}s.`
        );
        return;
      }
    } catch {
      // Si la durée n'a pas pu être lue, on laisse Cloudinary gérer côté serveur
    }

    setEnvoi(true);
    try {
      const donnees = new FormData();
      donnees.append("fichier", fichier);
      donnees.append("type", "video");
      const res = await fetch("/api/upload", { method: "POST", body: donnees });
      const resultat = await res.json();
      if (!res.ok) throw new Error(resultat.erreur || "Échec de l'envoi de la vidéo");
      onChange({ url: resultat.url, publicId: resultat.publicId });
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Échec de l'envoi de la vidéo");
    } finally {
      setEnvoi(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <p className="text-xs font-medium text-indigo-900/70 mb-2">Vidéo courte (reel) — optionnelle</p>

      {valeur ? (
        <div className="relative w-28 aspect-[9/16] rounded-xl overflow-hidden bg-indigo-950">
          <video src={valeur.url} muted loop autoPlay playsInline className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white"
            aria-label="Retirer la vidéo"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={envoi}
          className="w-28 aspect-[9/16] rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center gap-1 text-indigo-900/40 hover:border-indigo-800 hover:text-indigo-800 transition-colors disabled:opacity-60"
        >
          {envoi ? <Loader2 size={18} className="animate-spin" /> : <Video size={18} />}
          <span className="text-[10px]">Ajouter</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => choisirFichier(e.target.files)}
      />
      {erreur && <p className="text-xs text-piment-500 mt-1">{erreur}</p>}
      <p className="text-[11px] text-indigo-900/40 mt-1">
        Format court style réseaux sociaux, {VIDEO_DUREE_MAX_SECONDES}s max, {TAILLE_MAX_MO} Mo max.
      </p>
    </div>
  );
}
