import { prisma } from "@/lib/prisma";
import { lireIdAppareil } from "@/lib/appareil";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { MapPin, MessageCircle, Store, Tag, Heart, CalendarDays, Star } from "lucide-react";
import { lienContacterVendeur } from "@/lib/whatsapp";
import { estVendeurVerifie } from "@/lib/abonnement";
import { noteMoyenneBoutique } from "@/lib/notes";
import CarteProduitVideo from "@/components/CarteProduitVideo";
import BoutonSuivreBoutique from "@/components/BoutonSuivreBoutique";
import BadgeVendeurVerifie from "@/components/BadgeVendeurVerifie";
import BoutonPartager from "@/components/BoutonPartager";
import AvisBoutique from "@/components/AvisBoutique";

export const dynamic = "force-dynamic";

// Aperçu WhatsApp/Google propre à chaque boutique (logo + description) au
// lieu du titre générique du site quand un lien de boutique est partagé.
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const vendeur = await prisma.vendeur.findUnique({
    where: { id: params.id },
    select: { nomBoutique: true, description: true, logoUrl: true, ville: true },
  });

  if (!vendeur) return { title: "Boutique introuvable" };

  const titre = `${vendeur.nomBoutique}${vendeur.ville ? ` — ${vendeur.ville}` : ""}`;
  const description = vendeur.description || `Découvrez les articles de ${vendeur.nomBoutique} sur E-Mboppi.`;

  return {
    title: titre,
    description,
    openGraph: {
      title: titre,
      description,
      images: vendeur.logoUrl ? [{ url: vendeur.logoUrl, width: 400, height: 400, alt: vendeur.nomBoutique }] : undefined,
    },
    twitter: {
      card: "summary",
      title: titre,
      description,
      images: vendeur.logoUrl ? [vendeur.logoUrl] : undefined,
    },
  };
}

