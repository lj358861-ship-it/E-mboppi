import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireSession } from "@/lib/auth";

// GET /api/admin/produits — toutes les annonces (visibles ou non) pour la modération admin
export async function GET() {
  const session = lireSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ erreur: "Réservé à l'administrateur" }, { status: 403 });
  }

  const produits = await prisma.produit.findMany({
    include: {
      vendeur: { select: { nomBoutique: true } },
    },
    orderBy: [{ boost: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ produits });
}
