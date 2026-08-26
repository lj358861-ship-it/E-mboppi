import webpush from "web-push";
import { prisma } from "./prisma";

/**
 * E-Mboppi — Notifications push navigateur (Web Push)
 *
 * Permet d'alerter un vendeur (rappel de renouvellement d'abonnement, etc.)
 * même s'il n'a pas ouvert son tableau de bord — contrairement aux liens
 * wa.me qui exigent un clic pour s'ouvrir, une vraie notification push
 * arrive directement sur l'appareil du vendeur (si la PWA est installée et
 * les notifications autorisées).
 *
 * Nécessite une paire de clés VAPID (une seule fois pour tout le projet) :
 *   npx web-push generate-vapid-keys
 * puis, dans les variables d'environnement (Railway + .env local) :
 *   WEB_PUSH_VAPID_PUBLIC_KEY=...
 *   WEB_PUSH_VAPID_PRIVATE_KEY=...
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY=... (même valeur que la clé publique, exposée au client)
 */

const CLE_PUBLIQUE = process.env.WEB_PUSH_VAPID_PUBLIC_KEY;
const CLE_PRIVEE = process.env.WEB_PUSH_VAPID_PRIVATE_KEY;

let configure = false;
function sAssurerConfigure() {
  if (configure || !CLE_PUBLIQUE || !CLE_PRIVEE) return;
  webpush.setVapidDetails("mailto:contact@e-mboppi.com", CLE_PUBLIQUE, CLE_PRIVEE);
  configure = true;
}

export function notificationsPushDisponibles() {
  return Boolean(CLE_PUBLIQUE && CLE_PRIVEE);
}

/**
 * Envoie une notification à toutes les souscriptions (appareils) d'un
 * utilisateur. Supprime automatiquement les souscriptions devenues
 * invalides (désinstallation, permission révoquée...).
 */
export async function envoyerNotificationUtilisateur(
  utilisateurId: string,
  payload: { titre: string; corps: string; url?: string }
) {
  if (!notificationsPushDisponibles()) return { envoyees: 0 };
  sAssurerConfigure();

  const souscriptions = await prisma.abonnementPush.findMany({ where: { utilisateurId } });
  if (souscriptions.length === 0) return { envoyees: 0 };

  let envoyees = 0;
  for (const s of souscriptions) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify({ title: payload.titre, body: payload.corps, url: payload.url || "/vendeur/dashboard" })
      );
      envoyees++;
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number })?.statusCode;
      // 404/410 = souscription expirée ou révoquée côté navigateur : on la retire.
      if (statusCode === 404 || statusCode === 410) {
        await prisma.abonnementPush.delete({ where: { id: s.id } }).catch(() => {});
      }
    }
  }
  return { envoyees };
}
