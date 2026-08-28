import { prisma } from "./prisma";

export const DUREE_ABONNEMENT_JOURS = 30;
export const MONTANT_ABONNEMENT = 2000;

// Ancienneté minimum (en jours) avant qu'une boutique avec abonnement actif
// obtienne le badge "Vendeur vérifié" — évite qu'un compte tout juste créé
// et payé une fois se pare de ce badge de confiance.
export const VERIFIE_ANCIENNETE_JOURS = 60;

/**
 * Un vendeur est "vérifié" (badge affiché aux clients) de deux façons
 * indépendantes, l'une suffit :
 * - Automatique : abonnement actif ET boutique existant depuis au moins
 *   VERIFIE_ANCIENNETE_JOURS jours — un signal de confiance simple pour un
 *   marché où l'identité n'est pas vérifiée par pièce.
 * - Manuelle : l'admin a certifié la boutique (champ `certifie`, voir
 *   app/admin/AdminVendeurs.tsx) — permet de vérifier un vendeur de confiance
 *   dès son arrivée, sans attendre les 60 jours.
 */
export function estVendeurVerifie(
  vendeur: { createdAt: Date; certifie?: boolean },
  abonnement?: { statut: string } | null
): boolean {
  if (vendeur.certifie) return true;
  if (!abonnement || abonnement.statut !== "ACTIF") return false;
  const ancienneteMs = Date.now() - new Date(vendeur.createdAt).getTime();
  const ancienneteJours = ancienneteMs / (1000 * 60 * 60 * 24);
  return ancienneteJours >= VERIFIE_ANCIENNETE_JOURS;
}

/** Nombre de jours restants avant expiration (0 si expiré ou aucun abonnement actif) */
export function joursRestants(dateFin: Date): number {
  const diffMs = new Date(dateFin).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Tâche à exécuter chaque jour (via cron Railway) :
 * - passe en EXPIRE tout abonnement ACTIF dont la date de fin est dépassée
 * - masque automatiquement les produits des vendeurs concernés
 */
export async function verifierAbonnementsExpires() {
  const abonnementsExpires = await prisma.abonnement.findMany({
    where: { statut: "ACTIF", dateFin: { lt: new Date() } },
  });

  for (const ab of abonnementsExpires) {
    await prisma.abonnement.update({
      where: { id: ab.id },
      data: { statut: "EXPIRE" },
    });
    await prisma.produit.updateMany({
      where: { vendeurId: ab.vendeurId },
      data: { visible: false },
    });
  }

  return { vendeursDesactives: abonnementsExpires.length };
}

/**
 * Repère les abonnements ACTIFS qui expirent dans JOURS_AVANT_RAPPEL jours
 * ou moins, et pas encore relancés — à utiliser par le cron de rappel
 * (scripts/rappel-abonnements.ts) pour notifier le vendeur avant qu'il ne
 * découvre l'expiration en ouvrant son tableau de bord.
 */
export const JOURS_AVANT_RAPPEL = 3;

export async function abonnementsARappeler() {
  const dansNJours = new Date();
  dansNJours.setDate(dansNJours.getDate() + JOURS_AVANT_RAPPEL);

  return prisma.abonnement.findMany({
    where: { statut: "ACTIF", rappelEnvoye: false, dateFin: { lte: dansNJours, gt: new Date() } },
    include: { vendeur: { include: { utilisateur: true } } },
  });
}

export async function marquerRappelEnvoye(abonnementId: string) {
  await prisma.abonnement.update({ where: { id: abonnementId }, data: { rappelEnvoye: true } });
}

/**
 * Validation d'un paiement par l'admin : réactive l'abonnement pour 30 jours
 * et rend les produits du vendeur visibles à nouveau.
 */
export async function validerPaiement(abonnementId: string, adminId: string) {
  const dateFin = new Date();
  dateFin.setDate(dateFin.getDate() + DUREE_ABONNEMENT_JOURS);

  const abonnement = await prisma.abonnement.update({
    where: { id: abonnementId },
    data: {
      statut: "ACTIF",
      dateDebut: new Date(),
      dateFin,
      valideParAdminId: adminId,
      dateValidation: new Date(),
      rappelEnvoye: false,
    },
  });

  await prisma.produit.updateMany({
    where: { vendeurId: abonnement.vendeurId },
    data: { visible: true },
  });

  return abonnement;
}
