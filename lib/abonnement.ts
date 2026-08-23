import { prisma } from "./prisma";

export const DUREE_ABONNEMENT_JOURS = 30;
export const MONTANT_ABONNEMENT = 2000;

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
    },
  });

  await prisma.produit.updateMany({
    where: { vendeurId: abonnement.vendeurId },
    data: { visible: true },
  });

  return abonnement;
}
