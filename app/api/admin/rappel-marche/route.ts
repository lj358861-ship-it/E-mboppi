import { NextRequest, NextResponse } from "next/server";
import { lireSession } from "@/lib/auth";
import { notifierRappelMarche, RAPPELS_MARCHE } from "@/lib/notifications";

// POST /api/admin/rappel-marche — déclenche à la main l'un des 3 rappels
// marché (matin/midi/soir, voir lib/notifications.ts::RAPPELS_MARCHE), sans
// attendre l'heure du cron Railway ni bricoler un curl avec CRON_SECRET.
// Utilise directement la session admin comme protection — c'est le même
// message, envoyé aux mêmes clients, que le vrai cron de production.
export async function POST(req: NextRequest) {
  const session = lireSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ erreur: "Réservé à l'administrateur" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const index = Number(body.index);
  if (!Number.isInteger(index) || !RAPPELS_MARCHE[index]) {
    return NextResponse.json(
      { erreur: `index invalide (0 à ${RAPPELS_MARCHE.length - 1} requis)` },
      { status: 400 }
    );
  }

  const resultat = await notifierRappelMarche(index);
  return NextResponse.json({ ok: true, ...resultat });
}
