import { NextRequest, NextResponse } from "next/server";
import { verifierAbonnementsExpires } from "@/lib/abonnement";

/**
 * Appelé chaque jour par le Cron Job Railway (voir railway.json).
 * Protégé par un secret pour éviter que n'importe qui déclenche la tâche.
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const resultat = await verifierAbonnementsExpires();
  return NextResponse.json({ ok: true, ...resultat });
}
