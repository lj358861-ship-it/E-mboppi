import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { idAppareil } from "@/lib/appareil";
import { estVendeurVerifie } from "@/lib/abonnement";

const SELECTION_VENDEUR = {
  select: {
    id: true,
    nomBoutique: true,
    certifie: true,
    createdAt: true,
    abonnements: { orderBy: { createdAt: "desc" }, take: 1, select: { statut: true } },
    utilisateur: { select: { whatsapp: true } },
  },
} as const;

// GET /api/favoris — favoris enregistrés pour CET appareil (cookie anonyme,
// pas besoin de compte client). Le cookie est créé au premier appel s'il
// n'existe pas encore.
export async function GET() {
  const appareilId = idAppareil();

  const favoris = await prisma.favori.findMany({
    where: { appareilId },
    orderBy: { createdAt: "desc" },
    include: { produit: { include: { vendeur: SELECTION_VENDEUR } } },
  });

  const favorisAvecVerification = favoris.map((f) => ({
    ...f,
    produit: {
      ...f.produit,
      vendeur: { ...f.produit.vendeur, verifie: estVendeurVerifie(f.produit.vendeur, f.produit.vendeur.abonnements[0]) },
    },
  }));

  return NextResponse.json({ favoris: favorisAvecVerification });
}

// POST /api/favoris — bascule le statut favori d'un produit pour cet
// appareil. Une fois marqué, l'article reste favori sur cet appareil tant
// qu'on ne le retire pas explicitement (pas besoin de le remarquer).
export async function POST(req: NextRequest) {
  const appareilId = idAppareil();
  const { produitId } = await req.json().catch(() => ({ produitId: undefined }));

  if (!produitId) {
    return NextResponse.json({ erreur: "produitId manquant" }, { status: 400 });
  }

  const existant = await prisma.favori.findUnique({
    where: { appareilId_produitId: { appareilId, produitId } },
  });

  if (existant) {
    await prisma.favori.delete({ where: { id: existant.id } });
    return NextResponse.json({ ok: true, favori: false });
  }

  await prisma.favori.create({ data: { appareilId, produitId } });
  return NextResponse.json({ ok: true, favori: true });
}
