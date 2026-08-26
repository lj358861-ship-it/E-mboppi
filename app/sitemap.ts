import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// Force la génération de sitemap.xml à la demande (runtime) plutôt qu'au
// moment du build : sur Railway, la base de données (réseau privé
// postgres.railway.internal) n'est joignable qu'au runtime, pas pendant le
// build. Sans cette ligne, `next build` essaie d'interroger Prisma pour
// pré-générer le sitemap et échoue avec "Can't reach database server".
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://e-mboppi-production.up.railway.app";

// Pages statiques toujours indexables.
const PAGES_STATIQUES = ["", "/recherche", "/videos", "/contact", "/a-propos"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [produits, vendeurs] = await Promise.all([
    prisma.produit.findMany({
      where: { visible: true },
      select: { id: true, createdAt: true },
      take: 5000,
    }),
    prisma.vendeur.findMany({
      select: { id: true, createdAt: true },
      take: 2000,
    }),
  ]);

  const entreesStatiques: MetadataRoute.Sitemap = PAGES_STATIQUES.map((chemin) => ({
    url: `${SITE_URL}${chemin}`,
    changeFrequency: "daily",
    priority: chemin === "" ? 1 : 0.6,
  }));

  const entreesProduits: MetadataRoute.Sitemap = produits.map((p) => ({
    url: `${SITE_URL}/produit/${p.id}`,
    lastModified: p.createdAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const entreesVendeurs: MetadataRoute.Sitemap = vendeurs.map((v) => ({
    url: `${SITE_URL}/vendeur/${v.id}`,
    lastModified: v.createdAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...entreesStatiques, ...entreesVendeurs, ...entreesProduits];
}
