import { NextRequest, NextResponse } from "next/server";
import { notifierRappelMarche, RAPPELS_MARCHE } from "@/lib/notifications";

/**
 * Rappel marché — diffusion générale à tous les clients (voir
 * lib/notifications.ts::RAPPELS_MARCHE), appelée par TROIS Cron Jobs Railway
 * distincts (un par créneau : matin / midi / soir), chacun avec son propre
 * `index` dans l'URL — voir README.md pour la configuration exacte.
 *
 * Un seul cron par créneau, jamais plus : c'est ce qui espace les envois et
 * évite la fatigue de notification.
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const indexBrut = req.nextUrl.searchParams.get("index");
  const index = Number(indexBrut);
  if (indexBrut === null || !Number.isInteger(index) || !RAPPELS_MARCHE[index]) {
    return NextResponse.json(
      { erreur: `index invalide (0 à ${RAPPELS_MARCHE.length - 1} requis)` },
      { status: 400 }
    );
  }

  const resultat = await notifierRappelMarche(index);
  return NextResponse.json({ ok: true, ...resultat });
}
