import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireSession } from "@/lib/auth";

// GET /api/messages/non-lus — nombre de messages non lus reçus par l'utilisateur
// connecté, utilisé pour le badge "nouveau message" du tableau de bord.
export async function GET() {
  const session = lireSession();
  if (!session) return NextResponse.json({ erreur: "Non connecté" }, { status: 401 });

  const nbNonLus = await prisma.message.count({
    where: { destinataireId: session.id, lu: false },
  });

  return NextResponse.json({ nbNonLus });
}
