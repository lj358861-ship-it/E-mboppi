import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireSession } from "@/lib/auth";
import { supprimerDeCloudinary } from "@/lib/cloudinary";

// PATCH /api/produits/[id] — booster / débooster une annonce (admin uniquement)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = lireSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ erreur: "Réservé à l'administrateur" }, { status: 403 });
  }

  const body = await req.json();
  const boost = Boolean(body.boost);

  const produit = await prisma.produit.update({
    where: { id: params.id },
    data: {
      boost,
      boostedAt: boost ? new Date() : null,
    },
  });

  return NextResponse.json({ ok: true, produit });
}

// DELETE /api/produits/[id] — supprimer une annonce (admin uniquement)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = lireSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ erreur: "Réservé à l'administrateur" }, { status: 403 });
  }

  const produit = await prisma.produit.findUnique({ where: { id: params.id } });

  await prisma.favori.deleteMany({ where: { produitId: params.id } });
  await prisma.produit.delete({ where: { id: params.id } });

  if (produit) {
    await Promise.all([
      ...produit.photosPublicIds.map((id: string) => supprimerDeCloudinary(id, "image")),
      supprimerDeCloudinary(produit.videoPublicId, "video"),
    ]);
  }

  return NextResponse.json({ ok: true });
}
