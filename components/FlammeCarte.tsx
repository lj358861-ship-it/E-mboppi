"use client";

import Lottie from "lottie-react";
import animationFlamme from "@/public/lotties/flamme-carte.json";

/**
 * Habillage "carte qui brûle" pour les pages Hot Sales.
 *
 * La carte porte déjà un halo chaud pulsé (classe `animate-flame-glow`,
 * posée par CarteProduitVideo) qui donne l'impression de braise même avant
 * le chargement de l'animation. Ce composant ajoute la seconde couche :
 * l'animation flamme (emoji_u1F525 retouchée) posée à cheval sur le bord
 * bas de la carte, comme si le feu léchait le produit par en dessous.
 *
 * Purement décoratif : aria-hidden, ne capte aucun clic (pointer-events-none)
 * pour ne pas gêner la navigation vers la fiche produit.
 */
export default function FlammeCarte() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {/* Flamme posée sur le bord inférieur de la carte, débordant légèrement */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 md:w-20 md:h-20 z-20">
        <Lottie animationData={animationFlamme} loop autoplay className="w-full h-full" />
      </div>
    </div>
  );
}
