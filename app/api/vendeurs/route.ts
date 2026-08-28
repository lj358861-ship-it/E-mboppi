import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireSession, creerSession, hacherMotDePasse } from "@/lib/auth";
import { joursRestants } from "@/lib/abonnement";
import { supprimerDeCloudinary } from "@/lib/cloudinary";

// GET /api/vendeurs — liste pour le dashboard admin, avec jours restants
export async function GET() {
  const session = lireSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ erreur: "Réservé à l'administrateur" }, { status: 403 });
  }

  const vendeurs = await prisma.vendeur.findMany({
    include: {
      utilisateur: { select: { nom: true, telephone: true, whatsapp: true } },
      abonnements: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const resultat = vendeurs.map((v: (typeof vendeurs)[number]) => {
    const abo = v.abonnements[0];
    return {
      id: v.id,
      nomBoutique: v.nomBoutique,
      nom: v.utilisateur.nom,
      telephone: v.utilisateur.telephone,
      whatsapp: v.utilisateur.whatsapp,
      certifie: v.certifie,
      abonnementId: abo?.id ?? null,
      statutAbonnement: abo?.statut ?? "AUCUN",
      joursRestants: abo ? joursRestants(abo.dateFin) : 0,
      preuvePaiementUrl: abo?.preuvePaiementUrl ?? null,
    };
  });

  return NextResponse.json({ vendeurs: resultat });
}

// POST /api/vendeurs — un client se déclare vendeur (formulaire "À propos")
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { nom, telephone, whatsapp, motDePasse, nomBoutique, ville, description } = body;

  const existant = await prisma.utilisateur.findUnique({ where: { telephone } });
  if (existant) {
    return NextResponse.json({ erreur: "Ce numéro est déjà enregistré." }, { status: 400 });
  }

  const utilisateur = await prisma.utilisateur.create({
    data: {
      nom,
      telephone,
      whatsapp: whatsapp || telephone,
      motDePasse: await hacherMotDePasse(motDePasse),
      role: "VENDEUR",
      vendeur: {
        create: {
          nomBoutique,
          ville,
          description,
          abonnements: {
            create: {
              statut: "EN_ATTENTE_VALIDATION",
              dateFin: new Date(), // sera fixée à la validation du paiement
            },
          },
        },
      },
    },
    include: { vendeur: true },
  });

  creerSession({ id: utilisateur.id, role: "VENDEUR", nom: utilisateur.nom });

  return NextResponse.json({ ok: true, vendeurId: utilisateur.vendeur!.id });
}

// PATCH /api/vendeurs — un vendeur connecté modifie son propre profil (photo de profil, description, ville)
export async function PATCH(req: NextRequest) {
  const session = lireSession();
  if (!session || session.role !== "VENDEUR") {
    return NextResponse.json({ erreur: "Réservé aux vendeurs" }, { status: 403 });
  }

  const vendeur = await prisma.vendeur.findUnique({ where: { utilisateurId: session.id } });
  if (!vendeur) {
    return NextResponse.json({ erreur: "Profil vendeur introuvable" }, { status: 404 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (typeof body.nomBoutique === "string" && body.nomBoutique.trim()) data.nomBoutique = body.nomBoutique.trim();
  if (typeof body.description === "string") data.description = body.description;
  if (typeof body.ville === "string") data.ville = body.ville;

  if (typeof body.logoUrl === "string" && body.logoUrl) {
    // Supprime l'ancien logo sur Cloudinary avant d'enregistrer le nouveau
    if (vendeur.logoPublicId) await supprimerDeCloudinary(vendeur.logoPublicId, "image");
    data.logoUrl = body.logoUrl;
    data.logoPublicId = body.logoPublicId || null;
  }

  if (typeof body.photoCouvertureUrl === "string" && body.photoCouvertureUrl) {
    // Supprime l'ancienne bannière sur Cloudinary avant d'enregistrer la nouvelle
    if (vendeur.photoCouverturePublicId) {
      await supprimerDeCloudinary(vendeur.photoCouverturePublicId, "image");
    }
    data.photoCouvertureUrl = body.photoCouvertureUrl;
    data.photoCouverturePublicId = body.photoCouverturePublicId || null;
  }

  const vendeurMisAJour = await prisma.vendeur.update({ where: { id: vendeur.id }, data });

  return NextResponse.json({ ok: true, vendeur: vendeurMisAJour });
}
