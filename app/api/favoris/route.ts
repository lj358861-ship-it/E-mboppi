import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireSession } from "@/lib/auth";

export async function GET() {
  const session = lireSession();
  if (!session) return NextResponse.json({ erreur: "Non connecté" }, { status: 401 });

  const favoris = await prisma.favori.findMany({
    where: { clientId: session.id },
    include: { produit: { include: { vendeur: true } } },
  });
  return NextResponse.json({ favoris });
}

export async function POST(req: NextRequest) {
  const session = lireSession();
  if (!session) return NextResponse.json({ erreur: "Non connecté" }, { status: 401 });

  const { produitId } = await req.json();
  const existant = await prisma.favori.findUnique({
    where: { clientId_produitId: { clientId: session.id, produitId } },
  });

  if (existant) {
    await prisma.favori.delete({ where: { id: existant.id } });
    return NextResponse.json({ ok: true, favori: false });
  }

  await prisma.favori.create({ data: { clientId: session.id, produitId } });
  return NextResponse.json({ ok: true, favori: true });
}
