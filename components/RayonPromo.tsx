"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Percent } from "lucide-react";
import CarteProduitVideo from "@/components/CarteProduitVideo";
import { CATEGORIES } from "@/lib/categories";
import { StatutStock } from "@/lib/stock";

type ProduitPromo = {
  id: string;
  titre: string;
  prix: number;
  videoUrl: string | null;
  photos: string[];
  statutStock: StatutStock;
  boost: boolean;
  enPromo: boolean;
  estFavori?: boolean;
  vendeur: { id: string; nomBoutique: string; ville: string | null; utilisateur: { whatsapp: string } };
};

/**
 * Rayon Promo — placé en bas de l'écran d'accueil, après toutes les
 * catégories. Regroupe les articles en promotion (`enPromo`, décidé par le
 * vendeur) avec son propre filtre par catégorie, indépendant des filtres de
 * la page de recherche.
 *
 * Avant : ce composant interrogeait `type=hot` (Hot Sales, décidé par
 * l'admin) au lieu de `type=promo` — la section "Rayon Promo" affichait donc
 * en réalité les articles boostés, pas les articles en promo. Corrigé.
 */
export default function RayonPromo() {
  const [categorie, setCategorie] = useState("");
  const [produits, setProduits] = useState<ProduitPromo[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    setChargement(true);
    const query = new URLSearchParams({ type: "promo" });
    if (categorie) query.set("categorie", categorie);

    fetch(`/api/produits?${query.toString()}`)
      .then((r) => (r.ok ? r.json() : { produits: [] }))
      .then((d) => setProduits(d.produits || []))
      .finally(() => setChargement(false));
  }, [categorie]);

  if (!chargement && produits.length === 0 && !categorie) return null;

  return (
    <section className="mt-10 mb-4 border-t border-stone-200 pt-6">
      <div className="flex items-center justify-between gap-3 px-4 md:px-8 mb-3 flex-wrap">
        <h2 className="font-display text-lg md:text-xl font-semibold text-indigo-900 flex items-center gap-2">
          <Percent className="text-feuille-500" size={18} /> Rayon Promo
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            className="bg-white border border-stone-200 rounded-full px-3 py-1.5 text-xs font-medium text-indigo-900/70 outline-none focus:border-indigo-800"
          >
            <option value="">Toutes les catégories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Link href="/promo" className="text-xs font-medium text-neon-600 hover:underline">
            Voir tout
          </Link>
        </div>
      </div>

      {chargement && <p className="px-4 md:px-8 text-sm text-indigo-900/50">Chargement du rayon promo…</p>}

      {!chargement && produits.length === 0 && (
        <p className="px-4 md:px-8 text-sm text-indigo-900/50">
          Aucun article en promo dans cette catégorie pour le moment.
        </p>
      )}

      <div className="flex gap-3 overflow-x-auto scrollbar-none px-4 md:px-8 pb-2 snap-x">
        {produits.map((p) => (
          <div key={p.id} className="w-[220px] md:w-[260px] flex-shrink-0 snap-start">
            <CarteProduitVideo
              id={p.id}
              titre={p.titre}
              prix={p.prix}
              videoUrl={p.videoUrl}
              imageUrl={p.photos[0] || null}
              vendeurId={p.vendeur.id}
              nomBoutique={p.vendeur.nomBoutique}
              villeVendeur={p.vendeur.ville}
              whatsappVendeur={p.vendeur.utilisateur.whatsapp}
              statutStock={p.statutStock}
              hotSales={p.boost}
              enPromotion={p.enPromo}
              estFavori={p.estFavori}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

