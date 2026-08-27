import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireSession } from "@/lib/auth";
import { lireIdAppareil } from "@/lib/appareil";
import { PHOTOS_MAX_PAR_ARTICLE } from "@/lib/media-limits";
import { classerParPertinenceMulti } from "@/lib/fuzzy";
import { elargirTermeRecherche, inferCategorieDepuisTerme } from "@/lib/synonymes";

const SELECTION_VENDEUR = {
  select: {
    id: true,
    nomBoutique: true,
    logoUrl: true,
    ville: true,
    utilisateur: { select: { whatsapp: true } },
  },
} as const;

/**
 * Annote chaque produit avec `estFavori` pour l'appareil courant, pour que
 * le cœur s'affiche déjà rempli partout (accueil, recherche, boutique) sans
 * que le client ait besoin de re-marquer un article déjà mis en favori.
 */
async function avecFavoris<T extends { id: string }>(produits: T[]): Promise<(T & { estFavori: boolean })[]> {
  const appareilId = lireIdAppareil();
  if (!appareilId || produits.length === 0) {
    return produits.map((p) => ({ ...p, estFavori: false }));
  }
  const favoris = await prisma.favori.findMany({
    where: { appareilId, produitId: { in: produits.map((p) => p.id) } },
    select: { produitId: true },
  });
  const idsFavoris = new Set(favoris.map((f) => f.produitId));
  return produits.map((p) => ({ ...p, estFavori: idsFavoris.has(p.id) }));
}

