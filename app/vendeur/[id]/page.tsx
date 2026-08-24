import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MapPin, MessageCircle, Store } from "lucide-react";
import { lienContacterVendeur } from "@/lib/whatsapp";
import CarteProduitVideo from "@/components/CarteProduitVideo";

export const dynamic = "force-dynamic";

export default async function ProfilVendeur({ params }: { params: { id: string } }) {
  const vendeur = await prisma.vendeur.findUnique({
    where: { id: params.id },
    include: {
      utilisateur: { select: { whatsapp: true } },
      produits: {
        where: { visible: true },
        orderBy: [{ boost: "desc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!vendeur) notFound();

  return (
    <div className="px-4 md:px-8 py-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-stone-200 flex items-center justify-center flex-shrink-0 border-4 border-white shadow-sm">
          {vendeur.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vendeur.logoUrl} alt={vendeur.nomBoutique} className="w-full h-full object-cover" />
          ) : (
            <Store size={32} className="text-indigo-900/30" />
          )}
        </div>

        <div className="flex-1">
          <h1 className="font-display text-2xl font-semibold text-indigo-900">{vendeur.nomBoutique}</h1>
          {vendeur.ville && (
            <p className="flex items-center gap-1 text-sm text-indigo-900/60 mt-1">
              <MapPin size={14} /> {vendeur.ville}
            </p>
          )}
          {vendeur.description && (
            <p className="text-sm text-indigo-900/70 mt-2 max-w-xl">{vendeur.description}</p>
          )}
          <p className="text-xs text-indigo-900/40 mt-2">
            {vendeur.produits.length} article{vendeur.produits.length > 1 ? "s" : ""} en boutique
          </p>
        </div>

        <a
          href={lienContacterVendeur(vendeur.utilisateur.whatsapp, `la boutique ${vendeur.nomBoutique}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-feuille-500 hover:bg-feuille-600 transition-colors text-white px-5 py-3 rounded-full font-medium text-sm w-fit"
        >
          <MessageCircle size={16} /> Contacter sur WhatsApp
        </a>
      </div>

      {vendeur.produits.length === 0 ? (
        <p className="text-sm text-indigo-900/50">Cette boutique n&apos;a pas encore d&apos;article visible.</p>
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
              whatsappVendeur={vendeur.utilisateur.whatsapp}
            statutStock={p.statutStock}
            />
          ))}
        </div>
      )}
    </div>
  );
}
