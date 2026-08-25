import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireSession } from "@/lib/auth";
import { supprimerDeCloudinary } from "@/lib/cloudinary";
import { PHOTOS_MAX_PAR_ARTICLE } from "@/lib/media-limits";

const STATUTS_STOCK_VALIDES = ["DISPONIBLE", "STOCK_LIMITE", "RUPTURE_STOCK"];

// PATCH /api/produits/[id]
// - ADMIN : peut booster/débooster n'importe quelle annonce
// - VENDEUR (propriétaire) : peut modifier son propre article (titre, prix,
//   description, catégorie, statut de stock, photos, vidéo)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = lireSession();
  if (!session) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const produitExistant = await prisma.produit.findUnique({ where: { id: params.id } });
  if (!produitExistant) {
    return NextResponse.json({ erreur: "Article introuvable" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));

  try {
    // --- Admin : boost / déboost uniquement ---
    if (session.role === "ADMIN") {
      if (typeof body.boost === "boolean") {
        const produit = await prisma.produit.update({
          where: { id: params.id },
          data: { boost: body.boost, boostedAt: body.boost ? new Date() : null },
        });
        return NextResponse.json({ ok: true, produit });
      }
      return NextResponse.json({ erreur: "Aucune modification valide fournie" }, { status: 400 });
    }

    // --- Vendeur : doit être propriétaire de l'article ---
    if (session.role !== "VENDEUR") {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
    }

    const vendeur = await prisma.vendeur.findUnique({ where: { utilisateurId: session.id } });
    if (!vendeur || vendeur.id !== produitExistant.vendeurId) {
      return NextResponse.json({ erreur: "Cet article ne vous appartient pas" }, { status: 403 });
    }

    const donnees: Record<string, unknown> = {};

    if (typeof body.titre === "string" && body.titre.trim()) donnees.titre = body.titre.trim();
    if (body.description !== undefined) donnees.description = body.description || null;
    if (body.prix !== undefined) {
      const prix = Number(body.prix);
      if (!Number.isFinite(prix) || prix < 0) {
        return NextResponse.json({ erreur: "Prix invalide" }, { status: 400 });
      }
      donnees.prix = prix;
    }
    if (body.categorie !== undefined) donnees.categorie = body.categorie || null;
    if (body.nature !== undefined) donnees.nature = body.nature || null;
    if (body.enPromo !== undefined) donnees.enPromo = Boolean(body.enPromo);
    if (body.statutStock !== undefined) {
      if (!STATUTS_STOCK_VALIDES.includes(body.statutStock)) {
        return NextResponse.json({ erreur: "Statut de stock invalide" }, { status: 400 });
      }
      donnees.statutStock = body.statutStock;
    }

    // Remplacement des médias (facultatif) : si de nouvelles photos/vidéo sont
    // fournies, on supprime les anciennes de Cloudinary pour éviter les orphelins.
    if (Array.isArray(body.photos)) {
      const nouvellesPhotos: string[] = body.photos.slice(0, PHOTOS_MAX_PAR_ARTICLE);
      const nouveauxPublicIds: string[] = Array.isArray(body.photosPublicIds)
        ? body.photosPublicIds.slice(0, PHOTOS_MAX_PAR_ARTICLE)
        : [];
      const ancienIds = produitExistant.photosPublicIds.filter((id: string) => !nouveauxPublicIds.includes(id));
      await Promise.all(ancienIds.map((id: string) => supprimerDeCloudinary(id, "image")));
      donnees.photos = nouvellesPhotos;
      donnees.photosPublicIds = nouveauxPublicIds;
    }

    if (body.videoUrl !== undefined) {
      if (body.videoUrl !== produitExistant.videoUrl && produitExistant.videoPublicId) {
        await supprimerDeCloudinary(produitExistant.videoPublicId, "video");
      }
      donnees.videoUrl = body.videoUrl || null;
      donnees.videoPublicId = body.videoPublicId || null;
    }

    const photosFinales = (donnees.photos as string[] | undefined) ?? produitExistant.photos;
    const videoFinale = (donnees.videoUrl as string | null | undefined) ?? produitExistant.videoUrl;
    if (photosFinales.length === 0 && !videoFinale) {
      return NextResponse.json(
        { erreur: "L'article doit garder au moins une photo ou une vidéo" },
        { status: 400 }
      );
    }

    const produit = await prisma.produit.update({ where: { id: params.id }, data: donnees });
    return NextResponse.json({ ok: true, produit });
  } catch (erreur) {
    console.error("Erreur PATCH /api/produits/[id]:", erreur);
    return NextResponse.json({ erreur: "Échec de la mise à jour de l'article" }, { status: 500 });
  }
}

// DELETE /api/produits/[id] — l'admin peut supprimer n'importe quelle annonce,
// le vendeur propriétaire peut supprimer ses propres annonces.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = lireSession();
  if (!session) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  try {
    const produit = await prisma.produit.findUnique({ where: { id: params.id } });
    if (!produit) {
      // Déjà supprimé : on répond ok pour que l'UI se resynchronise proprement.
      return NextResponse.json({ ok: true });
    }

    if (session.role === "ADMIN") {
      // autorisé
    } else if (session.role === "VENDEUR") {
      const vendeur = await prisma.vendeur.findUnique({ where: { utilisateurId: session.id } });
      if (!vendeur || vendeur.id !== produit.vendeurId) {
        return NextResponse.json({ erreur: "Cet article ne vous appartient pas" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.favori.deleteMany({ where: { produitId: params.id } }),
      prisma.produit.delete({ where: { id: params.id } }),
    ]);

    await Promise.all([
      ...produit.photosPublicIds.map((id: string) => supprimerDeCloudinary(id, "image")),
      supprimerDeCloudinary(produit.videoPublicId, "video"),
    ]);

    return NextResponse.json({ ok: true });
  } catch (erreur) {
    console.error("Erreur DELETE /api/produits/[id]:", erreur);
    return NextResponse.json({ erreur: "Échec de la suppression de l'article" }, { status: 500 });
  }
}
