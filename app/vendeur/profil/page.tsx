import { prisma } from "@/lib/prisma";
import { lireSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Store } from "lucide-react";
import ProfilBoutique from "../dashboard/ProfilBoutique";
import BadgeVendeurVerifie from "@/components/BadgeVendeurVerifie";
import DeconnexionBouton from "@/components/DeconnexionBouton";
import { estVendeurVerifie } from "@/lib/abonnement";

export const dynamic = "force-dynamic";

// /vendeur/profil — le "Mon profil" du vendeur, séparé du tableau de bord
// complet : accessible à tout moment tant que sa session est active (voir
// middleware.ts, qui la garde vivante tant qu'il revient sur le site), pour
// éditer sa boutique sans repasser par la connexion ni par la gestion des
// articles.
export default async function ProfilVendeur() {
  const session = lireSession();
  if (!session || session.role !== "VENDEUR") redirect("/vendeur/connexion");

  const vendeur = await prisma.vendeur.findUnique({
    where: { utilisateurId: session.id },
    include: {
      utilisateur: { select: { nom: true, telephone: true, whatsapp: true } },
      abonnements: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!vendeur) redirect("/vendeur/connexion");

  const verifie = estVendeurVerifie(vendeur, vendeur.abonnements[0]);

  return (
    <div className="px-4 md:px-8 py-6 max-w-lg mx-auto">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <h1 className="font-display text-2xl font-semibold text-indigo-900">Mon profil</h1>
        {verifie && <BadgeVendeurVerifie taille={13} variante="texte" />}
      </div>
      <p className="text-sm text-indigo-900/60 mb-6">
        Connecté en tant que <strong>{vendeur.utilisateur.nom}</strong> ({vendeur.utilisateur.telephone})
      </p>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Link
          href="/vendeur/dashboard"
          className="flex items-center gap-1.5 text-sm font-medium text-indigo-900/70 hover:text-indigo-900"
        >
          <LayoutDashboard size={15} /> Tableau de bord
        </Link>
        <Link
          href={`/vendeur/${vendeur.id}`}
          target="_blank"
          className="flex items-center gap-1.5 text-sm font-medium text-indigo-900/70 hover:text-indigo-900"
        >
          <Store size={15} /> Voir ma boutique publique
        </Link>
        <DeconnexionBouton />
      </div>

      <ProfilBoutique
        nomBoutique={vendeur.nomBoutique}
        description={vendeur.description}
        ville={vendeur.ville}
        logoUrl={vendeur.logoUrl}
        photoCouvertureUrl={vendeur.photoCouvertureUrl}
      />

      <p className="text-xs text-indigo-900/40 mt-6">
        Votre session reste active tant que vous visitez E-Mboppi régulièrement — pas besoin de
        vous reconnecter à chaque fois.
      </p>
    </div>
  );
}
