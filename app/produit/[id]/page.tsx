import { prisma } from "@/lib/prisma";
import { lireSession } from "@/lib/auth";
import { lienContacterVendeur } from "@/lib/whatsapp";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MessageCircle, Store, Tag } from "lucide-react";
import EcrireAuVendeur from "./EcrireAuVendeur";
import GalerieProduit from "./GalerieProduit";

export const dynamic = "force-dynamic";

export default async function PageProduit({ params }: { params: { id: string } }) {
  const produit = await prisma.produit.findUnique({
    where: { id: params.id },
    include: { vendeur: { include: { utilisateur: true } } },
  });

  if (!produit) notFound();

  const session = lireSession();

  return (
    <div className="px-4 md:px-8 py-6 max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
      <GalerieProduit videoUrl={produit.videoUrl} photos={produit.photos} titre={produit.titre} />

      <div>
        <Link
          href={`/vendeur/${produit.vendeur.id}`}
          className="flex items-center gap-2 mb-2 w-fit group"
        >
          <span className="w-8 h-8 rounded-full overflow-hidden bg-stone-200 flex items-center justify-center flex-shrink-0">
            {produit.vendeur.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={produit.vendeur.logoUrl} alt={produit.vendeur.nomBoutique} className="w-full h-full object-cover" />
            ) : (
              <Store size={14} className="text-indigo-900/40" />
            )}
          </span>
          <span className="text-sm text-indigo-900/60 group-hover:underline">{produit.vendeur.nomBoutique}</span>
        </Link>

        <h1 className="font-display text-2xl font-semibold text-indigo-900 mb-2">{produit.titre}</h1>

        <div className="flex items-center gap-3 mb-4">
          <p className="font-mono text-mango-600 text-xl font-semibold">
            {produit.prix.toLocaleString("fr-FR")} F
          </p>
          {produit.categorie && (
            <span className="flex items-center gap-1 bg-stone-100 text-indigo-900/60 text-xs px-2.5 py-1 rounded-full">
              <Tag size={12} /> {produit.categorie}
            </span>
          )}
        </div>

        {produit.description && (
          <p className="text-indigo-900/80 leading-relaxed mb-6">{produit.description}</p>
        )}

        <div className="flex flex-wrap gap-3 mb-8">
          <a
            href={lienContacterVendeur(produit.vendeur.utilisateur.whatsapp, produit.titre)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-feuille-500 hover:bg-feuille-600 transition-colors text-white px-5 py-3 rounded-full font-medium text-sm"
          >
            <MessageCircle size={16} /> WhatsApp du vendeur
          </a>
          <EcrireAuVendeur
            vendeurUtilisateurId={produit.vendeur.utilisateur.id}
            moiId={session?.id ?? null}
            titreProduit={produit.titre}
          />
        </div>
      </div>
    </div>
  );
}
