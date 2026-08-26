"use client";

import { useEffect } from "react";

/** Enregistre le service worker (public/sw.js) — rend le site installable
 * en PWA (icône sur l'écran d'accueil, ouverture en plein écran) et ajoute
 * un minimum de confort hors connexion. Ne bloque jamais le rendu : montée
 * silencieusement après l'hydratation. */
export default function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
