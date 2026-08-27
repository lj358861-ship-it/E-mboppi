import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireSession } from "@/lib/auth";

// GET /api/admin/avis — tous les avis de la plateforme, boutique par
// boutique, pour la modération admin (repérer les avis faux ou
// irrespectueux et les supprimer).
export async function GET() {
  const session = lireSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ erreur: "Réservé à l'administrateur" }, { status: 403 });
  }

  const avis = await prisma.avis.findMany({
    include: { vendeur: { select: { nomBoutique: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ avis });
}
