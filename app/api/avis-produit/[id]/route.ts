import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireSession } from "@/lib/auth";

// DELETE /api/avis-produit/[id] — réservé à l'admin : supprime un avis
// laissé sur un article précis (voir AvisProduit). Même règle que
// /api/avis/[id] pour les avis boutique.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = lireSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ erreur: "Réservé à l'administrateur" }, { status: 403 });
  }

  try {
    const avis = await prisma.avisProduit.findUnique({ where: { id: params.id } });
    if (!avis) {
      // Déjà supprimé : on répond ok pour que l'UI se resynchronise proprement.
      return NextResponse.json({ ok: true });
    }

    await prisma.avisProduit.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (erreur) {
    console.error("Erreur DELETE /api/avis-produit/[id]:", erreur);
    return NextResponse.json({ erreur: "Échec de la suppression de l'avis" }, { status: 500 });
  }
}
