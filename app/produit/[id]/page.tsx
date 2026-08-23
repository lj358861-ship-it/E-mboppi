import { prisma } from "@/lib/prisma";
import { lireSession } from "@/lib/auth";
import { lienContacterVendeur } from "@/lib/whatsapp";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import EcrireAuVendeur from "./EcrireAuVendeur";

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
      <div className="rounded-2xl overflow-hidden bg-indigo-950 aspect-[9/16] max-h-[560px] mx-auto w-full">
        {produit.videoUrl ? (
          <video src={produit.videoUrl} controls autoPlay muted loop className="w-full h-full object-cover" />
        ) : produit.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={produit.imageUrl} alt={produit.titre} className="w-full h-full object-cover" />
        ) : null}
      </div>

      <div>
        <p className="text-sm text-indigo-900/60 mb-1">{produit.vendeur.nomBoutique}</p>
        <h1 className="font-display text-2xl font-semibold text-indigo-900 mb-2">{produit.titre}</h1>
        <p className="font-mono text-mango-600 text-xl font-semibold mb-4">
          {produit.prix.toLocaleString("fr-FR")} F
        </p>
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
