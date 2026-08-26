"use client";

import { useState } from "react";
import { Share2, Facebook, MessageCircle, Link2, Check } from "lucide-react";

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
              <Facebook size={15} className="text-indigo-600" /> Facebook
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
