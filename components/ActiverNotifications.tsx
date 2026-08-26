"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, Loader2 } from "lucide-react";

function urlBase64VersUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Sur = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const brut = atob(base64Sur);
  return Uint8Array.from(Array.from(brut).map((c) => c.charCodeAt(0)));
}

/**
 * Permet au vendeur d'activer les notifications de son navigateur/PWA pour
 * recevoir un rappel automatique quand son abonnement approche de
 * l'expiration (3 jours avant) — sans avoir besoin d'ouvrir son tableau de
 * bord pour le découvrir. Invisible si la clé VAPID publique n'est pas
 * configurée (fonctionnalité non activée côté serveur).
 */
export default function ActiverNotifications({ clePubliqueVapid }: { clePubliqueVapid: string | null }) {
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
        <BellRing size={14} /> Rappels de renouvellement activés
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
      Activer les rappels de renouvellement
    </button>
  );
}
