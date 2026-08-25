"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle } from "lucide-react";
import { lienContacterVendeur } from "@/lib/whatsapp";
import { classesBadgeStock, labelStatutStock, StatutStock, CLASSES_BADGE_PROMO, LABEL_BADGE_PROMO } from "@/lib/stock";

type Props = {
  id: string;
  titre: string;
  prix: number;
  videoUrl?: string | null;
  imageUrl?: string | null;
  vendeurId: string;
  nomBoutique: string;
  whatsappVendeur: string;
  estFavori?: boolean;
  statutStock?: StatutStock;
  enPromo?: boolean;
};

export default function CarteProduitVideo({
  id,
  titre,
  prix,
  videoUrl,
  imageUrl,
  vendeurId,
  nomBoutique,
  whatsappVendeur,
  estFavori = false,
  statutStock = "DISPONIBLE",
  enPromo = false,
}: Props) {
  const [favori, setFavori] = useState(estFavori);
  const router = useRouter();

  async function basculerFavori(e: React.MouseEvent) {
    e.stopPropagation();
    setFavori((f) => !f);
    await fetch("/api/favoris", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produitId: id }),
    });
  }

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/produit/${id}`)}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/produit/${id}`)}
      className="group relative flex-shrink-0 w-[220px] md:w-[260px] rounded-2xl overflow-hidden bg-indigo-950 aspect-[9/16] snap-start cursor-pointer"
    >
      {videoUrl ? (
        <video
          src={videoUrl}
          muted
          loop
          playsInline
          autoPlay
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={titre} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-indigo-900" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      {(statutStock !== "DISPONIBLE" || enPromo) && (
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
          {enPromo && (
            <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${CLASSES_BADGE_PROMO}`}>
              {LABEL_BADGE_PROMO}
            </span>
          )}
          {statutStock !== "DISPONIBLE" && (
            <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${classesBadgeStock(statutStock)}`}>
              {labelStatutStock(statutStock)}
            </span>
          )}
        </div>
      )}

      <button
        onClick={basculerFavori}
        className="absolute top-3 right-3 z-10 bg-black/40 backdrop-blur rounded-full p-2"
        aria-label="Ajouter aux favoris"
      >
        <Heart size={18} className={favori ? "fill-piment-500 text-piment-500" : "text-white"} />
      </button>

      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
        <Link
          href={`/vendeur/${vendeurId}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs opacity-80 mb-0.5 inline-block hover:underline hover:opacity-100"
        >
          {nomBoutique}
        </Link>
        <p className="font-medium text-sm leading-snug line-clamp-2 mb-1">{titre}</p>
        <div className="flex items-center justify-between">
          <span className="font-mono text-mango-400 font-semibold text-sm">
            {prix.toLocaleString("fr-FR")} F
          </span>
          <a
            href={lienContacterVendeur(whatsappVendeur, titre)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 bg-feuille-500 hover:bg-feuille-600 transition-colors px-2.5 py-1.5 rounded-full text-xs font-medium"
          >
            <MessageCircle size={13} /> Contacter
          </a>
        </div>
      </div>
    </div>
  );
}
