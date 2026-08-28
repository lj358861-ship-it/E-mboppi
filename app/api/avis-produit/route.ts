import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { idAppareil, lireIdAppareil, obtenirProfilAppareil } from "@/lib/appareil";
import { lireSession } from "@/lib/auth";
import { estVendeurVerifie } from "@/lib/abonnement";

// GET /api/avis-produit?produitId=xxx — liste des avis d'un article, moyenne,
// et si CET appareil a déjà laissé un avis (pour afficher "Modifier mon avis"
// plutôt que de permettre un doublon). Même logique que /api/avis (boutique).
export async function GET(req: NextRequest) {
  const produitId = req.nextUrl.searchParams.get("produitId");
  if (!produitId) {
    return NextResponse.json({ erreur: "produitId manquant" }, { status: 400 });
  }

  const avis = await prisma.avisProduit.findMany({
    where: { produitId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const appareilId = lireIdAppareil();

  const nbAvis = avis.length;
  const moyenne = nbAvis > 0 ? avis.reduce((s, a) => s + a.note, 0) / nbAvis : 0;
  const monAvis = appareilId ? avis.find((a) => a.appareilId === appareilId) || null : null;

  return NextResponse.json({ avis, nbAvis, moyenne, monAvis });
}

// POST /api/avis-produit — crée ou met à jour l'avis de cet appareil pour un
// article précis. Même logique que /api/avis : un vendeur connecté qui note
// l'article d'un autre vendeur s'affiche sous le nom de sa boutique (+ badge
// vérifié si SA boutique est certifiée au moment de l'avis).
export async function POST(req: NextRequest) {
  const appareilId = idAppareil();
  const { produitId, note, commentaire } = await req.json().catch(() => ({}));

  if (!produitId || typeof note !== "number" || note < 1 || note > 5) {
    return NextResponse.json({ erreur: "Note invalide (1 à 5 requis)" }, { status: 400 });
  }

  const produit = await prisma.produit.findUnique({ where: { id: produitId }, select: { vendeurId: true } });
  if (!produit) {
    return NextResponse.json({ erreur: "Article introuvable" }, { status: 404 });
  }

  let nomClient = "";
  let auteurVendeurId: string | null = null;
  let auteurCertifie = false;

  const session = lireSession();
  if (session?.role === "VENDEUR") {
    const monVendeur = await prisma.vendeur.findUnique({
      where: { utilisateurId: session.id },
      include: { abonnements: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    if (monVendeur?.id === produit.vendeurId) {
      return NextResponse.json({ erreur: "Vous ne pouvez pas noter votre propre article" }, { status: 400 });
    }

    if (monVendeur) {
      auteurVendeurId = monVendeur.id;
      nomClient = monVendeur.nomBoutique;
      auteurCertifie = estVendeurVerifie(monVendeur, monVendeur.abonnements[0]);
    }
  }

  if (!auteurVendeurId) {
    const profil = await obtenirProfilAppareil();
    nomClient = profil.pseudo;
  }

  const avis = await prisma.avisProduit.upsert({
    where: { appareilId_produitId: { appareilId, produitId } },
    update: {
      note,
      commentaire: commentaire?.slice(0, 300) || null,
      nomClient,
      auteurVendeurId,
      auteurCertifie,
    },
    create: {
      appareilId,
      produitId,
      note,
      commentaire: commentaire?.slice(0, 300) || null,
      nomClient,
      auteurVendeurId,
      auteurCertifie,
    },
  });

  return NextResponse.json({ ok: true, avis });
}
