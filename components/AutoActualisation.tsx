"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Actualise silencieusement les données de la page courante (server
 * component) en arrière-plan, SANS navigation ni rechargement complet —
 * router.refresh() re-exécute juste les requêtes prisma du server component
 * et met à jour le HTML, sans perdre le scroll ni l'état des composants
 * client déjà montés (ex. le carrousel promo continue de tourner).
 *
 * Déclencheurs :
 * - toutes les `intervalleMs` (par défaut 20s), tant que l'onglet/l'app est
 *   au premier plan — inutile de rafraîchir une page que personne ne voit ;
 * - dès que l'app revient au premier plan après avoir été en arrière-plan
 *   (changement d'onglet, verrouillage écran, autre app sur mobile) —
 *   couvre le cas "un vendeur publie pendant que j'avais l'app en fond".
 *
 * Usage : poser <AutoActualisation /> une fois dans la page (ex. app/page.tsx).
 * Aucun rendu visuel — juste un minuteur.
 */
export default function AutoActualisation({ intervalleMs = 20000 }: { intervalleMs?: number }) {
  const router = useRouter();
  const enPause = useRef(false);

  useEffect(() => {
    function actualiserSiVisible() {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }

    // Reprend au premier plan (retour sur l'app/l'onglet) → actualisation
    // immédiate, sans attendre le prochain tick de l'intervalle.
    function gererVisibilite() {
      if (document.visibilityState === "visible" && !enPause.current) {
        router.refresh();
      }
    }

    const minuteur = window.setInterval(actualiserSiVisible, intervalleMs);
    document.addEventListener("visibilitychange", gererVisibilite);
    window.addEventListener("focus", gererVisibilite);

    return () => {
      window.clearInterval(minuteur);
      document.removeEventListener("visibilitychange", gererVisibilite);
      window.removeEventListener("focus", gererVisibilite);
    };
  }, [router, intervalleMs]);

  return null;
}
