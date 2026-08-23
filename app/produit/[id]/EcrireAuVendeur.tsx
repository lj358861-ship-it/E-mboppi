"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import Messagerie from "@/components/Messagerie";

export default function EcrireAuVendeur({
  vendeurUtilisateurId,
  moiId,
  titreProduit,
}: {
  vendeurUtilisateurId: string;
  moiId: string | null;
  titreProduit: string;
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
