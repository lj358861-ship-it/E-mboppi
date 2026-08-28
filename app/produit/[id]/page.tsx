import { prisma } from "@/lib/prisma";
import { lienContacterVendeur } from "@/lib/whatsapp";
import { estVendeurVerifie } from "@/lib/abonnement";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Store, Tag, MapPin, Flame } from "lucide-react";
import { classesBadgeStock, labelStatutStock, CLASSES_BADGE_PROMO, LABEL_BADGE_PROMO } from "@/lib/stock";
import GalerieProduit from "./GalerieProduit";
import BoutonFermer from "./BoutonFermer";
import BoutonContacterWhatsapp from "@/components/BoutonContacterWhatsapp";
import BoutonPartager from "@/components/BoutonPartager";
import BadgeVendeurVerifie from "@/components/BadgeVendeurVerifie";

export const dynamic = "force-dynamic";

// Métadonnées propres à chaque article : quand un vendeur ou un client
// partage un lien produit sur WhatsApp, l'aperçu affiche sa vraie photo et
// son prix au lieu du nom générique du site (app/layout.tsx).
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const produit = await prisma.produit.findUnique({
    where: { id: params.id },
    select: { titre: true, description: true, prix: true, photos: true, vendeur: { select: { nomBoutique: true } } },
  });

  if (!produit) return { title: "Article introuvable" };

  const titre = `${produit.titre} — ${produit.prix.toLocaleString("fr-FR")} F`;
  const description =
    produit.description?.slice(0, 160) ||
    `En vente chez ${produit.vendeur.nomBoutique} sur E-Mboppi, le marché Mboppi en ligne.`;
  const image = produit.photos[0];

  return {
    title: titre,
    description,
    openGraph: {
      title: titre,
      description,
      images: image ? [{ url: image, width: 800, height: 800, alt: produit.titre }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: titre,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PageProduit({ params }: { params: { id: string } }) {
  const produit = await prisma.produit.findUnique({
    where: { id: params.id },
    include: {
      vendeur: {
        include: {
          utilisateur: true,
          abonnements: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
  });

  if (!produit) notFound();

  // Comptabilise une vue de la fiche — statistique affichée au vendeur.
  // Ne bloque jamais l'affichage de la page si ça échoue.
  prisma.produit.update({ where: { id: produit.id }, data: { vues: { increment: 1 } } }).catch(() => {});

  const verifie = estVendeurVerifie(produit.vendeur, produit.vendeur.abonnements[0]);
  const urlProduit = `${process.env.NEXT_PUBLIC_SITE_URL || "https://e-mboppi-production.up.railway.app"}/produit/${produit.id}`;

  return (
    <div className="contenu-fiche-produit px-4 md:px-8 pt-6 max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
      <BoutonFermer />

      <GalerieProduit videoUrl={produit.videoUrl} photos={produit.photos} titre={produit.titre} />

      <div className="md:bg-white md:border md:border-stone-200 md:rounded-3xl md:p-6">
        <Link
          href={`/vendeur/${produit.vendeur.id}`}
          className="flex items-start gap-3 mb-4 w-fit group bg-stone-50 border border-stone-200 rounded-2xl p-3"
        >
          <span className="relative w-11 h-11 rounded-full overflow-hidden bg-stone-200 flex items-center justify-center flex-shrink-0">
            {produit.vendeur.logoUrl ? (
              <Image src={produit.vendeur.logoUrl} alt={produit.vendeur.nomBoutique} fill sizes="44px" className="object-cover" />
            ) : (
              <Store size={16} className="text-indigo-900/40" />
            )}
          </span>
          <span>
            <span className="flex items-center gap-1.5 flex-wrap">
              <span className="block text-sm font-medium text-indigo-900 group-hover:underline">
                {produit.vendeur.nomBoutique}
              </span>
              {verifie && <BadgeVendeurVerifie variante="icone" />}
            </span>
            <span className="flex items-center gap-2 flex-wrap text-xs text-indigo-900/50 mt-0.5">
              {produit.vendeur.ville && (
                <span className="flex items-center gap-0.5">
                  <MapPin size={11} /> {produit.vendeur.ville}
                </span>
              )}
              <span>
                Membre depuis{" "}
                {produit.vendeur.createdAt.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </span>
            </span>
            {produit.vendeur.description && (
              <span className="block text-xs text-indigo-900/60 mt-1 max-w-xs line-clamp-2">
                {produit.vendeur.description}
              </span>
            )}
          </span>
        </Link>

        <h1 className="font-display text-2xl font-semibold text-indigo-900 mb-1">{produit.titre}</h1>
        {produit.nature && <p className="text-sm text-indigo-900/50 mb-2">{produit.nature}</p>}

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <p className="font-display text-mango-600 text-2xl font-bold tracking-tight leading-none">
            {produit.prix.toLocaleString("fr-FR")}
            <span className="text-sm font-semibold text-mango-600/70 ml-1.5">FCFA</span>
          </p>
          {produit.boost && (
            <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold ${CLASSES_BADGE_PROMO}`}>
              <Flame size={12} /> {LABEL_BADGE_PROMO}
            </span>
          )}
          {produit.categorie && (
            <span className="flex items-center gap-1 bg-stone-100 text-indigo-900/60 text-xs px-2.5 py-1 rounded-full">
              <Tag size={12} /> {produit.categorie}
            </span>
          )}
          {produit.statutStock !== "DISPONIBLE" && (
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${classesBadgeStock(produit.statutStock)}`}>
              {labelStatutStock(produit.statutStock)}
            </span>
          )}
        </div>

        {produit.description && (
          <p className="text-indigo-900/80 leading-relaxed mb-6">{produit.description}</p>
        )}

        <div className="hidden md:flex flex-wrap gap-3 mb-8">
          <BoutonContacterWhatsapp
            produitId={produit.id}
            href={lienContacterVendeur(produit.vendeur.utilisateur.whatsapp, produit.titre)}
            className="flex items-center gap-2 bg-feuille-500 hover:bg-feuille-600 transition-colors text-white px-5 py-3 rounded-full font-medium text-sm"
          />
          <BoutonPartager titre={produit.titre} url={urlProduit} />
        </div>
      </div>

      {/* Barre d'action fixe sur mobile — reste visible pendant le défilement,
          au-dessus de la barre de navigation du bas */}
      <div className="barre-cta-mobile md:hidden fixed left-0 right-0 z-20 flex items-center gap-3 px-4 py-3 bg-white border-t border-stone-200">
        <p className="font-display text-mango-600 font-bold text-lg tracking-tight whitespace-nowrap">
          {produit.prix.toLocaleString("fr-FR")}
          <span className="text-xs font-semibold text-mango-600/70 ml-1">FCFA</span>
        </p>
        <BoutonContacterWhatsapp
          produitId={produit.id}
          href={lienContacterVendeur(produit.vendeur.utilisateur.whatsapp, produit.titre)}
          className="flex-1 flex items-center justify-center gap-2 bg-feuille-500 active:bg-feuille-600 transition-colors text-white px-4 py-2.5 rounded-full font-medium text-sm"
        />
        <BoutonPartager titre={produit.titre} url={urlProduit} compact />
      </div>
    </div>
  );
}
