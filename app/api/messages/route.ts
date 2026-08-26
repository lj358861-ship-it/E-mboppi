import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireSession } from "@/lib/auth";

// GET /api/messages?avec=<utilisateurId> — conversation entre l'utilisateur connecté et un autre.
// Marque au passage comme lus les messages reçus de cette personne (badge de
// notification à jour dès l'ouverture de la conversation).
export async function GET(req: NextRequest) {
  const session = lireSession();
  if (!session) return NextResponse.json({ erreur: "Non connecté" }, { status: 401 });

  const avec = req.nextUrl.searchParams.get("avec");
  if (!avec) return NextResponse.json({ erreur: "Paramètre 'avec' requis" }, { status: 400 });

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { expediteurId: session.id, destinataireId: avec },
        { expediteurId: avec, destinataireId: session.id },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  prisma.message
    .updateMany({ where: { expediteurId: avec, destinataireId: session.id, lu: false }, data: { lu: true } })
    .catch(() => {});

  return NextResponse.json({ messages });
}

// POST /api/messages — envoyer un message
export async function POST(req: NextRequest) {
  const session = lireSession();
  if (!session) return NextResponse.json({ erreur: "Non connecté" }, { status: 401 });

  const { destinataireId, contenu } = await req.json();
  const message = await prisma.message.create({
    data: { expediteurId: session.id, destinataireId, contenu },
  });

  return NextResponse.json({ ok: true, message });
}
