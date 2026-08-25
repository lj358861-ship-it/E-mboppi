"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Store } from "lucide-react";
import CarteProduitVideo from "@/components/CarteProduitVideo";
import { StatutStock } from "@/lib/stock";

type ProduitSuivi = {
  id: string;
  titre: string;
  prix: number;
  videoUrl: string | null;
  photos: string[];
  statutStock: StatutStock;
  enPromo: boolean;
  estFavori?: boolean;
  vendeur: { id: string; nomBoutique: string; ville: string | null; utilisateur: { whatsapp: string } };
};

type VendeurSuivi = { id: string; nomBoutique: string; logoUrl: string | null };

/**
 * Section prioritaire de l'accueil : les articles récents des boutiques que
 * ce client suit. Invisible tant qu'aucune boutique n'est suivie — pas de
 * bloc vide qui alourdit la page pour un nouveau visiteur.
 */
export default function ProduitsSuivis() {
  const [vendeurs, setVendeurs] = useState<VendeurSuivi[]>([]);
  const [produits, setProduits] = useState<ProduitSuivi[]>([]);
  const [charge, setCharge] = useState(false);

  useEffect(() => {
    fetch("/api/suivis")
      .then((r) => (r.ok ? r.json() : { vendeurs: [], produits: [] }))
      .then((d) => {
        setVendeurs(d.vendeurs || []);
        setProduits(d.produits || []);
      })
      .finally(() => setCharge(true));
  }, []);

  if (!charge || vendeurs.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between px-4 md:px-8 mb-3">
        <h2 className="font-display text-lg md:text-xl font-semibold text-indigo-900 flex items-center gap-2">
          <Store className="text-neon-600" size={19} /> Vos boutiques suivies
        </h2>
        <span className="text-xs font-medium text-indigo-900/40">
          {vendeurs.length} boutique{vendeurs.length > 1 ? "s" : ""} suivie{vendeurs.length > 1 ? "s" : ""}
        </span>
      </div>

      {produits.length === 0 ? (
        <p className="px-4 md:px-8 text-sm text-indigo-900/50">
          Pas encore de nouvel article chez les boutiques que vous suivez.
        </p>
      ) : (
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
                enPromo={p.enPromo}
                estFavori={p.estFavori}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 px-4 md:px-8 mt-3 overflow-x-auto scrollbar-none">
        {vendeurs.map((v) => (
          <Link
            key={v.id}
            href={`/vendeur/${v.id}`}
            className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-full pl-1 pr-3 py-1 text-xs font-medium text-indigo-900/70 hover:border-indigo-800 transition-colors flex-shrink-0"
          >
            <span className="w-6 h-6 rounded-full overflow-hidden bg-stone-100 flex items-center justify-center flex-shrink-0">
              {v.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.logoUrl} alt={v.nomBoutique} className="w-full h-full object-cover" />
              ) : (
                <Store size={12} className="text-indigo-900/30" />
              )}
            </span>
            {v.nomBoutique}
          </Link>
        ))}
      </div>
    </section>
  );
}
