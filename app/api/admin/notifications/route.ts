import { NextRequest, NextResponse } from "next/server";
import { lireSession } from "@/lib/auth";
import { notificationsPushDisponibles, envoyerNotificationTous } from "@/lib/push";

// POST /api/admin/notifications — diffusion "de test" à TOUTES les
// souscriptions push (clients ET vendeurs), déclenchée par le bouton
// "Envoyer à tous" du tableau de bord admin. Sert à vérifier que le push
// fonctionne réellement (récepteur, permission navigateur, VAPID...), sans
// devoir attendre un cron ou une action métier.
export async function POST(req: NextRequest) {
  const session = lireSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ erreur: "Réservé à l'administrateur" }, { status: 403 });
  }

  if (!notificationsPushDisponibles()) {
    return NextResponse.json(
      { erreur: "Notifications push non configurées (clés VAPID manquantes)" },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const titre = typeof body.titre === "string" ? body.titre.trim() : "";
  const corps = typeof body.corps === "string" ? body.corps.trim() : "";
  const url = typeof body.url === "string" && body.url.trim() ? body.url.trim() : undefined;

  if (!titre || !corps) {
    return NextResponse.json({ erreur: "Titre et message requis" }, { status: 400 });
  }

  const resultat = await envoyerNotificationTous({ titre, corps, url });
  return NextResponse.json({ ok: true, ...resultat });
}
