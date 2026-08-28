import { prisma } from "@/lib/prisma";
import FeedVideosCourtes from "@/components/FeedVideosCourtes";
import { notesMoyennesBoutiques } from "@/lib/notes";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Vidéos courtes — E-Mboppi",
};

async function recupererProduitsVideo() {
  const produits = await prisma.produit.findMany({
    where: { visible: true, videoUrl: { not: null } },
    include: { vendeur: { select: { id: true, nomBoutique: true, utilisateur: { select: { whatsapp: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // E-Mboppi n'a pas d'avis par article, seulement par boutique (voir
  // lib/notes.ts) : la note affichée sur chaque carte vidéo est donc celle
  // de la boutique du vendeur. Un seul aller-retour base groupé par vendeur
  // pour éviter une requête par produit.
  const notes = await notesMoyennesBoutiques(produits.map((p) => p.vendeur.id));

  return produits.map((p) => {
    const stats = notes.get(p.vendeur.id) ?? { noteMoyenne: 0, nbAvis: 0 };
    return { ...p, noteMoyenne: stats.noteMoyenne, nbAvis: stats.nbAvis };
  });
}

export default async function Videos() {
  const produits = await recupererProduitsVideo();

  return <FeedVideosCourtes produits={produits} />;
}
