"use client";

import { useEffect } from "react";
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
export default function AutoActualisation({ intervalleMs = 15000 }: { intervalleMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    // Pas de vérification de visibilité ici : sur certaines webviews mobiles
    // (app enveloppée type Capacitor), document.visibilityState reste bloqué
    // sur une valeur incorrecte et empêchait le rafraîchissement de se
    // déclencher — on rafraîchit donc systématiquement à l'intervalle, plus
    // immédiatement à chaque retour au premier plan détecté par CE navigateur.
    const minuteur = window.setInterval(() => router.refresh(), intervalleMs);

    function actualiserAuRetour() {
      router.refresh();
    }

    document.addEventListener("visibilitychange", actualiserAuRetour);
    window.addEventListener("focus", actualiserAuRetour);
    window.addEventListener("pageshow", actualiserAuRetour);

    return () => {
      window.clearInterval(minuteur);
      document.removeEventListener("visibilitychange", actualiserAuRetour);
      window.removeEventListener("focus", actualiserAuRetour);
      window.removeEventListener("pageshow", actualiserAuRetour);
    };
  }, [router, intervalleMs]);

  return null;
}
