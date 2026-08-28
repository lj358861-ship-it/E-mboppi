import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { classerParPertinence } from "@/lib/fuzzy";
import { estVendeurVerifie } from "@/lib/abonnement";

// GET /api/vendeurs/recherche?q=nom+de+boutique
// Endpoint public utilisé par l'onglet "Vendeurs" de la recherche.
// Ne retourne que les boutiques ayant au moins un article visible
// (abonnement actif), pour éviter de faire apparaître des boutiques
// fantômes dans les résultats.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || undefined;

  const filtreBase = { produits: { some: { visible: true } } };

  const selection = {
    id: true,
    nomBoutique: true,
    logoUrl: true,
    ville: true,
    certifie: true,
    createdAt: true,
    abonnements: { orderBy: { createdAt: "desc" as const }, take: 1, select: { statut: true } },
    _count: { select: { produits: { where: { visible: true } } } },
  } as const;

  type VendeurAvecVerification = { certifie?: boolean; createdAt: Date; abonnements: { statut: string }[] };

  function avecVerification<T extends VendeurAvecVerification>(vendeurs: T[]) {
    return vendeurs.map((v) => ({ ...v, verifie: estVendeurVerifie(v, v.abonnements[0]) }));
  }

  if (!q) {
    const vendeurs = await prisma.vendeur.findMany({
      where: filtreBase,
      select: selection,
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    return NextResponse.json({ vendeurs: avecVerification(vendeurs) });
  }

  // Passe 1 : correspondance stricte
  const stricts = await prisma.vendeur.findMany({
    where: { ...filtreBase, nomBoutique: { contains: q, mode: "insensitive" } },
    select: selection,
    take: 30,
  });
  if (stricts.length > 0) {
    return NextResponse.json({ vendeurs: avecVerification(stricts) });
  }

  // Passe 2 : tolérance aux fautes de frappe
  const candidats = await prisma.vendeur.findMany({
    where: filtreBase,
    select: selection,
    take: 300,
  });
  const classes = classerParPertinence<(typeof candidats)[number]>(q, candidats, (v) => `${v.nomBoutique} ${v.ville || ""}`).slice(
    0,
    30
  );

  return NextResponse.json({ vendeurs: avecVerification(classes) });
}
