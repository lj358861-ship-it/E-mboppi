"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import CarteProduitVideo from "@/components/CarteProduitVideo";
import { CATEGORIES } from "@/lib/categories";
import { StatutStock } from "@/lib/stock";

type Produit = {
  id: string;
  titre: string;
  prix: number;
  videoUrl: string | null;
  photos: string[];
  statutStock: StatutStock;
  vendeur: { id: string; nomBoutique: string; logoUrl: string | null; utilisateur: { whatsapp: string } };
};

export default function Recherche() {
  const [terme, setTerme] = useState("");
  const [categorie, setCategorie] = useState("");
  const [prixMin, setPrixMin] = useState("");
  const [prixMax, setPrixMax] = useState("");
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [chargement, setChargement] = useState(false);

  const rechercher = useCallback(
    async (params: { q: string; categorie: string; prixMin: string; prixMax: string }) => {
      setChargement(true);
      const query = new URLSearchParams();
      if (params.q) query.set("q", params.q);
      if (params.categorie) query.set("categorie", params.categorie);
      if (params.prixMin) query.set("prixMin", params.prixMin);
      if (params.prixMax) query.set("prixMax", params.prixMax);

      const res = await fetch(`/api/produits?${query.toString()}`);
      const data = await res.json();
      setProduits(data.produits || []);
      setChargement(false);
    },
    []
  );

  useEffect(() => {
    const delai = setTimeout(() => rechercher({ q: terme, categorie, prixMin, prixMax }), 350);
    return () => clearTimeout(delai);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terme, categorie, prixMin, prixMax]);

  const filtresActifs = Boolean(categorie || prixMin || prixMax);

  return (
    <div className="px-4 md:px-8 py-6">
      <h1 className="font-display text-2xl font-semibold text-indigo-900 mb-4">
        Que cherchez-vous au marché ?
      </h1>

      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-900/40" size={18} />
          <input
            value={terme}
            onChange={(e) => setTerme(e.target.value)}
            placeholder="Ex : robe wax, chaussures, sac..."
            className="w-full bg-white border border-stone-200 rounded-full pl-11 pr-4 py-3 text-sm outline-none focus:border-indigo-800 focus:ring-2 focus:ring-indigo-800/10"
          />
        </div>
        <button
          onClick={() => setFiltresOuverts((v) => !v)}
          className={`flex items-center gap-1.5 px-4 rounded-full text-sm font-medium border transition-colors ${
            filtresActifs
              ? "bg-indigo-900 text-white border-indigo-900"
              : "bg-white border-stone-200 text-indigo-900/70"
          }`}
        >
          <SlidersHorizontal size={16} /> Filtres
        </button>
      </div>

      {filtresOuverts && (
        <div className="grid sm:grid-cols-3 gap-3 mb-5 bg-white border border-stone-200 rounded-2xl p-4">
          <select
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
          >
            <option value="">Toutes les catégories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            placeholder="Prix min (FCFA)"
            value={prixMin}
            onChange={(e) => setPrixMin(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
          />
          <input
            type="number"
            min={0}
            placeholder="Prix max (FCFA)"
            value={prixMax}
            onChange={(e) => setPrixMax(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
          />
        </div>
      )}

      {chargement && <p className="text-sm text-indigo-900/50">Recherche en cours…</p>}

      {!chargement && produits.length === 0 && (
        <p className="text-sm text-indigo-900/50">
          Aucun article ne correspond à votre recherche pour le moment.
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {produits.map((p) => (
          <CarteProduitVideo
            key={p.id}
            id={p.id}
            titre={p.titre}
            prix={p.prix}
            videoUrl={p.videoUrl}
            imageUrl={p.photos[0] || null}
            vendeurId={p.vendeur.id}
            nomBoutique={p.vendeur.nomBoutique}
            whatsappVendeur={p.vendeur.utilisateur.whatsapp}
            statutStock={p.statutStock}
          />
        ))}
      </div>
    </div>
  );
}
