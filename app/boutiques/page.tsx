import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Store, Heart, Star } from "lucide-react";
import { estVendeurVerifie } from "@/lib/abonnement";
import { notesMoyennesBoutiques } from "@/lib/notes";
import BadgeVendeurVerifie from "@/components/BadgeVendeurVerifie";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Visitez les boutiques — E-Mboppi",
  description: "Toutes les boutiques du marché Mboppi, en un coup d'œil.",
};

// /boutiques — annuaire de toutes les boutiques actives, façon grille de
// profils Instagram : logo, nom, badge de certification, nombre d'abonnés.
export default async function Boutiques() {
  const vendeurs = await prisma.vendeur.findMany({
    where: { produits: { some: { visible: true } } },
    include: {
      abonnements: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { suivis: true } },
    },
    orderBy: [{ certifie: "desc" }, { createdAt: "desc" }],
  });

  // Note de chaque boutique = moyenne des avis de ses articles (voir
  // lib/notes.ts) — calculée en une seule requête groupée pour tout
  // l'annuaire plutôt qu'un aller-retour base par carte.
  const notes = await notesMoyennesBoutiques(vendeurs.map((v) => v.id));

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-indigo-900 mb-1">
          Visitez les boutiques
        </h1>
        <p className="text-sm text-indigo-900/60">
          Toutes les boutiques actives du marché Mboppi, en un coup d&apos;œil.
        </p>
      </div>

      {vendeurs.length === 0 ? (
        <p className="text-sm text-indigo-900/50">Aucune boutique active pour le moment.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {vendeurs.map((v) => {
            const verifie = estVendeurVerifie(v, v.abonnements[0]);
            const stats = notes.get(v.id) ?? { noteMoyenne: 0, nbAvis: 0 };
            return (
              <Link
                key={v.id}
                href={`/vendeur/${v.id}`}
                className="group rounded-2xl overflow-hidden border border-stone-200 bg-white hover:shadow-md transition-shadow"
              >
                <div className="relative h-16 bg-gradient-to-r from-feuille-600 to-feuille-500 overflow-hidden">
                  {v.photoCouvertureUrl && (
                    <Image src={v.photoCouvertureUrl} alt="" fill sizes="300px" className="object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/10" />
                </div>
                <div className="px-3 pb-3 -mt-6">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden bg-stone-200 border-4 border-white flex items-center justify-center mb-2">
                    {v.logoUrl ? (
                      <Image src={v.logoUrl} alt={v.nomBoutique} fill sizes="56px" className="object-cover" />
                    ) : (
                      <Store size={20} className="text-indigo-900/30" />
                    )}
                  </div>
                  <p className="flex items-center gap-1 text-sm font-semibold text-indigo-900 truncate">
                    <span className="truncate">{v.nomBoutique}</span>
                    {verifie && <BadgeVendeurVerifie taille={14} variante="icone" />}
                  </p>
                  {v.ville && <p className="text-xs text-indigo-900/50 truncate">{v.ville}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    {stats.nbAvis > 0 && (
                      <p className="flex items-center gap-1 text-xs text-mango-600">
                        <Star size={11} className="fill-mango-500 text-mango-500" /> {stats.noteMoyenne.toFixed(1)}
                      </p>
                    )}
                    <p className="flex items-center gap-1 text-xs text-indigo-900/50">
                      <Heart size={11} /> {v._count.suivis} abonné{v._count.suivis > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
