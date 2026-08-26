/**
 * Rappelle aux vendeurs que leur abonnement expire bientôt (3 jours avant),
 * via notification push navigateur (voir lib/push.ts). Contrairement aux
 * liens wa.me (qui exigent qu'on les ouvre), une notification push peut
 * atteindre le vendeur sans qu'il ait ouvert son tableau de bord.
 *
 * À utiliser comme Cron Job Railway (quotidien) : npm run cron:rappels
 */
import { prisma } from "../lib/prisma";
import { abonnementsARappeler, marquerRappelEnvoye, joursRestants } from "../lib/abonnement";
import { envoyerNotificationUtilisateur, notificationsPushDisponibles } from "../lib/push";

async function main() {
  if (!notificationsPushDisponibles()) {
    console.log(
      "Clés VAPID non configurées (WEB_PUSH_VAPID_PUBLIC_KEY / WEB_PUSH_VAPID_PRIVATE_KEY) — rappel ignoré."
    );
    return;
  }

  const abonnements = await abonnementsARappeler();
  let notifies = 0;

  for (const ab of abonnements) {
    const jours = joursRestants(ab.dateFin);
    const { envoyees } = await envoyerNotificationUtilisateur(ab.vendeur.utilisateurId, {
      titre: "Abonnement bientôt expiré",
      corps: `Votre boutique "${ab.vendeur.nomBoutique}" ne sera plus visible dans ${jours} jour${
        jours > 1 ? "s" : ""
      }. Renouvelez pour 2000F.`,
      url: "/vendeur/dashboard",
    });
    // On marque le rappel comme envoyé même si le vendeur n'a activé aucune
    // souscription (envoyees === 0) : le tableau de bord affiche déjà
    // l'alerte à chaque visite, inutile de retenter le cron chaque jour.
    await marquerRappelEnvoye(ab.id);
    if (envoyees > 0) notifies++;
  }

  console.log(`${abonnements.length} abonnement(s) à relancer, ${notifies} notification(s) push envoyée(s).`);
}

main().finally(() => prisma.$disconnect());
