import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireSession } from "@/lib/auth";

// POST /api/push/subscribe — enregistre la souscription push du navigateur
// pour le vendeur connecté (rappels de renouvellement d'abonnement).
export async function POST(req: NextRequest) {
  const session = lireSession();
  if (!session) return NextResponse.json({ erreur: "Non connecté" }, { status: 401 });

  const { endpoint, keys } = await req.json().catch(() => ({}));
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ erreur: "Souscription invalide" }, { status: 400 });
  }

  await prisma.abonnementPush.upsert({
    where: { endpoint },
    update: { utilisateurId: session.id, p256dh: keys.p256dh, auth: keys.auth },
    create: { utilisateurId: session.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
  });

  return NextResponse.json({ ok: true });
}

// DELETE /api/push/subscribe — retire une souscription (désactivation des rappels).
export async function DELETE(req: NextRequest) {
  const { endpoint } = await req.json().catch(() => ({}));
  if (!endpoint) return NextResponse.json({ erreur: "endpoint manquant" }, { status: 400 });

  await prisma.abonnementPush.deleteMany({ where: { endpoint } });
  return NextResponse.json({ ok: true });
}
