"use client";

import { useState, useTransition } from "react";
import { Check, Plus } from "lucide-react";

type Props = {
  vendeurId: string;
  suiviInitial: boolean;
  nbSuivisInitial: number;
};

/**
 * Bouton "Suivre" une boutique — même logique que les favoris (appareil
 * anonyme, pas besoin de compte). Suivre une boutique fait remonter ses
 * articles en priorité dans une section dédiée de l'accueil.
 */
export default function BoutonSuivreBoutique({ vendeurId, suiviInitial, nbSuivisInitial }: Props) {
  const [suivi, setSuivi] = useState(suiviInitial);
  const [nbSuivis, setNbSuivis] = useState(nbSuivisInitial);
  const [enCours, startTransition] = useTransition();

  function basculer() {
    const prochainEtat = !suivi;
    setSuivi(prochainEtat);
    setNbSuivis((n) => Math.max(0, n + (prochainEtat ? 1 : -1)));

    startTransition(async () => {
      try {
        const res = await fetch("/api/suivis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vendeurId }),
        });
        const data = await res.json();
        if (typeof data.suivi === "boolean") setSuivi(data.suivi);
        if (typeof data.nbSuivis === "number") setNbSuivis(data.nbSuivis);
      } catch {
        // En cas d'échec réseau, on revient à l'état précédent.
        setSuivi(!prochainEtat);
        setNbSuivis((n) => Math.max(0, n - (prochainEtat ? 1 : -1)));
      }
    });
  }

  return (
    <button
      onClick={basculer}
      disabled={enCours}
      className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium text-sm w-fit transition-all disabled:opacity-70 ${
        suivi
          ? "bg-white border border-indigo-900/15 text-indigo-900"
          : "btn-neon"
      }`}
    >
      {suivi ? <Check size={16} className="text-neon-600" /> : <Plus size={16} />}
      {suivi ? "Boutique suivie" : "Suivre la boutique"}
      {nbSuivis > 0 && (
        <span className={`text-xs font-normal ${suivi ? "text-indigo-900/50" : "text-white/75"}`}>
          · {nbSuivis} abonné{nbSuivis > 1 ? "s" : ""}
        </span>
      )}
    </button>
  );
}
