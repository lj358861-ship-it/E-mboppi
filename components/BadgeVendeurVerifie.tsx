import { BadgeCheck } from "lucide-react";

type Props = {
  taille?: number;
  /**
   * "badge" (défaut) : pastille pleine, utilisée sur les pages publiques
   * (fiche produit, profil boutique, annuaire) pour rassurer le client.
   * "texte" : simple mention en ligne sans fond, utilisée sur les pages
   * privées du vendeur (tableau de bord, mon profil) où il n'y a rien à
   * prouver au visiteur — juste confirmer son statut au vendeur lui-même.
   */
  variante?: "badge" | "texte";
};

export default function BadgeVendeurVerifie({ taille = 12, variante = "badge" }: Props) {
  if (variante === "texte") {
    return (
      <span
        title="Boutique avec abonnement actif depuis plus de 2 mois"
        className="inline-flex items-center gap-1 text-neon-700 text-xs font-medium flex-shrink-0"
      >
        <BadgeCheck size={taille} className="fill-neon-500 text-white" /> Vendeur vérifié
      </span>
    );
  }

  return (
    <span
      title="Boutique avec abonnement actif depuis plus de 2 mois"
      className="inline-flex items-center gap-1 bg-neon-500/15 text-neon-700 text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
    >
      <BadgeCheck size={taille} className="fill-neon-500 text-white" /> Vendeur vérifié
    </span>
  );
}
