"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Flame, MapPin, Percent } from "lucide-react";
import { lienContacterVendeur } from "@/lib/whatsapp";
import { classesBadgeStock, labelStatutStock, StatutStock, CLASSES_BADGE_PROMO, LABEL_BADGE_PROMO } from "@/lib/stock";
import BadgeVendeurVerifie from "@/components/BadgeVendeurVerifie";

type Props = {
  id: string;
  titre: string;
  prix: number;
  videoUrl?: string | null;
  imageUrl?: string | null;
  vendeurId: string;
  nomBoutique: string;
  villeVendeur?: string | null;
  whatsappVendeur: string;
  /** Vendeur certifié ou abonnement actif depuis plus de 2 mois — voir lib/abonnement.ts */
  verifie?: boolean;
  estFavori?: boolean;
  statutStock?: StatutStock;
  /** "Hot Sales" — mise en avant payante, décidée uniquement par l'admin (champ `boost`) */
  hotSales?: boolean;
  /** "Promo" — le vendeur marque lui-même son article en promotion (champ `enPromo`) */
  enPromotion?: boolean;
  /** Habillage "carte qui brûle" — réservé aux sections Hot Sales */
  enFeu?: boolean;
};

export default function CarteProduitVideo({
  id,
  titre,
  prix,
  videoUrl,
  imageUrl,
  vendeurId,
  nomBoutique,
  villeVendeur,
  whatsappVendeur,
  verifie = false,
  estFavori = false,
  statutStock = "DISPONIBLE",
  hotSales = false,
  enPromotion = false,
  enFeu = false,
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
      className="group relative w-full rounded-2xl overflow-hidden bg-indigo-950 aspect-[9/16] snap-start cursor-pointer"
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
        <Image
          src={imageUrl}
          alt={titre}
          fill
          sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, 50vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-indigo-900" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      {enFeu && (
        <div
          className="absolute top-2.5 left-2.5 z-20 flex items-center justify-center w-8 h-8 rounded-full border border-mango-400/80 animate-flame-glow"
          style={{ background: "linear-gradient(145deg, #2a2a2a, #050505)" }}
          aria-hidden="true"
        >
          <Flame size={14} className="text-mango-400 fill-mango-400/90" />
        </div>
      )}

      {(statutStock !== "DISPONIBLE" || hotSales || enPromotion) && (
        <div className={`absolute left-2.5 z-10 flex flex-col gap-1 items-start ${enFeu ? "top-12" : "top-3"}`}>
          {hotSales && (
            <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-bold ${CLASSES_BADGE_PROMO}`}>
              <Flame size={11} /> {LABEL_BADGE_PROMO}
            </span>
          )}
          {enPromotion && (
            <span className="price-tag tag-hole flex items-center gap-1 bg-feuille-500 text-white text-[10px] font-bold pl-2 pr-3 py-1 shadow-sm">
              <Percent size={10} /> Promo
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

      <div className="absolute bottom-0 left-0 right-0 p-3 text-white z-10">
        <Link
          href={`/vendeur/${vendeurId}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-xs opacity-80 mb-0.5 hover:underline hover:opacity-100 w-fit"
        >
          {nomBoutique}
          {verifie && <BadgeVendeurVerifie taille={11} />}
          {villeVendeur && (
            <span className="flex items-center gap-0.5 opacity-70 font-normal">
              <MapPin size={10} /> {villeVendeur}
            </span>
          )}
        </Link>
        <p className="font-medium text-sm leading-snug line-clamp-2 mb-1">{titre}</p>
        <div className="flex items-center justify-between">
          <span className="font-display font-bold text-base leading-none tracking-tight text-mango-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]">
            {prix.toLocaleString("fr-FR")}
            <span className="text-[11px] font-semibold ml-1 text-mango-300/90">FCFA</span>
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
