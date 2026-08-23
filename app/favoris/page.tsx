"use client";

import { useEffect, useState } from "react";
import CarteProduitVideo from "@/components/CarteProduitVideo";
import { Heart } from "lucide-react";

type Favori = {
  produit: {
    id: string;
    titre: string;
    prix: number;
    videoUrl: string | null;
    imageUrl: string | null;
    vendeur: { nomBoutique: string; utilisateur?: { whatsapp: string }; };
  };
};

export default function Favoris() {
  const [favoris, setFavoris] = useState<Favori[] | null>(null);

  useEffect(() => {
    fetch("/api/favoris")
      .then((r) => (r.ok ? r.json() : { favoris: [] }))
      .then((d) => setFavoris(d.favoris || []));
  }, []);

  return (
    <div className="px-4 md:px-8 py-6">
      <h1 className="font-display text-2xl font-semibold text-indigo-900 mb-4 flex items-center gap-2">
        <Heart className="text-piment-500" size={22} /> Mes favoris
      </h1>

      {favoris === null && <p className="text-sm text-indigo-900/50">Chargement…</p>}

      {favoris?.length === 0 && (
        <p className="text-sm text-indigo-900/50">
          Connectez-vous et ajoutez des articles à vos favoris pour les retrouver ici.
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {favoris?.map(({ produit }) => (
          <CarteProduitVideo
            key={produit.id}
            id={produit.id}
            titre={produit.titre}
            prix={produit.prix}
            videoUrl={produit.videoUrl}
            imageUrl={produit.imageUrl}
            nomBoutique={produit.vendeur.nomBoutique}
            whatsappVendeur={produit.vendeur.utilisateur?.whatsapp || ""}
            estFavori
          />
        ))}
      </div>
    </div>
  );
}
