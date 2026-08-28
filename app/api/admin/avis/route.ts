import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireSession } from "@/lib/auth";

// GET /api/admin/avis — tous les avis de la plateforme (boutique ET
// article), triés par date, pour la modération admin (repérer les avis
// faux ou irrespectueux et les supprimer). Chaque avis porte un champ
// `type` ("boutique" | "produit") que l'UI utilise pour appeler le bon
// endpoint de suppression (/api/avis/[id] ou /api/avis-produit/[id]).
export async function GET() {
  const session = lireSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ erreur: "Réservé à l'administrateur" }, { status: 403 });
  }

  const [avisBoutique, avisProduit] = await Promise.all([
    prisma.avis.findMany({
      include: { vendeur: { select: { nomBoutique: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.avisProduit.findMany({
      include: { produit: { select: { titre: true, vendeur: { select: { nomBoutique: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const avis = [
    ...avisBoutique.map((a) => ({ ...a, type: "boutique" as const })),
    ...avisProduit.map((a) => ({
      ...a,
      type: "produit" as const,
      vendeur: a.produit.vendeur,
      produitTitre: a.produit.titre,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ avis });
}
