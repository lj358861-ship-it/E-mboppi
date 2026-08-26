import { NextRequest, NextResponse } from "next/server";

/**
 * Fenêtre glissante pour les cookies "session vendeur" et "appareil client".
 *
 * Sans ça, un vendeur connecté finissait par être déconnecté après 30 jours
 * même s'il visitait le site tous les jours (le cookie expirait à date
 * fixe). Ici, à chaque page vue, on remet le compteur à zéro : tant que la
 * personne revient au moins une fois avant l'expiration, elle reste
 * connectée indéfiniment — la déconnexion n'arrive que si le site n'est
 * pas visité pendant 30 jours d'affilée.
 *
 * Le cookie appareil (identité anonyme client, voir lib/appareil.ts) suit
 * la même logique sur une fenêtre de 2 ans.
 */

const COOKIE_SESSION = "e_mboppi_session";
const COOKIE_APPAREIL = "e_mboppi_appareil";
const TRENTE_JOURS = 60 * 60 * 24 * 30;
const DEUX_ANS = 60 * 60 * 24 * 365 * 2;

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const session = request.cookies.get(COOKIE_SESSION);
  if (session) {
    response.cookies.set(COOKIE_SESSION, session.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: TRENTE_JOURS,
      path: "/",
    });
  }

  const appareil = request.cookies.get(COOKIE_APPAREIL);
  if (appareil) {
    response.cookies.set(COOKIE_APPAREIL, appareil.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: DEUX_ANS,
      path: "/",
    });
  }

  return response;
}

export const config = {
  // On laisse les routes API gérer leurs propres cookies (connexion,
  // déconnexion, création du cookie appareil) pour éviter tout conflit ;
  // le middleware ne fait que rafraîchir des cookies déjà présents sur les
  // pages classiques.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)"],
};
