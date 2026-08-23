/**
 * Crée le compte administrateur Kmer Vision.
 * Usage (une seule fois, après le premier déploiement) :
 *   ADMIN_TELEPHONE=237600000000 ADMIN_MOT_DE_PASSE=motdepasse npm run seed:admin
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const telephone = process.env.ADMIN_TELEPHONE;
  const motDePasse = process.env.ADMIN_MOT_DE_PASSE;

  if (!telephone || !motDePasse) {
    console.error("Définissez ADMIN_TELEPHONE et ADMIN_MOT_DE_PASSE avant de lancer ce script.");
    process.exit(1);
  }

  const existant = await prisma.utilisateur.findUnique({ where: { telephone } });
  if (existant) {
    console.log("Un compte existe déjà avec ce numéro.");
    return;
  }

  const admin = await prisma.utilisateur.create({
    data: {
      nom: "Kmer Vision",
      telephone,
      whatsapp: telephone,
      motDePasse: await bcrypt.hash(motDePasse, 10),
      role: "ADMIN",
    },
  });

  console.log(`Compte admin créé : ${admin.telephone}`);
}

main().finally(() => prisma.$disconnect());
