"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, Loader2, Share, PlusSquare } from "lucide-react";

function urlBase64VersUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Sur = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const brut = atob(base64Sur);
  return Uint8Array.from(Array.from(brut).map((c) => c.charCodeAt(0)));
}

/**
 * iOS/iPadOS n'expose l'API Push (`PushManager`) que lorsque le site tourne
 * en mode "standalone" — c'est-à-dire lancé depuis une icône ajoutée à
 * l'écran d'accueil, jamais depuis un simple onglet Safari. Sans ça,
 * `"PushManager" in window` est `false` même sur iOS 16.4+ qui supporte la
 * fonctionnalité. On distingue ce cas précis (vendeur sur iPhone qui n'a pas
 * encore installé la PWA) d'un navigateur réellement incompatible, pour lui
 * expliquer quoi faire plutôt que de simplement masquer le bouton.
 */
function estIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOSClassique = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ se présente comme "Macintosh" en desktop mode : on le détecte
  // via le support tactile, absent sur un vrai Mac.
  const iPadOS13Plus = ua.includes("Macintosh") && navigator.maxTouchPoints > 1;
  return iOSClassique || iPadOS13Plus;
}

function estStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
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
 * non activée côté serveur) ou sur un navigateur réellement incompatible.
 * Sur iOS hors PWA installée, affiche plutôt une explication (voir
 * `estIOS`/`estStandalone` ci-dessus) au lieu de disparaître sans rien dire.
 */
export default function ActiverNotifications({
  clePubliqueVapid,
  variante = "vendeur",
}: {
  clePubliqueVapid: string | null;
  variante?: "vendeur" | "client";
}) {
  const [statut, setStatut] = useState<
    "inactif" | "actif" | "indisponible" | "chargement" | "ios_non_installe"
  >("chargement");

  useEffect(() => {
    if (!clePubliqueVapid) {
      setStatut("indisponible");
      return;
    }
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatut(estIOS() && !estStandalone() ? "ios_non_installe" : "indisponible");
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

  if (statut === "ios_non_installe") {
    return (
      <p className="flex items-center gap-1.5 text-xs font-medium text-indigo-900/60 bg-stone-100 px-3 py-1.5 rounded-full">
        <Bell size={13} className="flex-shrink-0" />
        Pour activer les notifications sur iPhone : appuyez sur{" "}
        <Share size={12} className="inline flex-shrink-0" /> puis{" "}
        <span className="inline-flex items-center gap-0.5 font-semibold">
          <PlusSquare size={12} /> Sur l&apos;écran d&apos;accueil
        </span>
        , puis rouvrez l&apos;app depuis cette icône.
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
