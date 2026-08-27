import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { idAppareil, lireIdAppareil, obtenirProfilAppareil } from "@/lib/appareil";

// GET /api/avis?vendeurId=xxx — liste des avis d'une boutique, moyenne, et
// si CET appareil a déjà laissé un avis (pour afficher "Modifier mon avis"
// plutôt que de permettre un doublon).
export async function GET(req: NextRequest) {
  const vendeurId = req.nextUrl.searchParams.get("vendeurId");
  if (!vendeurId) {
    return NextResponse.json({ erreur: "vendeurId manquant" }, { status: 400 });
  }

  const avis = await prisma.avis.findMany({
    where: { vendeurId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const appareilId = lireIdAppareil();

  const nbAvis = avis.length;
  const moyenne = nbAvis > 0 ? avis.reduce((s, a) => s + a.note, 0) / nbAvis : 0;
  const monAvis = appareilId ? avis.find((a) => a.appareilId === appareilId) || null : null;

  return NextResponse.json({ avis, nbAvis, moyenne, monAvis });
}

// POST /api/avis — crée ou met à jour l'avis de cet appareil pour une boutique.
// Le pseudo affiché à côté du commentaire (voir /mon-profil) est toujours
// celui du profil d'appareil courant — jamais une valeur envoyée librement
// par le client — pour que le pseudo affiché soit fiable pour les autres
// visiteurs et pour l'admin en cas de modération.
export async function POST(req: NextRequest) {
  const appareilId = idAppareil();
  const { vendeurId, note, commentaire } = await req.json().catch(() => ({}));

  if (!vendeurId || typeof note !== "number" || note < 1 || note > 5) {
    return NextResponse.json({ erreur: "Note invalide (1 à 5 requis)" }, { status: 400 });
  }

  const profil = await obtenirProfilAppareil();

  const avis = await prisma.avis.upsert({
    where: { appareilId_vendeurId: { appareilId, vendeurId } },
    update: { note, commentaire: commentaire?.slice(0, 300) || null, nomClient: profil.pseudo },
    create: {
      appareilId,
      vendeurId,
      note,
      commentaire: commentaire?.slice(0, 300) || null,
      nomClient: profil.pseudo,
    },
  });

  return NextResponse.json({ ok: true, avis });
}
