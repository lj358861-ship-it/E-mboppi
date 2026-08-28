import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { idAppareil, lireIdAppareil } from "@/lib/appareil";
import { estVendeurVerifie } from "@/lib/abonnement";

const SELECTION_VENDEUR = {
  select: {
    id: true,
    nomBoutique: true,
    logoUrl: true,
    ville: true,
    certifie: true,
    createdAt: true,
    abonnements: { orderBy: { createdAt: "desc" }, take: 1, select: { statut: true } },
    utilisateur: { select: { whatsapp: true } },
  },
} as const;

// GET /api/suivis — boutiques suivies par cet appareil, avec leurs articles
// les plus récents (pour la section "Vos boutiques suivies" de l'accueil).
// Ne crée pas de cookie appareil si aucun n'existe encore (lecture seule).
export async function GET() {
  const appareilId = lireIdAppareil();
  if (!appareilId) {
    return NextResponse.json({ vendeurs: [], produits: [] });
  }

  const suivis = await prisma.suivi.findMany({
    where: { appareilId },
    orderBy: { createdAt: "desc" },
    include: { vendeur: SELECTION_VENDEUR },
  });

  if (suivis.length === 0) {
    return NextResponse.json({ vendeurs: [], produits: [] });
  }

  const vendeurIds = suivis.map((s) => s.vendeurId);

  const [produits, favoris] = await Promise.all([
    prisma.produit.findMany({
      where: { visible: true, vendeurId: { in: vendeurIds } },
      include: { vendeur: SELECTION_VENDEUR },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.favori.findMany({ where: { appareilId }, select: { produitId: true } }),
  ]);

  const idsFavoris = new Set(favoris.map((f) => f.produitId));
  const produitsAvecFavoris = produits.map((p) => ({
    ...p,
    estFavori: idsFavoris.has(p.id),
    vendeur: { ...p.vendeur, verifie: estVendeurVerifie(p.vendeur, p.vendeur.abonnements[0]) },
  }));

  return NextResponse.json({
    vendeurs: suivis.map((s) => ({
      ...s.vendeur,
      verifie: estVendeurVerifie(s.vendeur, s.vendeur.abonnements[0]),
    })),
    produits: produitsAvecFavoris,
  });
}

// POST /api/suivis — bascule le suivi d'une boutique pour cet appareil.
export async function POST(req: NextRequest) {
  const appareilId = idAppareil();
  const { vendeurId } = await req.json().catch(() => ({ vendeurId: undefined }));

  if (!vendeurId) {
    return NextResponse.json({ erreur: "vendeurId manquant" }, { status: 400 });
  }

  const existant = await prisma.suivi.findUnique({
    where: { appareilId_vendeurId: { appareilId, vendeurId } },
  });

  if (existant) {
    await prisma.suivi.delete({ where: { id: existant.id } });
    const nbSuivis = await prisma.suivi.count({ where: { vendeurId } });
    return NextResponse.json({ ok: true, suivi: false, nbSuivis });
  }

  await prisma.suivi.create({ data: { appareilId, vendeurId } });
  const nbSuivis = await prisma.suivi.count({ where: { vendeurId } });
  return NextResponse.json({ ok: true, suivi: true, nbSuivis });
}
