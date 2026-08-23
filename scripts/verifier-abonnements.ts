/**
 * Vérifie et expire les abonnements dépassés.
 * À utiliser comme Cron Job Railway : npm run cron:abonnements
 * (alternative à l'appel HTTP GET /api/abonnements/verifier)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const expires = await prisma.abonnement.findMany({
    where: { statut: "ACTIF", dateFin: { lt: new Date() } },
  });

  for (const ab of expires) {
    await prisma.abonnement.update({ where: { id: ab.id }, data: { statut: "EXPIRE" } });
    await prisma.produit.updateMany({ where: { vendeurId: ab.vendeurId }, data: { visible: false } });
  }

  console.log(`${expires.length} abonnement(s) expiré(s) traité(s).`);
}

main().finally(() => prisma.$disconnect());
