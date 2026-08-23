import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireSession } from "@/lib/auth";

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

  await prisma.message.deleteMany({
    where: { OR: [{ expediteurId: utilisateurId }, { destinataireId: utilisateurId }] },
  });
  await prisma.favori.deleteMany({ where: { clientId: utilisateurId } });
  await prisma.utilisateur.delete({ where: { id: utilisateurId } });

  return NextResponse.json({ ok: true });
}