export default async function ProfilVendeur({ params }: { params: { id: string } }) {
  const vendeur = await prisma.vendeur.findUnique({
    where: { id: params.id },
    include: {
      utilisateur: { select: { whatsapp: true } },
      abonnements: { orderBy: { createdAt: "desc" }, take: 1 },
      produits: {
        where: { visible: true },
        orderBy: [{ boost: "desc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!vendeur) notFound();

  const appareilId = lireIdAppareil();
  const favoris =
    appareilId && vendeur.produits.length > 0
      ? new Set(
          (
            await prisma.favori.findMany({
              where: { appareilId, produitId: { in: vendeur.produits.map((p) => p.id) } },
              select: { produitId: true },
            })
          ).map((f) => f.produitId)
        )
      : new Set<string>();

  const [suiviExistant, nbSuivis, statsProduits] = await Promise.all([
    appareilId
      ? prisma.suivi.findUnique({ where: { appareilId_vendeurId: { appareilId, vendeurId: vendeur.id } } })
      : null,
    prisma.suivi.count({ where: { vendeurId: vendeur.id } }),
    noteMoyenneBoutique(vendeur.id),
  ]);
  // La note affichée sur le profil boutique est la moyenne des avis de tous
  // ses produits (voir lib/notes.ts) — les avis textuels ci-dessous
  // (AvisBoutique) restent un espace de commentaires séparé.
  const noteMoyenne = statsProduits.noteMoyenne;
  const nbAvis = statsProduits.nbAvis;

  const verifie = estVendeurVerifie(vendeur, vendeur.abonnements[0]);
  const urlBoutique = `${process.env.NEXT_PUBLIC_SITE_URL || "https://e-mboppi-production.up.railway.app"}/vendeur/${vendeur.id}`;
  const nbProduits = vendeur.produits.length;
  const membreDepuis = vendeur.createdAt.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
      {/* Carte boutique — bannière dégradée aux couleurs du site + infos */}
      <div className="relative rounded-3xl overflow-hidden bg-white border border-stone-200 shadow-sm mb-8">
        <div className="h-28 sm:h-36 relative overflow-hidden bg-gradient-to-r from-feuille-600 to-feuille-500">
          {vendeur.photoCouvertureUrl ? (
            <Image
              src={vendeur.photoCouvertureUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute -right-6 -top-10 w-32 h-32 rounded-full bg-white/10" />
          )}
          <div className="absolute inset-0 bg-black/10" />
        </div>

        <div className="px-5 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-2 pt-3">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-stone-200 flex items-center justify-center flex-shrink-0 border-4 border-white shadow-md">
              {vendeur.logoUrl ? (
                <Image src={vendeur.logoUrl} alt={vendeur.nomBoutique} fill sizes="96px" className="object-cover" />
              ) : (
                <Store size={32} className="text-indigo-900/30" />
              )}
            </div>

            <div className="flex-1 sm:pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl font-semibold text-indigo-900">{vendeur.nomBoutique}</h1>
                {verifie && <BadgeVendeurVerifie taille={13} />}
              </div>
              {vendeur.ville && (
                <p className="flex items-center gap-1 text-sm text-indigo-900/60 mt-1">
                  <MapPin size={14} /> {vendeur.ville}
                </p>
              )}
            </div>
          </div>

          {vendeur.description && (
            <p className="text-sm text-indigo-900/70 mt-4 max-w-xl">{vendeur.description}</p>
          )}

          {/* Statistiques en pastilles colorées — remplace la ligne de texte gris */}
          <div className="flex flex-wrap gap-2 mt-4">
            {nbAvis > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-mango-600 bg-mango-500/10 px-3 py-1.5 rounded-full">
                <Star size={13} className="fill-mango-500 text-mango-500" /> {noteMoyenne.toFixed(1)} ({nbAvis})
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neon-700 bg-neon-300/30 px-3 py-1.5 rounded-full">
              <Tag size={13} /> {nbProduits} article{nbProduits > 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-piment-600 bg-piment-500/10 px-3 py-1.5 rounded-full">
              <Heart size={13} /> {nbSuivis} abonné{nbSuivis > 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-900/60 bg-stone-100 px-3 py-1.5 rounded-full">
              <CalendarDays size={13} /> Depuis {membreDepuis}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 mt-5">
            <a
              href={lienContacterVendeur(vendeur.utilisateur.whatsapp, `la boutique ${vendeur.nomBoutique}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-feuille-500 hover:bg-feuille-600 transition-colors text-white px-5 py-3 rounded-full font-medium text-sm"
            >
              <MessageCircle size={16} /> Contacter sur WhatsApp
            </a>
            <div className="flex items-center gap-2">
              <BoutonSuivreBoutique
                vendeurId={vendeur.id}
                suiviInitial={Boolean(suiviExistant)}
                nbSuivisInitial={nbSuivis}
              />
              <BoutonPartager titre={vendeur.nomBoutique} url={urlBoutique} />
            </div>
          </div>
        </div>
      </div>

      {/* Section produits */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-indigo-900 flex items-center gap-2">
          <Store size={18} className="text-neon-600" /> Articles en boutique
        </h2>
        {nbProduits > 0 && <span className="text-xs text-indigo-900/40">{nbProduits} article{nbProduits > 1 ? "s" : ""}</span>}
      </div>

      {nbProduits === 0 ? (
        <div className="flex flex-col items-center justify-center text-center gap-2 border border-dashed border-stone-300 rounded-2xl py-14 px-6 text-indigo-900/40">
          <Store size={28} className="text-indigo-900/25" />
          <p className="text-sm">Cette boutique n&apos;a pas encore d&apos;article visible.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {vendeur.produits.map((p: (typeof vendeur.produits)[number]) => (
            <CarteProduitVideo
              key={p.id}
              id={p.id}
              titre={p.titre}
              prix={p.prix}
              videoUrl={p.videoUrl}
              imageUrl={p.photos[0] || null}
              vendeurId={vendeur.id}
              nomBoutique={vendeur.nomBoutique}
              villeVendeur={vendeur.ville}
              whatsappVendeur={vendeur.utilisateur.whatsapp}
              verifie={verifie}
              statutStock={p.statutStock}
              hotSales={p.boost}
              enPromotion={p.enPromo}
              estFavori={favoris.has(p.id)}
            />
          ))}
        </div>
      )}

      <AvisBoutique vendeurId={vendeur.id} />
    </div>
  );
}
