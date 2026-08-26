import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { idAppareil, obtenirProfilAppareil } from "@/lib/appareil";

// GET /api/appareil — profil (pseudo) de CET appareil, créé automatiquement
// au premier appel s'il n'existe pas encore, avec ses compteurs
// favoris/boutiques suivies. Aucun compte requis : c'est la base de la
// page /mon-profil côté client.
export async function GET() {
  const profil = await obtenirProfilAppareil();

  const [nbFavoris, nbSuivis] = await Promise.all([
    prisma.favori.count({ where: { appareilId: profil.appareilId } }),
    prisma.suivi.count({ where: { appareilId: profil.appareilId } }),
  ]);

  return NextResponse.json({ pseudo: profil.pseudo, nbFavoris, nbSuivis });
}

// PATCH /api/appareil — le client change le pseudo attribué à cet appareil.
export async function PATCH(req: NextRequest) {
  const appareilId = idAppareil();
  const { pseudo } = await req.json().catch(() => ({ pseudo: undefined }));

  const propre = typeof pseudo === "string" ? pseudo.trim() : "";
  if (!propre || propre.length > 24) {
    return NextResponse.json(
      { erreur: "Le pseudo doit contenir entre 1 et 24 caractères." },
      { status: 400 }
    );
  }

  const profil = await prisma.profilAppareil.upsert({
    where: { appareilId },
    update: { pseudo: propre },
    create: { appareilId, pseudo: propre },
  });

  return NextResponse.json({ ok: true, pseudo: profil.pseudo });
}
