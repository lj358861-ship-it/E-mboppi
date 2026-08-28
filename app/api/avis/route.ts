import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { idAppareil, lireIdAppareil, obtenirProfilAppareil } from "@/lib/appareil";
import { lireSession } from "@/lib/auth";
import { estVendeurVerifie } from "@/lib/abonnement";

// GET /api/avis?vendeurId=xxx — liste des avis d'une boutique, moyenne, et
// si CET appareil a déjà laissé un avis (pour afficher "Modifier mon avis"
// plutôt que de permettre un doublon).
export async function GET(req: NextRequest) {
  const vendeurId = req.nextUrl.searchParams.get("vendeurId");
  if (!vendeurId) {
    return NextResponse.json({ erreur: "vendeurId manquant" }, { status: 400 });
  }

  const avis = await prisma.avis.findMany({
    where: { vendeurId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const appareilId = lireIdAppareil();

  const nbAvis = avis.length;
  const moyenne = nbAvis > 0 ? avis.reduce((s, a) => s + a.note, 0) / nbAvis : 0;
  const monAvis = appareilId ? avis.find((a) => a.appareilId === appareilId) || null : null;

  return NextResponse.json({ avis, nbAvis, moyenne, monAvis });
}

// POST /api/avis — crée ou met à jour l'avis de cet appareil pour une boutique.
// Le pseudo affiché à côté du commentaire (voir /mon-profil) est utilisé pour
// un client anonyme — SAUF si l'auteur est connecté en tant que vendeur : un
// vendeur peut aussi être client d'une autre boutique (on ne sait jamais), et
// dans ce cas l'avis s'affiche toujours sous le nom de SA boutique plutôt que
// sous un pseudo, certifiée ou non — seul le badge vérifié dépend, lui, de la
// certification (voir Avis.auteurCertifie dans le schéma).
export async function POST(req: NextRequest) {
  const appareilId = idAppareil();
  const { vendeurId, note, commentaire } = await req.json().catch(() => ({}));

  if (!vendeurId || typeof note !== "number" || note < 1 || note > 5) {
    return NextResponse.json({ erreur: "Note invalide (1 à 5 requis)" }, { status: 400 });
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

    if (monVendeur?.id === vendeurId) {
      return NextResponse.json({ erreur: "Vous ne pouvez pas noter votre propre boutique" }, { status: 400 });
    }

    // Toujours le nom de sa boutique (même non certifiée) plutôt qu'un
    // pseudo anonyme — seul le badge dépend de la certification.
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

  const avis = await prisma.avis.upsert({
    where: { appareilId_vendeurId: { appareilId, vendeurId } },
    update: {
      note,
      commentaire: commentaire?.slice(0, 300) || null,
      nomClient,
      auteurVendeurId,
      auteurCertifie,
    },
    create: {
      appareilId,
      vendeurId,
      note,
      commentaire: commentaire?.slice(0, 300) || null,
      nomClient,
      auteurVendeurId,
      auteurCertifie,
    },
  });

  return NextResponse.json({ ok: true, avis });
}
