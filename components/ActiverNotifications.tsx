"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, Loader2 } from "lucide-react";

function urlBase64VersUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Sur = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const brut = atob(base64Sur);
  return Uint8Array.from(Array.from(brut).map((c) => c.charCodeAt(0)));
}

const TEXTES = {
  vendeur: {
    actif: "Rappels de renouvellement activés",
    inactif: "Activer les rappels de renouvellement",
  },
  client: {
    actif: "Notifications activées",
    inactif: "Activer les notifications",
  },
} as const;

/**
 * Active les notifications push du navigateur/PWA, pour deux publics
 * distincts (voir lib/notifications.ts) :
 * - "vendeur" (défaut) : rappel de renouvellement d'abonnement avant
 *   expiration, sans avoir besoin d'ouvrir le tableau de bord.
 * - "client" : boutique suivie qui publie un nouvel article, promo en
 *   rapport avec une recherche récente.
 * Invisible si la clé VAPID publique n'est pas configurée (fonctionnalité
 * non activée côté serveur).
 */
export default function ActiverNotifications({
  clePubliqueVapid,
  variante = "vendeur",
}: {
  clePubliqueVapid: string | null;
  variante?: "vendeur" | "client";
}) {
  const [statut, setStatut] = useState<"inactif" | "actif" | "indisponible" | "chargement">("chargement");

  useEffect(() => {
    if (!clePubliqueVapid || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatut("indisponible");
      return;
    }
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((sub) => setStatut(sub ? "actif" : "inactif"))
      .catch(() => setStatut("indisponible"));
  }, [clePubliqueVapid]);

  async function activer() {
    if (!clePubliqueVapid) return;
    setStatut("chargement");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatut("inactif");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64VersUint8Array(clePubliqueVapid),
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });
      setStatut("actif");
    } catch {
      setStatut("inactif");
    }
  }

  if (statut === "indisponible") return null;

  if (statut === "actif") {
    return (
      <p className="flex items-center gap-1.5 text-xs font-medium text-feuille-600">
        <BellRing size={14} /> {TEXTES[variante].actif}
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={activer}
      disabled={statut === "chargement"}
      className="flex items-center gap-1.5 text-xs font-medium text-indigo-900/70 hover:text-indigo-900 bg-stone-100 hover:bg-stone-200 transition-colors px-3 py-1.5 rounded-full disabled:opacity-60"
    >
      {statut === "chargement" ? <Loader2 size={13} className="animate-spin" /> : <Bell size={13} />}
      {TEXTES[variante].inactif}
    </button>
  );
}
