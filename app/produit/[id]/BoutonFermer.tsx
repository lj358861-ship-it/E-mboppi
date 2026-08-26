"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

// Croix flottante pour sortir de la fiche produit — revient à l'écran
// précédent (le fil, une recherche, la boutique du vendeur...).
export default function BoutonFermer() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Fermer"
      className="fixed top-4 left-4 md:top-6 md:left-6 z-30 w-10 h-10 rounded-full bg-white/95 backdrop-blur border border-stone-200 shadow-md flex items-center justify-center text-indigo-900 hover:bg-white active:scale-95 transition-all"
    >
      <X size={20} />
    </button>
  );
}
