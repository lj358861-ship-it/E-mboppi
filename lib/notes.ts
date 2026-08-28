import { prisma } from "@/lib/prisma";

/**
 * Calcule la note moyenne d'une boutique.
 *
 * IMPORTANT : une boutique ne se note pas directement (voir model Avis,
 * conservé uniquement pour les commentaires/anciens enregistrements — sa
 * note n'est plus utilisée). La note affichée sur une boutique est
 * entièrement dérivée des avis laissés sur SES articles (model AvisProduit) :
 * c'est la moyenne de tous les avis produits de tous ses articles. Retourne
 * 0 / 0 si aucun de ses articles n'a encore reçu d'avis.
 */
export async function noteMoyenneBoutique(
  vendeurId: string
): Promise<{ noteMoyenne: number; nbAvis: number }> {
  const resultat = await prisma.avisProduit.aggregate({
    where: { produit: { vendeurId } },
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
 *
 * Comme AvisProduit n'a pas de vendeurId direct (il faut passer par
 * produit.vendeurId), on ne peut pas faire un simple groupBy sur AvisProduit :
 * on récupère d'abord les IDs produits de ces vendeurs, puis on groupe les
 * avis par produit et on ré-agrège côté application par vendeur.
 */
export async function notesMoyennesBoutiques(
  vendeurIds: string[]
): Promise<Map<string, { noteMoyenne: number; nbAvis: number }>> {
  const idsUniques = Array.from(new Set(vendeurIds));
  if (idsUniques.length === 0) return new Map();

  const produits = await prisma.produit.findMany({
    where: { vendeurId: { in: idsUniques } },
    select: { id: true, vendeurId: true },
  });
  if (produits.length === 0) return new Map();

  const vendeurIdParProduit = new Map(produits.map((p) => [p.id, p.vendeurId]));

  const resultatsParProduit = await prisma.avisProduit.groupBy({
    by: ["produitId"],
    where: { produitId: { in: produits.map((p) => p.id) } },
    _sum: { note: true },
    _count: { note: true },
  });

  // Agrégation manuelle produit → boutique : somme des notes et nombre
  // d'avis de tous les articles de chaque boutique.
  const sommeParVendeur = new Map<string, { somme: number; nb: number }>();
  for (const r of resultatsParProduit) {
    const vendeurId = vendeurIdParProduit.get(r.produitId);
    if (!vendeurId) continue;
    const courant = sommeParVendeur.get(vendeurId) ?? { somme: 0, nb: 0 };
    courant.somme += r._sum.note ?? 0;
    courant.nb += r._count.note;
    sommeParVendeur.set(vendeurId, courant);
  }

  // Array.from(...) plutôt que "for...of" directement sur la Map : le
  // tsconfig du projet cible un JS antérieur à ES2015, qui ne permet pas
  // d'itérer une Map sans le flag --downlevelIteration.
  const carte = new Map<string, { noteMoyenne: number; nbAvis: number }>();
  for (const [vendeurId, { somme, nb }] of Array.from(sommeParVendeur)) {
    carte.set(vendeurId, { noteMoyenne: nb > 0 ? somme / nb : 0, nbAvis: nb });
  }
  return carte;
}
