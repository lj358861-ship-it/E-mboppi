"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import Messagerie from "@/components/Messagerie";

export default function EcrireAuVendeur({
  vendeurUtilisateurId,
  moiId,
  titreProduit,
  compact = false,
}: {
  vendeurUtilisateurId: string;
  moiId: string | null;
  titreProduit: string;
  compact?: boolean;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [premierMessageEnvoye, setPremierMessageEnvoye] = useState(false);

  async function ouvrirConversation() {
    if (!moiId) {
      alert("Connectez-vous pour écrire au vendeur.");
      return;
    }
    setOuvert(true);
    if (!premierMessageEnvoye) {
      // Message automatique envoyé une seule fois à l'ouverture
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinataireId: vendeurUtilisateurId,
          contenu: `Bonjour, je suis intéressé(e) par votre produit "${titreProduit}". Est-il toujours disponible ?`,
        }),
      });
      setPremierMessageEnvoye(true);
    }
  }

  if (!ouvert) {
    if (compact) {
      return (
        <button
          onClick={ouvrirConversation}
          aria-label="Écrire au vendeur"
          className="flex items-center justify-center w-11 h-11 flex-shrink-0 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors text-indigo-900"
        >
          <MessageCircle size={18} />
        </button>
      );
    }
    return (
      <button
        onClick={ouvrirConversation}
        className="flex items-center gap-2 bg-feuille-500 hover:bg-feuille-600 transition-colors text-white px-5 py-3 rounded-full font-medium text-sm"
      >
        <MessageCircle size={16} /> Écrire au vendeur
      </button>
    );
  }

  return <Messagerie destinataireId={vendeurUtilisateurId} moiId={moiId!} />;
}
