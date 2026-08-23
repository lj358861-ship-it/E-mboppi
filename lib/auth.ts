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

export function creerSession(payload: SessionPayload) {
  const token = jwt.sign(payload, SECRET, { expiresIn: "30d" });
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
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
