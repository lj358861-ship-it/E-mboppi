import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireSession } from "@/lib/auth";
import { PHOTOS_MAX_PAR_ARTICLE } from "@/lib/media-limits";
import { classerParPertinence } from "@/lib/fuzzy";

const SELECTION_VENDEUR = {
  select: { id: true, nomBoutique: true, logoUrl: true, utilisateur: { select: { whatsapp: true } } },
} as const;

// GET /api/produits?q=chaussures&categorie=mode&type=photo|video|hot&prixMin=1000&prixMax=5000
// Ne retourne que les produits visibles (vendeur avec abonnement actif).
// La recherche par texte (q) tolère les fautes de frappe : on tente d'abord
// une correspondance stricte, puis on élargit avec un classement approximatif
// si la recherche stricte ne donne rien.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || undefined;
  const categorie = req.nextUrl.searchParams.get("categorie") || undefined;
  const type = req.nextUrl.searchParams.get("type") || undefined; // "photo" | "video" | "hot"
  const prixMin = req.nextUrl.searchParams.get("prixMin");
  const prixMax = req.nextUrl.searchParams.get("prixMax");

  const filtrePrix: { gte?: number; lte?: number } = {};
  if (prixMin) filtrePrix.gte = Number(prixMin);
  if (prixMax) filtrePrix.lte = Number(prixMax);

  const filtreType =
    type === "photo" ? { videoUrl: null } : type === "video" ? { videoUrl: { not: null } } : {};

  const filtreBase = {
    visible: true,
    ...(categorie ? { categorie } : {}),
    ...(Object.keys(filtrePrix).length ? { prix: filtrePrix } : {}),
    ...filtreType,
  };

  // Onglet "🔥" : articles mis en avant (promo ou boostés par l'admin)
  if (type === "hot" && !q) {
    const produits = await prisma.produit.findMany({
      where: { ...filtreBase, OR: [{ enPromo: true }, { boost: true }] },
      include: { vendeur: SELECTION_VENDEUR },
      orderBy: [{ enPromo: "desc" }, { boost: "desc" }, { createdAt: "desc" }],
      take: 60,
    });
    return NextResponse.json({ produits });
  }

  if (!q) {
    const produits = await prisma.produit.findMany({
      where: filtreBase,
      include: { vendeur: SELECTION_VENDEUR },
      orderBy: [{ boost: "desc" }, { createdAt: "desc" }],
      take: 60,
    });
    return NextResponse.json({ produits });
  }

  // --- Passe 1 : correspondance stricte (rapide, sur titre/nature/boutique) ---
  const correspondanceStricte = await prisma.produit.findMany({
    where: {
      ...filtreBase,
      OR: [
        { titre: { contains: q, mode: "insensitive" } },
        { nature: { contains: q, mode: "insensitive" } },
        { vendeur: { nomBoutique: { contains: q, mode: "insensitive" } } },
      ],
    },
    include: { vendeur: SELECTION_VENDEUR },
    orderBy: [{ enPromo: "desc" }, { boost: "desc" }, { createdAt: "desc" }],
    take: 60,
  });

  if (correspondanceStricte.length > 0) {
    return NextResponse.json({ produits: correspondanceStricte });
  }

  // --- Passe 2 : fautes de frappe — on élargit et on classe par similarité ---
  const candidats = await prisma.produit.findMany({
    where: filtreBase,
    include: { vendeur: SELECTION_VENDEUR },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const classes = classerParPertinence(q, candidats, (p) =>
    [p.titre, p.nature || "", p.categorie || "", p.vendeur.nomBoutique].join(" ")
  ).slice(0, 60);

  return NextResponse.json({ produits: classes });
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
  const photos: string[] = Array.isArray(body.photos) ? body.photos.slice(0, PHOTOS_MAX_PAR_ARTICLE) : [];
  const photosPublicIds: string[] = Array.isArray(body.photosPublicIds)
    ? body.photosPublicIds.slice(0, PHOTOS_MAX_PAR_ARTICLE)
    : [];

  if (!body.titre || !body.prix) {
    return NextResponse.json({ erreur: "Titre et prix sont obligatoires" }, { status: 400 });
  }
  if (photos.length === 0 && !body.videoUrl) {
    return NextResponse.json(
      { erreur: "Ajoutez au moins une photo ou une vidéo courte" },
      { status: 400 }
    );
  }

  const STATUTS_STOCK_VALIDES = ["DISPONIBLE", "STOCK_LIMITE", "RUPTURE_STOCK"];
  const statutStock = STATUTS_STOCK_VALIDES.includes(body.statutStock) ? body.statutStock : "DISPONIBLE";

  const produit = await prisma.produit.create({
    data: {
      vendeurId: vendeur.id,
      titre: body.titre,
      description: body.description || null,
      prix: Number(body.prix),
      categorie: body.categorie || null,
      photos,
      photosPublicIds,
      videoUrl: body.videoUrl || null,
      videoPublicId: body.videoPublicId || null,
      statutStock,
      nature: body.nature || null,
      enPromo: Boolean(body.enPromo),
      visible: abonnementActif,
    },
  });

  return NextResponse.json({ ok: true, produit });
}
