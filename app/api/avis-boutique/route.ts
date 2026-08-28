import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { noteMoyenneBoutique } from "@/lib/notes";

// GET /api/avis-boutique?vendeurId=xxx — avis récents laissés sur les
// articles de cette boutique (model AvisProduit), tous produits confondus.
// Lecture seule : il n'existe pas de POST ici, car on ne peut pas noter une
// boutique directement — seulement ses articles (voir /api/avis-produit).
// La note globale affichée en haut de la page boutique vient de
// lib/notes.ts::noteMoyenneBoutique, qui fait la même moyenne.
export async function GET(req: NextRequest) {
  const vendeurId = req.nextUrl.searchParams.get("vendeurId");
  if (!vendeurId) {
    return NextResponse.json({ erreur: "vendeurId manquant" }, { status: 400 });
  }

  const [avis, stats] = await Promise.all([
    prisma.avisProduit.findMany({
      where: { produit: { vendeurId } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        note: true,
        commentaire: true,
        nomClient: true,
        auteurCertifie: true,
        createdAt: true,
        produit: { select: { id: true, titre: true } },
      },
    }),
    // Moyenne/total réels (sur TOUS les avis produits, pas seulement les 20
    // affichés) — même calcul que la note affichée en haut de la boutique.
    noteMoyenneBoutique(vendeurId),
  ]);

  return NextResponse.json({ avis, nbAvis: stats.nbAvis, moyenne: stats.noteMoyenne });
}
