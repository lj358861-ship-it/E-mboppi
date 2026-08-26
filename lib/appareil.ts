import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

/**
 * Identifiant d'appareil — E-Mboppi
 *
 * Les clients du marché n'ont pas besoin de créer un compte pour garder
 * leurs favoris : on attribue un identifiant anonyme à l'appareil (cookie
 * longue durée), et les favoris sont enregistrés contre cet identifiant.
 * Résultat : un article marqué favori le reste sur cet appareil — pas
 * besoin de le remarquer, le cœur apparaît déjà rempli partout où
 * l'article est affiché (accueil, recherche, boutique...).
 *
 * Chaque appareil reçoit aussi un pseudo généré automatiquement (ex.
 * "AcheteurMalin4821"), modifiable à tout moment depuis /mon-profil — voir
 * ProfilAppareil dans prisma/schema.prisma. Toujours pas besoin de compte :
 * juste un nom sympathique attaché à l'appareil plutôt qu'un identifiant
 * technique.
 */

const COOKIE_APPAREIL = "e_mboppi_appareil";
const DEUX_ANS = 60 * 60 * 24 * 365 * 2;

/** Lit l'identifiant d'appareil existant, sans en créer un nouveau (lecture seule). */
export function lireIdAppareil(): string | null {
  return cookies().get(COOKIE_APPAREIL)?.value || null;
}

/**
 * Lit l'identifiant d'appareil, et en crée un (cookie 2 ans) s'il n'existe
 * pas encore. À utiliser dans les Route Handlers (POST/GET d'API) où l'on a
 * le droit d'écrire des cookies.
 */
export function idAppareil(): string {
  const magasin = cookies();
  const existant = magasin.get(COOKIE_APPAREIL)?.value;
  if (existant) return existant;

  const id = randomUUID();
  magasin.set(COOKIE_APPAREIL, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: DEUX_ANS,
    path: "/",
  });
  return id;
}

const ADJECTIFS_PSEUDO = [
  "Malin", "Rapide", "Futé", "Chic", "Vif", "Gentil", "Curieux", "Habile",
  "Joyeux", "Discret", "Astucieux", "Élégant", "Généreux", "Radieux",
];
const NOMS_PSEUDO = [
  "Acheteur", "Client", "Visiteur", "Explorateur", "Chineur", "Fan", "Amateur", "Curieux",
];

/** Génère un pseudo par défaut sympathique, ex. "AcheteurMalin4821". */
function genererPseudo(): string {
  const nom = NOMS_PSEUDO[Math.floor(Math.random() * NOMS_PSEUDO.length)];
  const adjectif = ADJECTIFS_PSEUDO[Math.floor(Math.random() * ADJECTIFS_PSEUDO.length)];
  const numero = Math.floor(1000 + Math.random() * 9000);
  return `${nom}${adjectif}${numero}`;
}

/**
 * Lit le profil (pseudo) de cet appareil, et le crée avec un pseudo
 * généré automatiquement s'il n'existe pas encore. C'est ce que /mon-profil
 * et /api/appareil utilisent pour afficher/éditer le pseudo du client, sans
 * jamais lui demander de créer un compte.
 */
export async function obtenirProfilAppareil() {
  const appareilId = idAppareil();

  const existant = await prisma.profilAppareil.findUnique({ where: { appareilId } });
  if (existant) return existant;

  return prisma.profilAppareil.create({
    data: { appareilId, pseudo: genererPseudo() },
  });
}
