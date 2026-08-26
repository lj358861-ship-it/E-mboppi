"use client";

import { useEffect, useState } from "react";
import { Zap, ZapOff, Trash2, EyeOff, Eye } from "lucide-react";
import { classesBadgeStock, labelStatutStock, StatutStock } from "@/lib/stock";

type Produit = {
  id: string;
  titre: string;
  prix: number;
  visible: boolean;
  boost: boolean;
  statutStock: StatutStock;
  vendeur: { nomBoutique: string };
};

const formatFCFA = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " F";

export default function AdminAnnonces({ onChangement }: { onChangement: () => void }) {
  const [produits, setProduits] = useState<Produit[] | null>(null);
  const [enCours, setEnCours] = useState<string | null>(null);

  async function charger() {
    const res = await fetch("/api/admin/produits");
    if (res.ok) {
      const data = await res.json();
      setProduits(data.produits);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  async function toggleBoost(p: Produit) {
    setEnCours(p.id);
    await fetch(`/api/produits/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boost: !p.boost }),
    });
    setEnCours(null);
    charger();
    onChangement();
  }

  async function supprimer(p: Produit) {
    if (!confirm(`Supprimer définitivement l'annonce "${p.titre}" ?`)) return;
    setEnCours(p.id);
    try {
      const res = await fetch(`/api/produits/${p.id}`, { method: "DELETE" });
      const resultat = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(resultat.erreur || "Échec de la suppression de l'annonce. Réessayez.");
        return;
      }
      await charger();
      onChangement();
    } catch {
      alert("Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.");
    } finally {
      setEnCours(null);
    }
  }

  if (produits === null) return <p className="text-sm text-neon-300/50">Chargement…</p>;

  return (
    <div className="space-y-2">
      {produits.map((p) => (
        <div
          key={p.id}
          className={`flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl px-4 py-3 neon-border ${
            p.boost ? "bg-gradient-to-r from-neon-600/20 to-neonpink-500/10" : "bg-white/5"
          }`}
        >
          <div className="flex items-center gap-2">
            {p.boost && (
              <span className="flex items-center gap-1 text-[10px] bg-gradient-neon text-white px-2 py-1 rounded-full font-semibold animate-glow-pulse shrink-0">
                <Zap size={10} /> BOOSTÉ
              </span>
            )}
            <div>
              <p className="font-medium text-white">{p.titre}</p>
              <p className="text-xs text-neon-300/60 flex items-center gap-1.5">
                {p.vendeur.nomBoutique} · {formatFCFA(p.prix)}
                {p.statutStock !== "DISPONIBLE" && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${classesBadgeStock(p.statutStock)}`}>
                    {labelStatutStock(p.statutStock)}
                  </span>
                )}
                {!p.visible && (
                  <span className="flex items-center gap-0.5 text-piment-500">
                    <EyeOff size={11} /> masquée
                  </span>
                )}
                {p.visible && (
                  <span className="flex items-center gap-0.5 text-feuille-500">
                    <Eye size={11} /> visible
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleBoost(p)}
              disabled={enCours === p.id}
              className={`flex items-center gap-1 text-xs px-3 py-2 rounded-full font-medium transition-colors disabled:opacity-60 ${
                p.boost
                  ? "bg-white/10 border border-white/20 text-neon-300 hover:border-piment-500/50 hover:text-piment-500"
                  : "btn-neon"
              }`}
            >
              {p.boost ? <ZapOff size={12} /> : <Zap size={12} />}
              {p.boost ? "Retirer le boost" : "Booster"}
            </button>
            <button
              onClick={() => supprimer(p)}
              disabled={enCours === p.id}
              className="flex items-center gap-1 bg-piment-500/20 hover:bg-piment-500 border border-piment-500/50 disabled:opacity-60 transition-colors text-piment-500 hover:text-white text-xs px-3 py-2 rounded-full font-medium"
            >
              <Trash2 size={12} />
              Supprimer
            </button>
          </div>
        </div>
      ))}
      {produits.length === 0 && (
        <p className="text-sm text-neon-300/50">Aucune annonce pour le moment.</p>
      )}
    </div>
  );
}
