import { prisma } from "@/lib/prisma";
import { lireIdAppareil } from "@/lib/appareil";
import { notFound } from "next/navigation";
import { MapPin, MessageCircle, Store } from "lucide-react";
import { lienContacterVendeur } from "@/lib/whatsapp";
import { estVendeurVerifie } from "@/lib/abonnement";
import CarteProduitVideo from "@/components/CarteProduitVideo";
import BoutonSuivreBoutique from "@/components/BoutonSuivreBoutique";
import BadgeVendeurVerifie from "@/components/BadgeVendeurVerifie";
import BoutonPartager from "@/components/BoutonPartager";

export const dynamic = "force-dynamic";

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

  const [suiviExistant, nbSuivis] = await Promise.all([
    appareilId
      ? prisma.suivi.findUnique({ where: { appareilId_vendeurId: { appareilId, vendeurId: vendeur.id } } })
      : null,
    prisma.suivi.count({ where: { vendeurId: vendeur.id } }),
  ]);

  const verifie = estVendeurVerifie(vendeur, vendeur.abonnements[0]);
  const urlBoutique = `${process.env.NEXT_PUBLIC_SITE_URL || "https://e-mboppi.com"}/vendeur/${vendeur.id}`;

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
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-2xl font-semibold text-indigo-900">{vendeur.nomBoutique}</h1>
            {verifie && <BadgeVendeurVerifie taille={13} />}
          </div>
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
            {" · "}
            Membre depuis{" "}
            {vendeur.createdAt.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2">
          <a
            href={lienContacterVendeur(vendeur.utilisateur.whatsapp, `la boutique ${vendeur.nomBoutique}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-feuille-500 hover:bg-feuille-600 transition-colors text-white px-5 py-3 rounded-full font-medium text-sm w-fit"
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
              villeVendeur={vendeur.ville}
              whatsappVendeur={vendeur.utilisateur.whatsapp}
              statutStock={p.statutStock}
              enPromo={p.boost}
              estFavori={favoris.has(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
