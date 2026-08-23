import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireSession } from "@/lib/auth";

// GET /api/admin/stats — chiffre d'affaires et indicateurs pour le tableau de bord admin
export async function GET() {
  const session = lireSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ erreur: "Réservé à l'administrateur" }, { status: 403 });
  }

  const [
    nombreVendeurs,
    nombreAnnonces,
    annoncesVisibles,
    annoncesBoostees,
    nombreClients,
    abonnementsActifs,
    abonnementsEnAttente,
    revenu,
  ] = await Promise.all([
    prisma.vendeur.count(),
    prisma.produit.count(),
    prisma.produit.count({ where: { visible: true } }),
    prisma.produit.count({ where: { boost: true } }),
    prisma.utilisateur.count({ where: { role: "CLIENT" } }),
    prisma.abonnement.count({ where: { statut: "ACTIF" } }),
    prisma.abonnement.count({ where: { statut: "EN_ATTENTE_VALIDATION" } }),
    prisma.abonnement.aggregate({
      _sum: { montant: true },
      where: { dateValidation: { not: null } },
    }),
  ]);

  return NextResponse.json({
    chiffreAffaires: revenu._sum.montant ?? 0,
    nombreVendeurs,
    nombreAnnonces,
    annoncesVisibles,
    annoncesBoostees,
    nombreClients,
    abonnementsActifs,
    abonnementsEnAttente,
  });
}
