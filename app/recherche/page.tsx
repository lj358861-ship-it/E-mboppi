"use client";

import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import CarteProduitVideo from "@/components/CarteProduitVideo";

type Produit = {
  id: string;
  titre: string;
  prix: number;
  videoUrl: string | null;
  imageUrl: string | null;
  vendeur: { nomBoutique: string; utilisateur: { whatsapp: string } };
};

export default function Recherche() {
  const [terme, setTerme] = useState("");
  const [produits, setProduits] = useState<Produit[]>([]);
  const [chargement, setChargement] = useState(false);

  const rechercher = useCallback(async (q: string) => {
    setChargement(true);
    const res = await fetch(`/api/produits${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    const data = await res.json();
    setProduits(data.produits || []);
    setChargement(false);
  }, []);

  useEffect(() => {
    rechercher("");
  }, [rechercher]);

  useEffect(() => {
    const delai = setTimeout(() => rechercher(terme), 350);
    return () => clearTimeout(delai);
  }, [terme, rechercher]);

  return (
    <div className="px-4 md:px-8 py-6">
      <h1 className="font-display text-2xl font-semibold text-indigo-900 mb-4">
        Que cherchez-vous au marché ?
      </h1>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-900/40" size={18} />
        <input
          value={terme}
          onChange={(e) => setTerme(e.target.value)}
          placeholder="Ex : robe wax, chaussures, sac..."
          className="w-full bg-white border border-stone-200 rounded-full pl-11 pr-4 py-3 text-sm outline-none focus:border-indigo-800 focus:ring-2 focus:ring-indigo-800/10"
        />
      </div>

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
            imageUrl={p.imageUrl}
            nomBoutique={p.vendeur.nomBoutique}
            whatsappVendeur={p.vendeur.utilisateur.whatsapp}
          />
        ))}
      </div>
    </div>
  );
}
