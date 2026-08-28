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

type SouscriptionPush = { id: string; endpoint: string; p256dh: string; auth: string };

/**
 * Envoie une notification à une liste de souscriptions déjà chargées, et
 * retire automatiquement celles devenues invalides (désinstallation,
 * permission révoquée...). Fonction interne partagée par les envois
 * vendeur (utilisateurId) et client (appareilId) ci-dessous.
 */
async function envoyerAuxSouscriptions(
  souscriptions: SouscriptionPush[],
  payload: { titre: string; corps: string; url?: string },
  urlParDefaut: string
) {
  if (souscriptions.length === 0) return { envoyees: 0 };
  sAssurerConfigure();

  let envoyees = 0;
  for (const s of souscriptions) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify({ title: payload.titre, body: payload.corps, url: payload.url || urlParDefaut })
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

/**
 * VENDEUR — notification à toutes les souscriptions d'un compte connecté
 * (rappel de renouvellement d'abonnement, etc.). Ouvre le tableau de bord
 * vendeur par défaut au clic.
 */
export async function envoyerNotificationUtilisateur(
  utilisateurId: string,
  payload: { titre: string; corps: string; url?: string }
) {
  if (!notificationsPushDisponibles()) return { envoyees: 0 };
  const souscriptions = await prisma.abonnementPush.findMany({ where: { utilisateurId } });
  return envoyerAuxSouscriptions(souscriptions, payload, "/vendeur/dashboard");
}

/**
 * CLIENT — notification à toutes les souscriptions d'un appareil anonyme
 * (boutique suivie qui publie, promo en rapport avec une recherche
 * récente...). Ouvre la page d'accueil par défaut au clic.
 */
export async function envoyerNotificationAppareil(
  appareilId: string,
  payload: { titre: string; corps: string; url?: string }
) {
  if (!notificationsPushDisponibles()) return { envoyees: 0 };
  const souscriptions = await prisma.abonnementPush.findMany({ where: { appareilId } });
  return envoyerAuxSouscriptions(souscriptions, payload, "/");
}

/**
 * CLIENT (diffusion) — notification à TOUTES les souscriptions clients
 * (tous appareils confondus), sans ciblage. Réservée aux rappels génériques
 * du marché (voir lib/notifications.ts::rappelsMarche) — n'envoie jamais aux
 * souscriptions vendeur (utilisateurId), qui reçoivent uniquement leurs
 * propres alertes de boutique.
 */
export async function envoyerNotificationTousClients(payload: {
  titre: string;
  corps: string;
  url?: string;
}) {
  if (!notificationsPushDisponibles()) return { envoyees: 0 };
  const souscriptions = await prisma.abonnementPush.findMany({
    where: { appareilId: { not: null } },
  });
  return envoyerAuxSouscriptions(souscriptions, payload, "/");
}
