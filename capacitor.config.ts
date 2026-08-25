import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Configuration Capacitor pour E-Mboppi.
 *
 * IMPORTANT : on utilise le mode "distant" (server.url) plutôt qu'un export
 * statique, car le site utilise le rendu serveur (SSR), des routes API,
 * et des sessions par cookie — un export statique Next.js casserait tout ça.
 * L'app native est donc une coquille qui charge le site en direct.
 *
 * ⚠️ Avant de publier sur les stores, remplacez l'URL ci-dessous par votre
 * domaine définitif si vous en configurez un (ex: www.e-mboppi.com) plutôt
 * que l'URL Railway par défaut.
 */
const config: CapacitorConfig = {
  appId: "com.kmervision.emboppi",
  appName: "E-Mboppi",
  webDir: "public",
  server: {
    url: "https://e-mboppi-production.up.railway.app",
    cleartext: false,
    androidScheme: "https",
  },
};

export default config;
