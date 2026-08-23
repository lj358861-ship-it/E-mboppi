"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, XCircle, Trash2, Phone } from "lucide-react";

type Vendeur = {
  id: string;
  nomBoutique: string;
  nom: string;
  telephone: string;
  whatsapp: string;
  abonnementId: string | null;
  statutAbonnement: string;
  joursRestants: number;
};

export default function AdminVendeurs({ onChangement }: { onChangement: () => void }) {
  const [vendeurs, setVendeurs] = useState<Vendeur[] | null>(null);
  const [enCours, setEnCours] = useState<string | null>(null);

  async function charger() {
    const res = await fetch("/api/vendeurs");
    if (res.ok) {
      const data = await res.json();
      setVendeurs(data.vendeurs);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  async function valider(abonnementId: string) {
    setEnCours(abonnementId);
    await fetch("/api/abonnements/valider", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ abonnementId }),
    });
    setEnCours(null);
    charger();
    onChangement();
  }

  async function supprimer(vendeur: Vendeur) {
    if (!confirm(`Supprimer définitivement "${vendeur.nomBoutique}" et toutes ses annonces ? Cette action est irréversible.`)) {
      return;
    }
    setEnCours(vendeur.id);
    await fetch(`/api/vendeurs/${vendeur.id}`, { method: "DELETE" });
    setEnCours(null);
    charger();
    onChangement();
  }

  if (vendeurs === null) return <p className="text-sm text-neon-300/50">Chargement…</p>;

  return (
    <div className="space-y-2">
      {vendeurs.map((v) => (
        <div
          key={v.id}
          className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/5 neon-border rounded-xl px-4 py-3"
        >
          <div>
            <p className="font-medium text-white">{v.nomBoutique}</p>
            <p className="text-xs text-neon-300/60 flex items-center gap-1">
              {v.nom} · <Phone size={11} /> {v.telephone}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <StatutBadge statut={v.statutAbonnement} jours={v.joursRestants} />
            {v.statutAbonnement !== "ACTIF" && v.abonnementId && (
              <button
                onClick={() => valider(v.abonnementId!)}
                disabled={enCours === v.abonnementId}
                className="bg-feuille-500 hover:bg-feuille-600 disabled:opacity-60 transition-colors text-white text-xs px-3 py-2 rounded-full font-medium"
              >
                {enCours === v.abonnementId ? "Validation…" : "Valider le paiement"}
              </button>
            )}
            <button
              onClick={() => supprimer(v)}
              disabled={enCours === v.id}
              className="flex items-center gap-1 bg-piment-500/20 hover:bg-piment-500 border border-piment-500/50 disabled:opacity-60 transition-colors text-piment-500 hover:text-white text-xs px-3 py-2 rounded-full font-medium"
            >
              <Trash2 size={12} />
              {enCours === v.id ? "Suppression…" : "Supprimer"}
            </button>
          </div>
        </div>
      ))}
      {vendeurs.length === 0 && (
        <p className="text-sm text-neon-300/50">Aucun vendeur inscrit pour le moment.</p>
      )}
    </div>
  );
}

function StatutBadge({ statut, jours }: { statut: string; jours: number }) {
  if (statut === "ACTIF") {
    return (
      <span className="flex items-center gap-1 text-xs bg-feuille-500/15 text-feuille-500 px-2.5 py-1 rounded-full font-medium">
        <CheckCircle2 size={12} /> {jours} j restants
      </span>
    );
  }
  if (statut === "EN_ATTENTE_VALIDATION") {
    return (
      <span className="flex items-center gap-1 text-xs bg-mango-500/15 text-mango-400 px-2.5 py-1 rounded-full font-medium">
        <Clock size={12} /> En attente
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs bg-piment-500/15 text-piment-500 px-2.5 py-1 rounded-full font-medium">
      <XCircle size={12} /> Expiré
    </span>
  );
}
