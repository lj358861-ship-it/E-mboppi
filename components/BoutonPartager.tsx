"use client";

import { useState } from "react";
import { Share2, MessageCircle, Link2, Check } from "lucide-react";

// lucide-react n'exporte plus les icônes de marques (ex: Facebook).
// On la remplace par un petit SVG inline pour garder le même rendu visuel.
function IconeFacebook({ size = 15, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

export default function BoutonPartager({ titre, url }: { titre: string; url: string }) {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [copie, setCopie] = useState(false);

  async function partager() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: titre, text: `Découvrez "${titre}" sur E-Mboppi`, url });
      } catch {
        // Annulé par l'utilisateur — rien à faire.
      }
      return;
    }
    setMenuOuvert((v) => !v);
  }

  async function copierLien() {
    try {
      await navigator.clipboard.writeText(url);
      setCopie(true);
      setTimeout(() => setCopie(false), 1500);
    } catch {
      // ignore
    }
  }

  const texteMessage = `Découvrez "${titre}" sur E-Mboppi : ${url}`;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={partager}
        className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 transition-colors text-indigo-900 px-5 py-3 rounded-full font-medium text-sm"
      >
        <Share2 size={16} /> Partager
      </button>

      {menuOuvert && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOuvert(false)} />
          <div className="absolute z-20 top-full mt-2 left-0 bg-white border border-stone-200 rounded-2xl shadow-lg p-2 flex flex-col gap-1 min-w-[200px]">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(texteMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-indigo-900 hover:bg-stone-50"
            >
              <MessageCircle size={15} className="text-feuille-500" /> WhatsApp
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-indigo-900 hover:bg-stone-50"
            >
              <IconeFacebook size={15} className="text-indigo-600" /> Facebook
            </a>
            <button
              type="button"
              onClick={copierLien}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-indigo-900 hover:bg-stone-50 text-left"
            >
              {copie ? <Check size={15} className="text-feuille-500" /> : <Link2 size={15} className="text-indigo-900/50" />}
              {copie ? "Lien copié !" : "Copier le lien"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
