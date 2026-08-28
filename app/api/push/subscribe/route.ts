import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireSession } from "@/lib/auth";
import { idAppareil } from "@/lib/appareil";

// POST /api/push/subscribe — enregistre la souscription push du navigateur.
// - Vendeur connecté : rattachée à son compte (utilisateurId) — rappels de
//   renouvellement d'abonnement.
// - Client (pas de compte) : rattachée à son identifiant d'appareil anonyme
//   (appareilId, même cookie que Favori/Suivi/Avis) — boutique suivie qui
//   publie, promo en rapport avec sa dernière recherche, etc.
export async function POST(req: NextRequest) {
  const { endpoint, keys } = await req.json().catch(() => ({}));
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ erreur: "Souscription invalide" }, { status: 400 });
  }

  const session = lireSession();
  const donnees = session
    ? { utilisateurId: session.id, appareilId: null }
    : { utilisateurId: null, appareilId: idAppareil() };

  await prisma.abonnementPush.upsert({
    where: { endpoint },
    update: { ...donnees, p256dh: keys.p256dh, auth: keys.auth },
    create: { ...donnees, endpoint, p256dh: keys.p256dh, auth: keys.auth },
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
