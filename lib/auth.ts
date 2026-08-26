import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "changez-cette-cle-en-production";
const COOKIE_NAME = "e_mboppi_session";

export type SessionPayload = {
  id: string;
  role: "CLIENT" | "VENDEUR" | "ADMIN";
  nom: string;
};

export async function hacherMotDePasse(motDePasse: string) {
  return bcrypt.hash(motDePasse, 10);
}

export async function verifierMotDePasse(motDePasse: string, hash: string) {
  return bcrypt.compare(motDePasse, hash);
}

// Durée de la session côté cookie (fenêtre glissante — voir middleware.ts,
// qui renouvelle ce cookie à chaque visite). Un vendeur qui revient au
// moins une fois tous les 30 jours ne se retrouve donc jamais déconnecté
// "tout seul" : il reste connecté tant qu'il utilise le site, et n'a plus
// besoin de rouvrir une session à chaque visite.
const DUREE_COOKIE_SESSION = 60 * 60 * 24 * 30; // 30 jours, glissant

export function creerSession(payload: SessionPayload) {
  // Le jeton lui-même vit plus longtemps que le cookie glissant, pour ne
  // jamais devenir invalide "sous les pieds" d'un cookie déjà renouvelé
  // par le middleware — c'est l'expiration du cookie (30 jours glissants,
  // remis à zéro à chaque visite) qui détermine réellement la déconnexion.
  const token = jwt.sign(payload, SECRET, { expiresIn: "365d" });
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: DUREE_COOKIE_SESSION,
    path: "/",
  });
}

export function lireSession(): SessionPayload | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export function detruireSession() {
  cookies().delete(COOKIE_NAME);
}
