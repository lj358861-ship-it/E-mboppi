"use client";

import { useEffect, useState } from "react";

// Découpe le logo en une grille 3x3 : chaque morceau part d'une direction
// différente (coin, bord...) et "vole" vers sa place pour recomposer le
// logo, comme un puzzle qui s'assemble.
const MORCEAUX = [
  { dx: -160, dy: -160, rot: -30 },
  { dx: 0, dy: -190, rot: 18 },
  { dx: 160, dy: -160, rot: 30 },
  { dx: -200, dy: 0, rot: -18 },
  { dx: 0, dy: 0, rot: 0, echelle: 0.4 },
  { dx: 200, dy: 0, rot: 18 },
  { dx: -160, dy: 160, rot: 24 },
  { dx: 0, dy: 190, rot: -18 },
  { dx: 160, dy: 160, rot: -24 },
];

const DELAI_PAR_MORCEAU = 90; // ms entre chaque morceau
const DUREE_MORCEAU = 900; // ms pour qu'un morceau arrive à sa place
const DEBUT_FONDU = 2600; // ms avant de commencer à faire disparaître l'écran
const DUREE_TOTALE = 3000; // ms — durée totale demandée pour l'animation

export default function IntroLogo() {
  const [fondu, setFondu] = useState(false);
  const [cache, setCache] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFondu(true), DEBUT_FONDU);
    const t2 = setTimeout(() => setCache(true), DUREE_TOTALE);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (cache) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#FAFAF8] transition-opacity duration-400 ease-out ${
        fondu ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <div className="intro-logo-grille">
        {MORCEAUX.map((m, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          return (
            <span
              key={i}
              className="intro-logo-morceau"
              style={
                {
                  backgroundPositionX: `${col * 50}%`,
                  backgroundPositionY: `${row * 50}%`,
                  animationDelay: `${i * DELAI_PAR_MORCEAU}ms`,
                  "--dx": `${m.dx}px`,
                  "--dy": `${m.dy}px`,
                  "--rot": `${m.rot}deg`,
                  "--echelle": m.echelle ?? 0.6,
                } as React.CSSProperties
              }
            />
          );
        })}
      </div>
    </div>
  );
}
