import { cookies } from "next/headers";
import { randomUUID } from "crypto";

/**
 * Identifiant d'appareil — E-Mboppi
 *
 * Les clients du marché n'ont pas besoin de créer un compte pour garder
 * leurs favoris : on attribue un identifiant anonyme à l'appareil (cookie
 * longue durée), et les favoris sont enregistrés contre cet identifiant.
 * Résultat : un article marqué favori le reste sur cet appareil — pas
 * besoin de le remarquer, le cœur apparaît déjà rempli partout où
 * l'article est affiché (accueil, recherche, boutique...).
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
