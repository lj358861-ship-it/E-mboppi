import { NextResponse } from "next/server";
import { lireSession } from "@/lib/auth";

// GET /api/auth/session — utilisé côté client (Navigation) pour savoir si
// un vendeur/admin est déjà connecté, et adapter les liens du menu
// (afficher "Mon profil" au lieu de "Connexion") sans jamais le déconnecter
// juste parce qu'il navigue sur le site.
export async function GET() {
  const session = lireSession();
  if (!session) return NextResponse.json({ connecte: false });
  return NextResponse.json({ connecte: true, role: session.role, nom: session.nom });
}
