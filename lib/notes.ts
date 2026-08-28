import { prisma } from "@/lib/prisma";

/**
 * Calcule la note moyenne d'une boutique à partir des avis clients (voir
 * model Avis dans prisma/schema.prisma). Retourne 0 / 0 si la boutique n'a
 * encore reçu aucun avis.
 */
export async function noteMoyenneBoutique(
  vendeurId: string
): Promise<{ noteMoyenne: number; nbAvis: number }> {
  const resultat = await prisma.avis.aggregate({
    where: { vendeurId },
    _avg: { note: true },
    _count: { note: true },
  });

  return {
    noteMoyenne: resultat._avg.note ?? 0,
    nbAvis: resultat._count.note,
  };
}

/**
 * Version "batch" de noteMoyenneBoutique : calcule la note moyenne de
 * plusieurs boutiques en une seule requête groupée (au lieu d'un aller-retour
 * base par boutique). Utile pour les listes de produits (ex. fil vidéos) où
 * chaque carte affiche la note de la boutique du vendeur.
 */
export async function notesMoyennesBoutiques(
  vendeurIds: string[]
): Promise<Map<string, { noteMoyenne: number; nbAvis: number }>> {
  const idsUniques = Array.from(new Set(vendeurIds));
  if (idsUniques.length === 0) return new Map();

  const resultats = await prisma.avis.groupBy({
    by: ["vendeurId"],
    where: { vendeurId: { in: idsUniques } },
    _avg: { note: true },
    _count: { note: true },
  });

  const carte = new Map<string, { noteMoyenne: number; nbAvis: number }>();
  for (const r of resultats) {
    carte.set(r.vendeurId, { noteMoyenne: r._avg.note ?? 0, nbAvis: r._count.note });
  }
  return carte;
}
