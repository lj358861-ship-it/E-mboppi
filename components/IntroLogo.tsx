"use client";

import { useEffect, useState } from "react";

// Écran d'intro : le logo se DESSINE trait par trait (anse du sac, bandeau,
// panier, corps du sac, feuille), puis le nom du site apparaît. Le tout
// dure environ 3 secondes avant de s'effacer.
const DEBUT_FONDU = 2650; // ms — début de la disparition de l'écran
const DUREE_TOTALE = 3050; // ms — durée totale avant de retirer l'écran du DOM

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
      <div className="flex flex-col items-center">
        <svg
          viewBox="0 0 300 300"
          className="w-[42vw] max-w-[220px] min-w-[150px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Anse du sac */}
          <path
            d="M118,112 C118,72 182,72 182,112"
            stroke="#5AB53E"
            strokeWidth="9"
            strokeLinecap="round"
            className="intro-trait"
            style={{ animationDelay: "0ms", animationDuration: "500ms" }}
          />

          {/* Bandeau festonné en haut du sac */}
          <path
            d="M88,112 L212,112 L212,132 Q197,152 182,132 Q167,152 152,132 Q137,152 122,132 Q107,152 88,132 Z"
            stroke="#1F7A34"
            strokeWidth="6"
            strokeLinejoin="round"
            className="intro-trait intro-remplissage"
            style={{ animationDelay: "350ms", animationDuration: "550ms", ["--couleur-remplissage" as string]: "#1F7A34" }}
          />

          {/* Corps du sac */}
          <path
            d="M94,132 L206,132 L216,236 Q216,252 200,252 L100,252 Q84,252 84,236 Z"
            stroke="#1F7A34"
            strokeWidth="6"
            strokeLinejoin="round"
            className="intro-trait intro-remplissage"
            style={{ animationDelay: "800ms", animationDuration: "600ms", ["--couleur-remplissage" as string]: "#FCFBF7" }}
          />

          {/* Panier (chariot) */}
          <path
            d="M96,168 L114,168 L120,178"
            stroke="#EE7A0E"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="intro-trait"
            style={{ animationDelay: "1350ms", animationDuration: "350ms" }}
          />
          <path
            d="M112,178 L164,178 L154,208 L124,208 Z"
            stroke="#EE7A0E"
            strokeWidth="5"
            strokeLinejoin="round"
            className="intro-trait intro-remplissage"
            style={{ animationDelay: "1500ms", animationDuration: "400ms", ["--couleur-remplissage" as string]: "#EE7A0E" }}
          />
          <circle cx="130" cy="220" r="7" fill="#EE7A0E" className="intro-point" style={{ animationDelay: "1900ms" }} />
          <circle cx="150" cy="220" r="7" fill="#EE7A0E" className="intro-point" style={{ animationDelay: "1980ms" }} />

          {/* Feuille */}
          <path
            d="M198,236 C218,226 236,214 250,198 C242,222 224,238 200,246 Z"
            stroke="#3CA83C"
            strokeWidth="5"
            strokeLinejoin="round"
            className="intro-trait intro-remplissage"
            style={{ animationDelay: "1700ms", animationDuration: "500ms", ["--couleur-remplissage" as string]: "#3CA83C" }}
          />
          <path
            d="M203,240 C218,229 233,216 246,202"
            stroke="#1F7A34"
            strokeWidth="3"
            strokeLinecap="round"
            className="intro-trait"
            style={{ animationDelay: "2050ms", animationDuration: "350ms" }}
          />
        </svg>

        <div className="intro-texte mt-2 text-center" style={{ animationDelay: "2150ms" }}>
          <p className="font-display text-3xl font-semibold tracking-tight">
            <span className="italic text-feuille-600">E</span>
            <span className="text-mango-600">-</span>
            <span className="text-indigo-950">mboppi</span>
          </p>
          <p className="text-[11px] tracking-widest text-feuille-600 font-medium mt-1">
            LE MARCHÉ M&apos;BOPPI EN LIGNE
          </p>
        </div>
      </div>
    </div>
  );
}
