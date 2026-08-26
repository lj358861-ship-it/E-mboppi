import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { idAppareil, lireIdAppareil } from "@/lib/appareil";

// GET /api/avis?vendeurId=xxx — liste des avis d'une boutique, moyenne, et
// si CET appareil a déjà laissé un avis (pour afficher "Modifier mon avis"
// plutôt que de permettre un doublon).
export async function GET(req: NextRequest) {
  const vendeurId = req.nextUrl.searchParams.get("vendeurId");
  if (!vendeurId) {
    return NextResponse.json({ erreur: "vendeurId manquant" }, { status: 400 });
  }

  const [avis, appareilId] = [
    await prisma.avis.findMany({
      where: { vendeurId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    lireIdAppareil(),
  ];

  const nbAvis = avis.length;
  const moyenne = nbAvis > 0 ? avis.reduce((s, a) => s + a.note, 0) / nbAvis : 0;
  const monAvis = appareilId ? avis.find((a) => a.appareilId === appareilId) || null : null;

  return NextResponse.json({ avis, nbAvis, moyenne, monAvis });
}

// POST /api/avis — crée ou met à jour l'avis de cet appareil pour une boutique.
export async function POST(req: NextRequest) {
  const appareilId = idAppareil();
  const { vendeurId, note, commentaire, nomClient } = await req.json().catch(() => ({}));

  if (!vendeurId || typeof note !== "number" || note < 1 || note > 5) {
    return NextResponse.json({ erreur: "Note invalide (1 à 5 requis)" }, { status: 400 });
  }

  const avis = await prisma.avis.upsert({
    where: { appareilId_vendeurId: { appareilId, vendeurId } },
    update: { note, commentaire: commentaire?.slice(0, 300) || null, nomClient: nomClient?.slice(0, 60) || null },
    create: {
      appareilId,
      vendeurId,
      note,
      commentaire: commentaire?.slice(0, 300) || null,
      nomClient: nomClient?.slice(0, 60) || null,
    },
  });

  return NextResponse.json({ ok: true, avis });
}
