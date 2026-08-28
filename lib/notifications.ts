import { prisma } from "@/lib/prisma";
import { envoyerNotificationUtilisateur, envoyerNotificationAppareil, envoyerNotificationTousClients } from "@/lib/push";
import { elargirTermeRecherche } from "@/lib/synonymes";

/**
 * E-Mboppi — Notifications push
 *
 * Deux publics bien distincts, à ne jamais mélanger :
 *
 * - VENDEUR (compte) : alertes sur SA boutique (abonnement, ventes...).
 *   Envoyées via envoyerNotificationUtilisateur, ouvrent /vendeur/dashboard.
 *
 * - CLIENT (appareil anonyme) : alertes sur ce qu'IL suit/recherche.
 *   Envoyées via envoyerNotificationAppareil, ouvrent la fiche produit ou
 *   la boutique concernée.
 */

// ---------------------------------------------------------------------------
// VENDEUR
// ---------------------------------------------------------------------------

/**
 * Rappel d'abonnement bientôt expiré. La logique de sélection des
 * abonnements à relancer vit dans lib/abonnement.ts::abonnementsARappeler ;
 * cette fonction ne fait qu'envoyer le push (voir scripts/rappel-abonnements.ts,
 * exécuté chaque jour par le cron Railway).
 */
export async function notifierVendeurAbonnementBientotExpire(
  vendeur: { utilisateurId: string; nomBoutique: string },
  joursRestants: number
) {
  return envoyerNotificationUtilisateur(vendeur.utilisateurId, {
    titre: "Abonnement bientôt expiré",
    corps: `Votre boutique "${vendeur.nomBoutique}" ne sera plus visible dans ${joursRestants} jour${
      joursRestants > 1 ? "s" : ""
    }. Renouvelez pour 2000F.`,
    url: "/vendeur/dashboard",
  });
}

// ---------------------------------------------------------------------------
// CLIENT
// ---------------------------------------------------------------------------

/**
 * À appeler juste après la création d'un article VISIBLE (abonnement
 * vendeur actif) : prévient chaque client qui suit cette boutique
 * (model Suivi, appareil anonyme) qu'un nouvel article vient d'arriver.
 */
export async function notifierSuiviNouveauProduit(produit: {
  id: string;
  titre: string;
  vendeurId: string;
}) {
  const [vendeur, suivis] = await Promise.all([
    prisma.vendeur.findUnique({ where: { id: produit.vendeurId }, select: { nomBoutique: true } }),
    prisma.suivi.findMany({ where: { vendeurId: produit.vendeurId }, select: { appareilId: true } }),
  ]);
  if (!vendeur || suivis.length === 0) return { envoyees: 0 };

  let envoyees = 0;
  for (const { appareilId } of suivis) {
    const { envoyees: n } = await envoyerNotificationAppareil(appareilId, {
      titre: `${vendeur.nomBoutique} vient de publier un article`,
      corps: produit.titre,
      url: `/produit/${produit.id}`,
    });
    envoyees += n;
  }
  return { envoyees };
}

/**
 * À appeler juste après la création OU la mise en promo (enPromo passe à
 * true) d'un article VISIBLE : prévient les clients dont la dernière
 * recherche (model RechercheRecente) correspond au titre/catégorie/nature
 * de l'article. Utilise le même élargissement lexical que la recherche
 * (lib/synonymes.ts) pour que "portable" en promo notifie aussi quelqu'un
 * qui a cherché "smartphone".
 */
export async function notifierRecherchePromo(produit: {
  id: string;
  titre: string;
  categorie: string | null;
  nature: string | null;
}) {
  const recherches = await prisma.rechercheRecente.findMany({
    // On ne remonte que les recherches assez récentes (14 jours) — une
    // recherche oubliée depuis des mois n'est plus un signal pertinent.
    where: { updatedAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } },
  });
  if (recherches.length === 0) return { envoyees: 0 };

  const champsProduit = [produit.titre, produit.categorie, produit.nature]
    .filter(Boolean)
    .map((v) => (v as string).toLowerCase());

  let envoyees = 0;
  for (const recherche of recherches) {
    const termesElargis = elargirTermeRecherche(recherche.terme).map((t) => t.toLowerCase());
    const correspond = termesElargis.some((terme) =>
      champsProduit.some((champ) => champ.includes(terme) || terme.includes(champ))
    );
    if (!correspond) continue;

    const { envoyees: n } = await envoyerNotificationAppareil(recherche.appareilId, {
      titre: "Un article en promo pourrait vous intéresser",
      corps: `${produit.titre} — en rapport avec votre recherche "${recherche.terme}"`,
      url: `/produit/${produit.id}`,
    });
    envoyees += n;
  }
  return { envoyees };
}

/**
 * Enregistre (ou met à jour) la dernière recherche d'un appareil client —
 * une seule ligne par appareil, voir lib/notifications.ts::notifierRecherchePromo.
 * N'écrit rien si l'appareil n'a pas encore de cookie (client anonyme
 * jamais interagi ailleurs sur le site) : on ne force pas sa création
 * depuis une simple lecture (GET recherche).
 */
export async function enregistrerRecherche(appareilId: string | null, terme: string) {
  if (!appareilId || !terme.trim()) return;
  await prisma.rechercheRecente.upsert({
    where: { appareilId },
    update: { terme: terme.trim(), updatedAt: new Date() },
    create: { appareilId, terme: terme.trim() },
  });
}

// ---------------------------------------------------------------------------
// RAPPELS MARCHÉ — diffusion générale (pas de ciblage)
// ---------------------------------------------------------------------------

/**
 * Trois rappels génériques envoyés à TOUS les clients (voir
 * lib/push.ts::envoyerNotificationTousClients), pensés pour trois moments
 * de la journée bien espacés — matin, midi, soir — afin d'attirer l'attention
 * sans lasser (jamais plus d'un envoi par créneau, voir
 * app/api/notifications/rappel-marche/route.ts et le cron Railway associé).
 * Le ton reprend volontairement le parler du marché Mboppi.
 */
export const RAPPELS_MARCHE: { titre: string; corps: string }[] = [
  {
    titre: "Asso, tu ne prends rien aujourd'hui ?",
    corps: "Le marché t'attend — viens jeter un œil avant que ça parte.",
  },
  {
    titre: "Les prix aujourd'hui, c'est la magie ma personne",
    corps: "Des articles à petit prix chez nos vendeurs, là maintenant.",
  },
  {
    titre: "On ferme bientôt, dépêche-toi",
    corps: "Un dernier tour au marché avant la fin de la journée ?",
  },
];

/**
 * Envoie le rappel marché n°`index` (0, 1 ou 2 — voir RAPPELS_MARCHE) à tous
 * les clients. `index` vient du cron Railway qui appelle cette route à
 * l'heure voulue (voir README.md) — jamais calculé ici, pour rester simple
 * et prévisible : chaque créneau horaire envoie toujours le même message.
 */
export async function notifierRappelMarche(index: number) {
  const rappel = RAPPELS_MARCHE[index];
  if (!rappel) return { envoyees: 0 };

  return envoyerNotificationTousClients({
    titre: rappel.titre,
    corps: rappel.corps,
    url: "/",
  });
}
