/**
 * E-Mboppi — États de stock d'un article
 *
 * Un vendeur peut marquer un article comme "Stock limité" (encourage à
 * acheter vite) ou "Rupture de stock" (toujours visible/consultable, mais
 * clairement signalé aux clients). Par défaut un article est "Disponible"
 * et n'affiche aucune étiquette.
 */

export type StatutStock = "DISPONIBLE" | "STOCK_LIMITE" | "RUPTURE_STOCK";

export const OPTIONS_STATUT_STOCK: { valeur: StatutStock; label: string }[] = [
  { valeur: "DISPONIBLE", label: "Disponible" },
  { valeur: "STOCK_LIMITE", label: "Stock limité" },
  { valeur: "RUPTURE_STOCK", label: "Rupture de stock" },
];

export function labelStatutStock(statut: StatutStock): string {
  return OPTIONS_STATUT_STOCK.find((o) => o.valeur === statut)?.label || "Disponible";
}

/**
 * Étiquette "Hot Sales" — mise en avant payante d'un article, décidée
 * uniquement par l'admin (via `boost`) après paiement du vendeur. Le
 * vendeur ne peut pas se l'attribuer lui-même. L'icône <Flame> (lucide)
 * est affichée à côté du texte partout où ce badge est rendu.
 */
export const CLASSES_BADGE_PROMO = "bg-gradient-neon text-white";
export const LABEL_BADGE_PROMO = "Hot Sales";

/** Classes Tailwind pour l'étiquette (badge) affichée sur les cartes produit */
export function classesBadgeStock(statut: StatutStock): string {
  switch (statut) {
    case "RUPTURE_STOCK":
      return "bg-piment-500 text-white";
    case "STOCK_LIMITE":
      return "bg-mango-500 text-indigo-950";
    default:
      return "";
  }
}
