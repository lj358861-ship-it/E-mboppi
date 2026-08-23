import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireSession } from "@/lib/auth";

// GET /api/produits?q=chaussures&categorie=mode
// Ne retourne que les produits visibles (vendeur avec abonnement actif)
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || undefined;
  const categorie = req.nextUrl.searchParams.get("categorie") || undefined;

  const produits = await prisma.produit.findMany({
    where: {
      visible: true,
      ...(q ? { titre: { contains: q, mode: "insensitive" } } : {}),
      ...(categorie ? { categorie } : {}),
    },
    include: {
      vendeur: { select: { nomBoutique: true, utilisateur: { select: { whatsapp: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return NextResponse.json({ produits });
}

// POST /api/produits — un vendeur ajoute un produit (visible = statut de son abonnement)
export async function POST(req: NextRequest) {
  const session = lireSession();
  if (!session || session.role !== "VENDEUR") {
    return NextResponse.json({ erreur: "Réservé aux vendeurs" }, { status: 403 });
  }

  const vendeur = await prisma.vendeur.findUnique({
    where: { utilisateurId: session.id },
    include: { abonnements: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!vendeur) {
    return NextResponse.json({ erreur: "Profil vendeur introuvable" }, { status: 404 });
  }

  const abonnementActif = vendeur.abonnements[0]?.statut === "ACTIF";

  const body = await req.json();
  const produit = await prisma.produit.create({
    data: {
      vendeurId: vendeur.id,
      titre: body.titre,
      description: body.description,
      prix: body.prix,
      categorie: body.categorie,
      videoUrl: body.videoUrl,
      imageUrl: body.imageUrl,
      visible: abonnementActif,
    },
  });

  return NextResponse.json({ ok: true, produit });
}
