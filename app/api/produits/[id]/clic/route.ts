import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/produits/[id]/clic — incrémente le compteur de clics "Contacter"
// (bouton WhatsApp) sur la fiche produit. Public, pas d'authentification :
// c'est un simple compteur de statistiques pour le vendeur.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.produit.update({
      where: { id: params.id },
      data: { clicsContact: { increment: 1 } },
    });
  } catch {
    // Article introuvable ou déjà supprimé — on ignore silencieusement,
    // ce n'est qu'un compteur de statistiques, pas une opération critique.
  }
  return NextResponse.json({ ok: true });
}
