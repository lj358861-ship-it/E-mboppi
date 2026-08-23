"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

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

export default function ListeVendeurs() {
  const [vendeurs, setVendeurs] = useState<Vendeur[] | null>(null);
  const [validationEnCours, setValidationEnCours] = useState<string | null>(null);

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
    setValidationEnCours(abonnementId);
    await fetch("/api/abonnements/valider", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ abonnementId }),
    });
    setValidationEnCours(null);
    charger();
  }

  if (vendeurs === null) return <p className="text-sm text-indigo-900/50">Chargement…</p>;

  return (
    <div className="space-y-2">
      {vendeurs.map((v) => (
        <div
          key={v.id}
          className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-stone-200 rounded-xl px-4 py-3"
        >
          <div>
            <p className="font-medium text-indigo-900">{v.nomBoutique}</p>
            <p className="text-xs text-indigo-900/50">
              {v.nom} · {v.telephone}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <StatutBadge statut={v.statutAbonnement} jours={v.joursRestants} />
            {v.statutAbonnement !== "ACTIF" && v.abonnementId && (
              <button
                onClick={() => valider(v.abonnementId!)}
                disabled={validationEnCours === v.abonnementId}
                className="bg-feuille-500 hover:bg-feuille-600 disabled:opacity-60 transition-colors text-white text-xs px-3 py-2 rounded-full font-medium"
              >
                {validationEnCours === v.abonnementId ? "Validation…" : "Valider le paiement"}
              </button>
            )}
          </div>
        </div>
      ))}
      {vendeurs.length === 0 && (
        <p className="text-sm text-indigo-900/50">Aucun vendeur inscrit pour le moment.</p>
      )}
    </div>
  );
}

function StatutBadge({ statut, jours }: { statut: string; jours: number }) {
  if (statut === "ACTIF") {
    return (
      <span className="flex items-center gap-1 text-xs bg-feuille-500/15 text-feuille-600 px-2.5 py-1 rounded-full font-medium">
        <CheckCircle2 size={12} /> {jours} j restants
      </span>
    );
  }
  if (statut === "EN_ATTENTE_VALIDATION") {
    return (
      <span className="flex items-center gap-1 text-xs bg-mango-500/15 text-mango-600 px-2.5 py-1 rounded-full font-medium">
        <Clock size={12} /> En attente
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs bg-piment-500/15 text-piment-600 px-2.5 py-1 rounded-full font-medium">
      <XCircle size={12} /> Expiré
    </span>
  );
}
