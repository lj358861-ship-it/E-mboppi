import { prisma } from "@/lib/prisma";
import CarteProduitVideo from "@/components/CarteProduitVideo";
import Link from "next/link";
import { Store } from "lucide-react";

export const dynamic = "force-dynamic";

async function recupererProduitsParCategorie() {
  const produits = await prisma.produit.findMany({
    where: { visible: true },
    include: { vendeur: { include: { utilisateur: true } } },
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
      {/* Bandeau signature — étiquette de marché géante */}
      <section className="px-4 md:px-8 pt-6 pb-4">
        <div className="price-tag bg-indigo-900 text-white px-6 py-8 md:px-12 md:py-14 rounded-tr-2xl">
          <p className="font-mono text-mango-400 text-xs tracking-widest uppercase mb-2">
            Kmer Vision présente
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-semibold max-w-xl leading-tight">
            Le marché Mboppi, à portée de main.
          </h1>
          <p className="mt-3 text-stone-200 max-w-md text-sm md:text-base">
            Parcourez les stands en vidéo, trouvez l&apos;article qu&apos;il vous faut,
            et écrivez directement au vendeur sur WhatsApp.
          </p>
        </div>
      </section>

      {aucunProduit && (
        <div className="px-4 md:px-8 py-16 text-center text-indigo-900/60">
          <p className="font-display text-xl mb-2">Le marché ouvre bientôt ses stands.</p>
          <p className="text-sm">Revenez dans quelques instants, les vendeurs arrivent.</p>
        </div>
      )}

      {groupes.map(([categorie, produits]) => (
        <section key={categorie} className="mb-8">
          <div className="flex items-center justify-between px-4 md:px-8 mb-3">
            <h2 className="font-display text-lg md:text-xl font-semibold text-indigo-900">
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
                imageUrl={p.imageUrl}
                nomBoutique={p.vendeur.nomBoutique}
                whatsappVendeur={p.vendeur.utilisateur.whatsapp}
              />
            ))}
          </div>
        </section>
      ))}

      <div className="px-4 md:px-8 py-10 text-center">
        <Link
          href="/a-propos#devenir-vendeur"
          className="inline-flex items-center gap-2 bg-piment-500 hover:bg-piment-600 transition-colors text-white px-5 py-3 rounded-full font-medium text-sm"
        >
          <Store size={16} /> Vous êtes vendeur au marché Mboppi ? Ouvrez votre stand ici
        </Link>
      </div>
    </div>
  );
}
