import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifierMotDePasse, creerSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { telephone, motDePasse } = await req.json();

  const utilisateur = await prisma.utilisateur.findUnique({ where: { telephone } });
  if (!utilisateur || !(await verifierMotDePasse(motDePasse, utilisateur.motDePasse))) {
    return NextResponse.json({ erreur: "Numéro ou mot de passe incorrect" }, { status: 401 });
  }

  creerSession({ id: utilisateur.id, role: utilisateur.role, nom: utilisateur.nom });
  return NextResponse.json({ ok: true, role: utilisateur.role });
}
