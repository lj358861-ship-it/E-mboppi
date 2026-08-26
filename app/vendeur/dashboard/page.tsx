import { prisma } from "@/lib/prisma";
import { lireSession } from "@/lib/auth";
import { joursRestants, MONTANT_ABONNEMENT, estVendeurVerifie } from "@/lib/abonnement";
import { lienNotifierPaiement } from "@/lib/whatsapp";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, MessageCircle, Store, Eye, MousePointerClick } from "lucide-react";
import ProduitForm from "./ProduitForm";
import ProfilBoutique from "./ProfilBoutique";
import MesArticles from "./MesArticles";
import BadgeMessagesNonLus from "@/components/BadgeMessagesNonLus";
import BadgeVendeurVerifie from "@/components/BadgeVendeurVerifie";

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
  const verifie = estVendeurVerifie(vendeur, abonnement);

  const totalVues = vendeur.produits.reduce((s, p) => s + p.vues, 0);
  const totalClics = vendeur.produits.reduce((s, p) => s + p.clicsContact, 0);

  return (
    <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="font-display text-2xl font-semibold text-indigo-900">{vendeur.nomBoutique}</h1>
          {verifie && <BadgeVendeurVerifie taille={13} />}
        </div>
        <div className="flex items-center gap-4">
          <BadgeMessagesNonLus />
          <Link
            href={`/vendeur/${vendeur.id}`}
            target="_blank"
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-900/60 hover:text-indigo-900"
          >
            <Store size={14} /> Voir ma boutique publique
          </Link>
        </div>
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

      <div className="flex gap-3 mb-6">
        <div className="flex-1 flex items-center gap-3 bg-white border border-stone-200 rounded-2xl p-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-900/5 text-indigo-900 flex-shrink-0">
            <Eye size={18} />
          </span>
          <div>
            <p className="font-display text-xl font-semibold text-indigo-900 leading-none">{totalVues}</p>
            <p className="text-xs text-indigo-900/50 mt-1">Vues sur vos articles</p>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-3 bg-white border border-stone-200 rounded-2xl p-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-feuille-500/10 text-feuille-600 flex-shrink-0">
            <MousePointerClick size={18} />
          </span>
          <div>
            <p className="font-display text-xl font-semibold text-indigo-900 leading-none">{totalClics}</p>
            <p className="text-xs text-indigo-900/50 mt-1">Clics « Contacter »</p>
          </div>
        </div>
      </div>

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
          <MesArticles produits={vendeur.produits} nomBoutique={vendeur.nomBoutique} />
        </div>
      </div>
    </div>
  );
}
