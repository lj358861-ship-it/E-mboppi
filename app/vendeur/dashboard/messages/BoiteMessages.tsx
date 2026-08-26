"use client";

import { useEffect, useState, useCallback } from "react";
import { MessageSquare, ArrowLeft } from "lucide-react";
import Messagerie from "@/components/Messagerie";

type Conversation = {
  utilisateurId: string;
  nom: string;
  dernierMessage: string;
  dernierMessageAt: string;
  nbNonLus: number;
};

function formaterDate(iso: string) {
  const d = new Date(iso);
  const auj = new Date();
  const memeJour = d.toDateString() === auj.toDateString();
  return memeJour
    ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export default function BoiteMessages({ moiId }: { moiId: string }) {
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [selection, setSelection] = useState<Conversation | null>(null);

  const charger = useCallback(async () => {
    try {
      const res = await fetch("/api/messages/conversations");
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch {
      // silencieux — la liste réessaiera au prochain intervalle
    }
  }, []);

  useEffect(() => {
    charger();
    const intervalle = setInterval(charger, 8000);
    return () => clearInterval(intervalle);
  }, [charger]);

  // Une fois une conversation ouverte, ses messages sont marqués lus côté
  // serveur — on remet son compteur à zéro localement pour un retour immédiat.
  function ouvrir(c: Conversation) {
    setSelection(c);
    setConversations((liste) =>
      liste ? liste.map((x) => (x.utilisateurId === c.utilisateurId ? { ...x, nbNonLus: 0 } : x)) : liste
    );
  }

  if (conversations === null) {
    return <p className="text-sm text-indigo-900/50">Chargement des conversations…</p>;
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center text-center gap-2 bg-white border border-stone-200 rounded-2xl p-10">
        <MessageSquare size={28} className="text-indigo-900/25" />
        <p className="text-sm text-indigo-900/50">
          Aucun message pour le moment. Les questions de vos clients depuis une fiche produit
          apparaîtront ici.
        </p>
      </div>
    );
  }

  // Sur mobile, seule la liste OU le fil actif s'affiche (pas les deux) ;
  // sur desktop, les deux colonnes restent visibles en permanence.
  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-4">
      <div className={`space-y-1.5 ${selection ? "hidden md:block" : "block"}`}>
        {conversations.map((c) => (
          <button
            key={c.utilisateurId}
            type="button"
            onClick={() => ouvrir(c)}
            className={`w-full flex items-center gap-3 bg-white border transition-colors rounded-xl px-3.5 py-3 text-left ${
              selection?.utilisateurId === c.utilisateurId
                ? "border-indigo-800"
                : "border-stone-200 hover:border-indigo-800/50"
            }`}
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-900/5 text-indigo-900 font-medium text-sm flex-shrink-0">
              {c.nom.charAt(0).toUpperCase()}
            </span>
            <span className="flex-1 min-w-0">
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-indigo-900 truncate">{c.nom}</span>
                <span className="text-[10px] text-indigo-900/40 flex-shrink-0">
                  {formaterDate(c.dernierMessageAt)}
                </span>
              </span>
              <span className="flex items-center justify-between gap-2">
                <span className="text-xs text-indigo-900/50 truncate">{c.dernierMessage}</span>
                {c.nbNonLus > 0 && (
                  <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-piment-500 text-white text-[10px] font-bold flex-shrink-0">
                    {c.nbNonLus > 9 ? "9+" : c.nbNonLus}
                  </span>
                )}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className={selection ? "block" : "hidden md:block"}>
        {selection ? (
          <div>
            <button
              type="button"
              onClick={() => setSelection(null)}
              className="md:hidden flex items-center gap-1.5 text-xs font-medium text-indigo-900/60 hover:text-indigo-900 mb-3"
            >
              <ArrowLeft size={14} /> Toutes les conversations
            </button>
            <p className="text-sm font-medium text-indigo-900 mb-2">{selection.nom}</p>
            <Messagerie destinataireId={selection.utilisateurId} moiId={moiId} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[420px] bg-white border border-stone-200 rounded-2xl text-center px-6">
            <MessageSquare size={26} className="text-indigo-900/20 mb-2" />
            <p className="text-sm text-indigo-900/50">Sélectionnez une conversation pour l&apos;afficher ici.</p>
          </div>
        )}
      </div>
    </div>
  );
}
