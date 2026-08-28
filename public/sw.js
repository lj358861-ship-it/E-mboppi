/**
 * E-Mboppi — Service worker minimal
 *
 * Objectif : rendre le site réellement installable en PWA (icône sur l'écran
 * d'accueil, ouverture en plein écran) et donner un minimum de confort hors
 * connexion, sans risquer de servir des données obsolètes (prix, stock,
 * abonnement vendeur changent en continu) :
 *
 * - App shell (logo, manifest, icônes) : cache-first, ça ne change jamais.
 * - Reste du site (pages, API) : network-first — on va chercher la version
 *   fraîche en priorité, on ne retombe sur le cache que si le réseau est
 *   indisponible (utile sur les connexions mobiles instables au Cameroun).
 */
const CACHE_VERSION = "e-mboppi-v1";
const APP_SHELL = [
  "/manifest.json",
  "/logo-e-mboppi.png",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((clefs) =>
      Promise.all(clefs.filter((c) => c !== CACHE_VERSION).map((c) => caches.delete(c)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // App shell : cache d'abord, réseau en secours.
  if (APP_SHELL.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((reponse) => reponse || fetch(request))
    );
    return;
  }

  // Tout le reste (pages, API, images produits) : réseau d'abord pour ne
  // jamais afficher un prix/stock/statut d'abonnement périmé ; le cache ne
  // sert que de filet de sécurité hors connexion.
  event.respondWith(
    fetch(request)
      .then((reponse) => {
        if (reponse.ok && request.url.startsWith(self.location.origin)) {
          const copie = reponse.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copie)).catch(() => {});
        }
        return reponse;
      })
      .catch(() => caches.match(request))
  );
});

// Notification push (ex : rappel de renouvellement d'abonnement 3 jours
// avant expiration — voir lib/push.ts et scripts/rappel-abonnements.ts).
self.addEventListener("push", (event) => {
  let donnees = { title: "E-Mboppi", body: "Vous avez une nouvelle notification.", url: "/vendeur/dashboard" };
  try {
    if (event.data) donnees = { ...donnees, ...event.data.json() };
  } catch {
    // charge utile non-JSON : on garde le message par défaut
  }

  event.waitUntil(
    self.registration.showNotification(donnees.title, {
      body: donnees.body,
      icon: "/icon-192.png",
      badge: "/icon-192-maskable.png",
      data: { url: donnees.url },
    })
  );
});

// Clic sur la notification : ouvre (ou remet au premier plan) le tableau
// de bord vendeur.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/vendeur/dashboard";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientsList) => {
      for (const client of clientsList) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
