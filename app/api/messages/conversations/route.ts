import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireSession } from "@/lib/auth";

// GET /api/messages/conversations — liste des conversations de l'utilisateur
// connecté (un vendeur, en pratique), triées par message le plus récent,
// avec le nombre de messages non lus par conversation.
export async function GET() {
  const session = lireSession();
  if (!session) return NextResponse.json({ erreur: "Non connecté" }, { status: 401 });

  const messages = await prisma.message.findMany({
    where: { OR: [{ expediteurId: session.id }, { destinataireId: session.id }] },
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      expediteur: { select: { id: true, nom: true } },
      destinataire: { select: { id: true, nom: true } },
    },
  });

  type Conversation = {
    utilisateurId: string;
    nom: string;
    dernierMessage: string;
    dernierMessageAt: string;
    nbNonLus: number;
  };

  const conversations = new Map<string, Conversation>();

  for (const m of messages) {
    const autrePersonne = m.expediteurId === session.id ? m.destinataire : m.expediteur;
    if (!conversations.has(autrePersonne.id)) {
      conversations.set(autrePersonne.id, {
        utilisateurId: autrePersonne.id,
        nom: autrePersonne.nom,
        dernierMessage: m.contenu,
        dernierMessageAt: m.createdAt.toISOString(),
        nbNonLus: 0,
      });
    }
    if (m.destinataireId === session.id && !m.lu) {
      conversations.get(autrePersonne.id)!.nbNonLus += 1;
    }
  }

  return NextResponse.json({ conversations: Array.from(conversations.values()) });
}
