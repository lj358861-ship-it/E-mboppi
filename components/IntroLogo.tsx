"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Écran d'intro : le vrai logo E-mboppi apparaît en douceur (fondu + léger
// zoom), reste affiché un court instant, puis s'efface. On utilise l'image
// du logo officiel (public/logo-e-mboppi.png) pour garantir un rendu
// identique à l'identité visuelle de la marque.
const DEBUT_FONDU = 1900; // ms — début de la disparition de l'écran
const DUREE_TOTALE = 2400; // ms — durée totale avant de retirer l'écran du DOM

export default function IntroLogo() {
  const [fondu, setFondu] = useState(false);
  const [cache, setCache] = useState(false);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    // Déclenche l'apparition juste après le montage pour que la transition
    // CSS parte bien de l'état initial (opacity-0, échelle réduite).
    const t0 = requestAnimationFrame(() => setPret(true));
    const t1 = setTimeout(() => setFondu(true), DEBUT_FONDU);
    const t2 = setTimeout(() => setCache(true), DUREE_TOTALE);
    return () => {
      cancelAnimationFrame(t0);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (cache) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#FAFAF8] transition-opacity duration-500 ease-out ${
        fondu ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <div
        className={`flex flex-col items-center transition-all duration-700 ease-out ${
          pret ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
      >
        <Image
          src="/logo-e-mboppi.png"
          alt="E-mboppi"
          width={220}
          height={220}
          priority
          className="w-[42vw] max-w-[220px] min-w-[150px] h-auto"
        />
      </div>
    </div>
  );
}
