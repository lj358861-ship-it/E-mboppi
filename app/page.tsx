import { prisma } from "@/lib/prisma";
import CarteProduitVideo from "@/components/CarteProduitVideo";
import PromoCarousel from "@/components/PromoCarousel";
import Link from "next/link";
import { Store } from "lucide-react";

export const dynamic = "force-dynamic";

async function recupererProduitsParCategorie() {
  const produits = await prisma.produit.findMany({
    where: { visible: true },
    include: {
      vendeur: { select: { id: true, nomBoutique: true, utilisateur: { select: { whatsapp: true } } } },
    },
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
  const groupes = await recupererProduitsParCategorie();
  const aucunProduit = groupes.length === 0;

  return (
    <div>
      {/* Carrousel promotionnel néon animé */}
      <section className="px-4 md:px-8 pt-6 pb-4">
        <PromoCarousel />
      </section>

      {aucunProduit && (
        <div className="px-4 md:px-8 py-16 text-center text-indigo-900/60">
          <p className="font-display text-xl mb-2">Le marché ouvre bientôt ses stands.</p>
          <p className="text-sm">Revenez dans quelques instants, les vendeurs arrivent.</p>
        </div>
      )}

      {groupes.map(([categorie, produits], i) => (
        <section key={categorie} id={i === 0 ? "produits" : undefined} className="mb-8">
          <div className="flex items-center justify-between px-4 md:px-8 mb-3">
            <h2 className="font-display text-lg md:text-xl font-semibold text-indigo-900 flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-gradient-neon" />
              {categorie}
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-none px-4 md:px-8 pb-2 snap-x">
            {produits.map((p) => (
              <CarteProduitVideo
                key={p.id}
                id={p.id}
                titre={p.titre}
                prix={p.prix}
                videoUrl={p.videoUrl}
                imageUrl={p.photos[0] || null}
                vendeurId={p.vendeur.id}
                nomBoutique={p.vendeur.nomBoutique}
                whatsappVendeur={p.vendeur.utilisateur.whatsapp}
            statutStock={p.statutStock}
              />
            ))}
          </div>
        </section>
      ))}

      <div className="px-4 md:px-8 py-10 text-center">
        <Link href="/a-propos#devenir-vendeur" className="btn-neon px-5 py-3 font-medium text-sm">
          <Store size={16} /> Vous êtes vendeur au marché Mboppi ? Ouvrez votre stand ici
        </Link>
      </div>
    </div>
  );
}
