import { prisma } from "@/lib/prisma";
import { lireSession } from "@/lib/auth";
import { joursRestants, MONTANT_ABONNEMENT } from "@/lib/abonnement";
import { lienNotifierPaiement } from "@/lib/whatsapp";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, MessageCircle, Store } from "lucide-react";
import ProduitForm from "./ProduitForm";
import ProfilBoutique from "./ProfilBoutique";

export const dynamic = "force-dynamic";

export default async function DashboardVendeur() {
  const session = lireSession();
  if (!session || session.role !== "VENDEUR") redirect("/vendeur/connexion");

  const vendeur = await prisma.vendeur.findUnique({
    where: { utilisateurId: session.id },
    include: {
      abonnements: { orderBy: { createdAt: "desc" }, take: 1 },
      produits: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!vendeur) redirect("/vendeur/connexion");

  const abonnement = vendeur.abonnements[0];
  const actif = abonnement?.statut === "ACTIF";
  const jours = abonnement ? joursRestants(abonnement.dateFin) : 0;

  return (
    <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl font-semibold text-indigo-900">{vendeur.nomBoutique}</h1>
        <Link
          href={`/vendeur/${vendeur.id}`}
          target="_blank"
          className="flex items-center gap-1.5 text-xs font-medium text-indigo-900/60 hover:text-indigo-900"
        >
          <Store size={14} /> Voir ma boutique publique
        </Link>
      </div>
      <p className="text-sm text-indigo-900/60 mb-6">Tableau de bord vendeur</p>

      {actif ? (
        <div className="flex items-start gap-3 bg-feuille-500/10 border border-feuille-500/30 rounded-2xl p-4 mb-6">
          <CheckCircle2 className="text-feuille-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-indigo-900">Abonnement actif</p>
            <p className="text-sm text-indigo-900/70">
              Il vous reste <strong>{jours} jour{jours > 1 ? "s" : ""}</strong> avant le
              renouvellement. Vos articles restent visibles sur E-Mboppi.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 bg-piment-500/10 border border-piment-500/30 rounded-2xl p-4 mb-6">
          <AlertTriangle className="text-piment-500 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="font-medium text-indigo-900">Abonnement expiré</p>
            <p className="text-sm text-indigo-900/70 mb-3">
              Vos articles ne sont plus visibles par les clients. Versez{" "}
              <strong>{MONTANT_ABONNEMENT.toLocaleString("fr-FR")}F</strong> pour renouveler
              votre abonnement et rendre vos produits accessibles à nouveau.
            </p>
            <a
              href={lienNotifierPaiement(vendeur.nomBoutique)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-piment-500 hover:bg-piment-600 transition-colors text-white px-4 py-2.5 rounded-full text-sm font-medium"
            >
              <MessageCircle size={16} /> Renouveler via WhatsApp
            </a>
          </div>
        </div>
      )}

      <div className="mb-6">
        <ProfilBoutique
          nomBoutique={vendeur.nomBoutique}
          description={vendeur.description}
          ville={vendeur.ville}
          logoUrl={vendeur.logoUrl}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ProduitForm />

        <div>
          <p className="font-display text-lg font-semibold text-indigo-900 mb-3">
            Mes articles ({vendeur.produits.length})
          </p>
          <div className="space-y-2">
            {vendeur.produits.map((p: (typeof vendeur.produits)[number]) => (
              <div
                key={p.id}
                className="flex items-center gap-3 bg-white border border-stone-200 rounded-xl px-4 py-3"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                  {p.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.photos[0]} alt={p.titre} className="w-full h-full object-cover" />
                  ) : p.videoUrl ? (
                    <video src={p.videoUrl} muted className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-indigo-900">{p.titre}</p>
                  <p className="text-xs text-indigo-900/50">{p.prix.toLocaleString("fr-FR")} F</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    p.visible ? "bg-feuille-500/15 text-feuille-600" : "bg-stone-200 text-indigo-900/50"
                  }`}
                >
                  {p.visible ? "Visible" : "Masqué"}
                </span>
              </div>
            ))}
            {vendeur.produits.length === 0 && (
              <p className="text-sm text-indigo-900/50">Aucun article publié pour le moment.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
