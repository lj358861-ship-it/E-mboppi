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
