import { BadgeCheck } from "lucide-react";

type Props = {
  taille?: number;
  /**
   * "badge" (défaut) : pastille pleine avec texte "Vendeur vérifié", utilisée
   * uniquement là où la BOUTIQUE elle-même est la carte (annuaire /boutiques,
   * onglet vendeurs de la recherche) — c'est là qu'il faut rassurer sur la
   * boutique en tant que telle.
   * "icone" : juste le picto, sans texte ni fond, utilisée partout où le nom
   * de la boutique n'est qu'une métadonnée à côté d'un produit/d'une vidéo
   * (feed vidéo, carte produit, fiche produit, favoris) — pas la peine de
   * répéter "Vendeur vérifié" en toutes lettres à chaque produit.
   * "texte" : mention en ligne sans fond, utilisée sur les pages privées du
   * vendeur (tableau de bord, mon profil) où il n'y a rien à prouver au
   * visiteur — juste confirmer son statut au vendeur lui-même.
   */
  variante?: "badge" | "texte" | "icone";
};

export default function BadgeVendeurVerifie({ taille = 12, variante = "badge" }: Props) {
  if (variante === "icone") {
    return (
      <BadgeCheck
        size={taille}
        className="fill-neon-500 text-white flex-shrink-0"
        aria-label="Vendeur vérifié"
      >
        <title>Vendeur vérifié</title>
      </BadgeCheck>
    );
  }

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