// GET /api/produits?q=chaussures&categorie=mode&nature=Homme&type=photo|video|hot&prixMin=1000&prixMax=5000
// Ne retourne que les produits visibles (vendeur avec abonnement actif).
// La recherche par texte (q) se fait en 3 passes :
//   1) correspondance stricte, élargie au champ lexical (synonymes)
//   2) si rien : classement approximatif tolérant aux fautes de frappe
//   3) si toujours rien : suggestions d'articles proches, jamais une page vide
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || undefined;
  const categorie = req.nextUrl.searchParams.get("categorie") || undefined;
  // "nature" = sous-catégorie préselectionnée (Homme/Femme/Enfant, Parfum, Smartphone...)
  const nature = req.nextUrl.searchParams.get("nature") || undefined;
  const type = req.nextUrl.searchParams.get("type") || undefined; // "photo" | "video" | "hot" | "promo" | "tous"
  const prixMin = req.nextUrl.searchParams.get("prixMin");
  const prixMax = req.nextUrl.searchParams.get("prixMax");
  // "tri" — tri explicite demandé par le client (prix croissant/décroissant).
  // Sans valeur, on retombe sur l'ordre par défaut (pertinence / plus récent).
  const triParam = req.nextUrl.searchParams.get("tri");
  const tri = triParam === "prix_asc" || triParam === "prix_desc" ? triParam : null;
  // Pagination : "skip" pour le défilement infini de la page recherche.
  const skip = Math.max(0, Number(req.nextUrl.searchParams.get("skip")) || 0);
  const TAILLE_PAGE = 24;

  const filtrePrix: { gte?: number; lte?: number } = {};
  if (prixMin) filtrePrix.gte = Number(prixMin);
  if (prixMax) filtrePrix.lte = Number(prixMax);

  const filtreType =
    type === "photo" ? { videoUrl: null } : type === "video" ? { videoUrl: { not: null } } : {};

  // Onglet "Hot Sales" : uniquement les articles boostés (payant, décidé par
  // l'admin — un vendeur ne peut pas s'y placer lui-même). Onglet "Promo" :
  // uniquement les articles marqués en promotion par leur vendeur.
  // IMPORTANT : ce filtre fait partie de `filtreBase`, donc il s'applique à
  // TOUTES les passes de recherche ci-dessous (y compris le classement
  // approximatif et les suggestions de secours). Avant, il n'était appliqué
  // que sur la liste "sans recherche" : dès qu'un client tapait un terme
  // dans l'onglet Hot Sales ou Promo, ce filtre disparaissait et des
  // articles non boostés/non promo s'affichaient avec le badge Hot Sales —
  // c'était le bug remonté.
  const filtreLabel = type === "hot" ? { boost: true } : type === "promo" ? { enPromo: true } : {};

  const filtreBase = {
    visible: true,
    ...(categorie ? { categorie } : {}),
    ...(nature ? { nature } : {}),
    ...(Object.keys(filtrePrix).length ? { prix: filtrePrix } : {}),
    ...filtreType,
    ...filtreLabel,
  };

  // Ordre par défaut : les onglets Hot Sales / Promo mettent en avant les
  // articles les plus récemment mis en avant ; les autres, les plus boostés
  // puis les plus récents. Un tri explicite (prix) prend toujours le dessus.
  const ordreParDefaut =
    type === "hot" || type === "promo"
      ? [{ boostedAt: "desc" as const }, { createdAt: "desc" as const }]
      : [{ boost: "desc" as const }, { createdAt: "desc" as const }];
  const ordre =
    tri === "prix_asc"
      ? [{ prix: "asc" as const }]
      : tri === "prix_desc"
      ? [{ prix: "desc" as const }]
      : ordreParDefaut;

  if (!q) {
    const produits = await prisma.produit.findMany({
      where: filtreBase,
      include: { vendeur: SELECTION_VENDEUR },
      orderBy: ordre,
      skip,
      take: TAILLE_PAGE + 1,
    });
    const hasMore = produits.length > TAILLE_PAGE;
    return NextResponse.json({ produits: await avecFavoris(produits.slice(0, TAILLE_PAGE)), hasMore });
  }

  // --- Passe 1 : correspondance stricte, élargie au champ lexical ---
  // "portable" doit aussi trouver les articles titrés "smartphone", etc.
  // (voir lib/synonymes.ts). Le terme tapé reste toujours en tête de liste.
  const termesElargis = elargirTermeRecherche(q);

  const correspondanceStricte = await prisma.produit.findMany({
    where: {
      ...filtreBase,
      OR: termesElargis.flatMap((t) => [
        { titre: { contains: t, mode: "insensitive" as const } },
        { nature: { contains: t, mode: "insensitive" as const } },
        { categorie: { contains: t, mode: "insensitive" as const } },
        { vendeur: { nomBoutique: { contains: t, mode: "insensitive" as const } } },
      ]),
    },
    include: { vendeur: SELECTION_VENDEUR },
    orderBy: ordre,
    skip,
    take: TAILLE_PAGE + 1,
  });

  if (correspondanceStricte.length > 0) {
    const hasMore = correspondanceStricte.length > TAILLE_PAGE;
    return NextResponse.json({
      produits: await avecFavoris(correspondanceStricte.slice(0, TAILLE_PAGE)),
      hasMore,
    });
  }

  // --- Passe 2 : fautes de frappe — on élargit et on classe par similarité,
  // en testant le terme tapé ET ses synonymes, on garde le meilleur score ---
  // (Le classement par pertinence se fait sur un lot large, donc la pagination
  // se fait ensuite en mémoire sur le résultat déjà trié.)
  const candidats = await prisma.produit.findMany({
    where: filtreBase,
    include: { vendeur: SELECTION_VENDEUR },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  let classes = classerParPertinenceMulti(termesElargis, candidats, (p) =>
    [p.titre, p.nature || "", p.categorie || "", p.vendeur.nomBoutique].join(" ")
  );

  // Un tri prix explicite prime sur le classement par pertinence.
  if (tri === "prix_asc") classes = [...classes].sort((a, b) => a.prix - b.prix);
  else if (tri === "prix_desc") classes = [...classes].sort((a, b) => b.prix - a.prix);

  if (classes.length > 0) {
    const page = classes.slice(skip, skip + TAILLE_PAGE);
    const hasMore = classes.length > skip + TAILLE_PAGE;
    return NextResponse.json({ produits: await avecFavoris(page), hasMore });
  }

  // --- Passe 3 : filet de sécurité — vraiment aucune correspondance, même
  // approximative. Plutôt qu'une page vide (ou pire, un article sans rapport
  // pris au hasard dans tout le catalogue), on propose des articles proches :
  //   1) même catégorie/sous-catégorie si les filtres actifs le permettent ;
  //   2) sinon, la catégorie devinée depuis le terme tapé (ex : "déodorant"
  //      → on montre un autre article "Beauté & Cosmétiques", jamais un sac) ;
  //   3) sinon seulement, les articles du moment, tous genres confondus.
  // On le signale via `suggestionsFallback` pour que le client affiche
  // "Aucun résultat exact, mais voici..." au lieu d'une simple absence de
  // résultat, ou de faux positifs qui donneraient une impression amateur.
  const categorieDevinee = !categorie && !nature ? inferCategorieDepuisTerme(q) : null;

  // `filtreLabel` reste appliqué ici : dans l'onglet Hot Sales ou Promo, les
  // suggestions de secours doivent rester des articles boostés / en promo —
  // jamais un article ordinaire affiché à tort avec le badge Hot Sales.
  const suggestions = await prisma.produit.findMany({
    where: {
      visible: true,
      ...(categorie ? { categorie } : {}),
      ...(nature ? { nature } : {}),
      ...(categorieDevinee ? { categorie: categorieDevinee } : {}),
      ...filtreType,
      ...filtreLabel,
    },
    include: { vendeur: SELECTION_VENDEUR },
    orderBy: ordre,
    take: TAILLE_PAGE,
  });

  // La catégorie devinée n'a rien donné (aucun article de ce genre en
  // boutique) : on retombe sur les articles du moment plutôt qu'une page
  // vide, mais le message côté client reste honnête ("aucun résultat exact").
  const suggestionsFinales =
    suggestions.length > 0
      ? suggestions
      : categorieDevinee
      ? await prisma.produit.findMany({
          where: { visible: true, ...filtreType, ...filtreLabel },
          include: { vendeur: SELECTION_VENDEUR },
          orderBy: ordre,
          take: TAILLE_PAGE,
        })
      : suggestions;

  return NextResponse.json({
    produits: await avecFavoris(suggestionsFinales),
    hasMore: false,
    suggestionsFallback: true,
  });
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
      // "enPromo" (étiquette "Promo") : le vendeur peut la choisir librement
      // dès la création. "boost" ("Hot Sales"), lui, reste exclusivement géré
      // par l'admin après un boost payant — jamais modifiable ici.
      enPromo: Boolean(body.enPromo),
      visible: abonnementActif,
    },
  });

  return NextResponse.json({ ok: true, produit });
}
