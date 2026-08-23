import { prisma } from "@/lib/prisma";
import FeedVideosCourtes from "@/components/FeedVideosCourtes";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Vidéos courtes — E-Mboppi",
};

async function recupererProduitsVideo() {
  return prisma.produit.findMany({
    where: { visible: true, videoUrl: { not: null } },
    include: { vendeur: { select: { id: true, nomBoutique: true, utilisateur: { select: { whatsapp: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
}

export default async function Videos() {
  const produits = await recupererProduitsVideo();

  return <FeedVideosCourtes produits={produits} />;
}
