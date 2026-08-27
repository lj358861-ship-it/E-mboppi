import { prisma } from "@/lib/prisma";
import { lireIdAppareil } from "@/lib/appareil";
import CarteProduitVideo from "@/components/CarteProduitVideo";
import PromoCarousel from "@/components/PromoCarousel";
import RayonPromo from "@/components/RayonPromo";
import ProduitsSuivis from "@/components/ProduitsSuivis";
import IntroLogo from "@/components/IntroLogo";
import Link from "next/link";
import { Store, Flame } from "lucide-react";

export const dynamic = "force-dynamic";

const SELECTION_VENDEUR = {
  select: { id: true, nomBoutique: true, ville: true, utilisateur: { select: { whatsapp: true } } },
} as const;

async function idsFavoris(produitIds: string[]): Promise<Set<string>> {
  const appareilId = lireIdAppareil();
  if (!appareilId || produitIds.length === 0) return new Set();
  const favoris = await prisma.favori.findMany({
    where: { appareilId, produitId: { in: produitIds } },
    select: { produitId: true },
  });
  return new Set(favoris.map((f) => f.produitId));
}

async function recupererProduitsHot() {
  return prisma.produit.findMany({
    where: { visible: true, boost: true },
    include: { vendeur: SELECTION_VENDEUR },
    orderBy: [{ boostedAt: "desc" }, { createdAt: "desc" }],
    take: 20,
  });
}

async function recupererProduitsParCategorie() {
  const produits = await prisma.produit.findMany({
    where: { visible: true },
    include: { vendeur: SELECTION_VENDEUR },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  type Produit = (typeof produits)[number];
  const groupes: Array<[string, Produit[]]> = [];
  const index = new Map<string, number>();

  for (const p of produits) {
    const cle = p.categorie || "Autres articles";
    if (!index.has(cle)) {
      index.set(cle, groupes.length);
      groupes.push([cle, []]);
    }
    groupes[index.get(cle)!][1].push(p);
  }
  return groupes;
}

export default async function Accueil() {
  const [produitsHot, groupes] = await Promise.all([recupererProduitsHot(), recupererProduitsParCategorie()]);
  const aucunProduit = groupes.length === 0;

  const tousLesIds = [
    ...produitsHot.map((p) => p.id),
    ...groupes.flatMap(([, produits]) => produits.map((p) => p.id)),
  ];
  const favoris = await idsFavoris(tousLesIds);

  return (
    <div>
      {/* Écran d'intro : le logo s'assemble à l'ouverture ou à l'actualisation
          de la page d'accueil, puis disparaît après 3 secondes */}
      <IntroLogo />

      {/* Carrousel promotionnel néon animé */}
      <section className="px-4 md:px-8 pt-6 pb-4">
        <PromoCarousel />
      </section>

      {/* Articles des boutiques suivies — priorité sur le reste du fil, ne
          s'affiche que si le client suit au moins une boutique */}
      <ProduitsSuivis />

      {aucunProduit && (
        <div className="px-4 md:px-8 py-16 text-center text-indigo-900/60">
          <p className="font-display text-xl mb-2">Le marché ouvre bientôt ses stands.</p>
          <p className="text-sm">Revenez dans quelques instants, les vendeurs arrivent.</p>
        </div>
      )}

      {produitsHot.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between px-4 md:px-8 mb-3">
            <h2 className="font-display text-lg md:text-xl font-semibold text-indigo-900 flex items-center gap-2">
              <Flame className="text-mango-500" size={20} /> Hot Sales
            </h2>
            <Link href="/recherche?onglet=hot" className="text-xs font-medium text-neon-600 hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-none px-4 md:px-8 pb-2 snap-x">
            {produitsHot.map((p) => (
              <div key={p.id} className="w-[220px] md:w-[260px] flex-shrink-0 snap-start">
                <CarteProduitVideo
                  id={p.id}
                  titre={p.titre}
                  prix={p.prix}
                  videoUrl={p.videoUrl}
                  imageUrl={p.photos[0] || null}
                  vendeurId={p.vendeur.id}
                  nomBoutique={p.vendeur.nomBoutique}
                  villeVendeur={p.vendeur.ville}
                  whatsappVendeur={p.vendeur.utilisateur.whatsapp}
                  statutStock={p.statutStock}
                  hotSales={p.boost}
                  enPromotion={p.enPromo}
                  estFavori={favoris.has(p.id)}
                  enFeu
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {groupes.map(([categorie, produits], i) => (
        <section key={categorie} id={i === 0 ? "produits" : undefined} className="mb-8">
          <div className="flex items-center justify-between px-4 md:px-8 mb-3">
            <h2 className="font-display text-lg md:text-xl font-semibold text-indigo-900 flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-gradient-neon" />
              {categorie}
            </h2>
            {/* "Autres articles" est un regroupement d'affichage pour les
                articles sans catégorie renseignée (categorie=null en base) —
                il ne correspond à aucune vraie valeur filtrable, donc le
                lien "Voir tout" pointe vers la liste complète sans filtre
                dans ce cas précis. */}
            <Link
              href={
                categorie === "Autres articles"
                  ? "/recherche?onglet=tous"
                  : `/recherche?onglet=tous&categorie=${encodeURIComponent(categorie)}`
              }
              className="text-xs font-medium text-neon-600 hover:underline flex-shrink-0"
            >
              Voir tout
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-none px-4 md:px-8 pb-2 snap-x">
            {produits.map((p) => (
              <div key={p.id} className="w-[220px] md:w-[260px] flex-shrink-0 snap-start">
                <CarteProduitVideo
                  id={p.id}
                  titre={p.titre}
                  prix={p.prix}
                  videoUrl={p.videoUrl}
                  imageUrl={p.photos[0] || null}
                  vendeurId={p.vendeur.id}
                  nomBoutique={p.vendeur.nomBoutique}
                  villeVendeur={p.vendeur.ville}
                  whatsappVendeur={p.vendeur.utilisateur.whatsapp}
                  statutStock={p.statutStock}
                  hotSales={p.boost}
                  enPromotion={p.enPromo}
                  estFavori={favoris.has(p.id)}
                />
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Rayon promo — bas de l'écran, avec son propre filtrage par catégorie */}
      <RayonPromo />

      <div className="px-4 md:px-8 py-10 text-center">
        <Link href="/a-propos#devenir-vendeur" className="btn-neon px-5 py-3 font-medium text-sm">
          <Store size={16} /> Vous êtes vendeur au marché Mboppi ? Ouvrez votre stand ici
        </Link>
      </div>
    </div>
  );
}
