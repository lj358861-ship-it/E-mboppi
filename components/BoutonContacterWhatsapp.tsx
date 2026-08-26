"use client";

import { MessageCircle } from "lucide-react";

export default function BoutonContacterWhatsapp({
  produitId,
  href,
  className,
  taille = 16,
  texte = "WhatsApp du vendeur",
}: {
  produitId: string;
  href: string;
  className: string;
  taille?: number;
  texte?: string;
}) {
  function suivreClic() {
    // Fire-and-forget : ne doit jamais retarder ou bloquer l'ouverture de WhatsApp.
    fetch(`/api/produits/${produitId}/clic`, { method: "POST", keepalive: true }).catch(() => {});
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={suivreClic} className={className}>
      <MessageCircle size={taille} /> {texte}
    </a>
  );
}
