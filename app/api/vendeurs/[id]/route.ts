import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireSession } from "@/lib/auth";

// GET /api/vendeurs/[id] — profil public d'un vendeur + son catalogue (articles visibles)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const vendeur = await prisma.vendeur.findUnique({
    where: { id: params.id },
    include: {
      utilisateur: { select: { whatsapp: true } },
      produits: {
        where: { visible: true },
        orderBy: [{ boost: "desc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!vendeur) {
    return NextResponse.json({ erreur: "Vendeur introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    vendeur: {
      id: vendeur.id,
      nomBoutique: vendeur.nomBoutique,
      description: vendeur.description,
      ville: vendeur.ville,
      logoUrl: vendeur.logoUrl,
      whatsapp: vendeur.utilisateur.whatsapp,
      nombreArticles: vendeur.produits.length,
      produits: vendeur.produits,
    },
  });
}

// DELETE /api/vendeurs/[id] — supprime un vendeur, ses annonces, abonnements et son compte (admin uniquement)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = lireSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ erreur: "Réservé à l'administrateur" }, { status: 403 });
  }

  const vendeur = await prisma.vendeur.findUnique({ where: { id: params.id } });
  if (!vendeur) {
    return NextResponse.json({ erreur: "Vendeur introuvable" }, { status: 404 });
  }

  const utilisateurId = vendeur.utilisateurId;

  await prisma.favori.deleteMany({ where: { produit: { vendeurId: vendeur.id } } });
  await prisma.produit.deleteMany({ where: { vendeurId: vendeur.id } });
  await prisma.abonnement.deleteMany({ where: { vendeurId: vendeur.id } });
  await prisma.vendeur.delete({ where: { id: vendeur.id } });

  await prisma.favori.deleteMany({ where: { clientId: utilisateurId } });
  await prisma.utilisateur.delete({ where: { id: utilisateurId } });

  return NextResponse.json({ ok: true });
}
