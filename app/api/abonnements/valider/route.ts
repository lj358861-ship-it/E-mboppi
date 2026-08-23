import { NextRequest, NextResponse } from "next/server";
import { lireSession } from "@/lib/auth";
import { validerPaiement } from "@/lib/abonnement";

export async function POST(req: NextRequest) {
  const session = lireSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ erreur: "Réservé à l'administrateur" }, { status: 403 });
  }

  const { abonnementId } = await req.json();
  if (!abonnementId) {
    return NextResponse.json({ erreur: "abonnementId requis" }, { status: 400 });
  }

  const abonnement = await validerPaiement(abonnementId, session.id);
  return NextResponse.json({ ok: true, abonnement });
}
