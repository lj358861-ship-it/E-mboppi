"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Heart, Store, Loader2, Check } from "lucide-react";
import ActiverNotifications from "@/components/ActiverNotifications";

export default function MonProfil() {
  const [pseudo, setPseudo] = useState("");
  const [compteurs, setCompteurs] = useState<{ nbFavoris: number; nbSuivis: number } | null>(null);
  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/appareil")
      .then((r) => r.json())
      .then((d) => {
        setPseudo(d.pseudo || "");
        setCompteurs({ nbFavoris: d.nbFavoris || 0, nbSuivis: d.nbSuivis || 0 });
      })
      .finally(() => setChargement(false));
  }, []);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    if (!pseudo.trim()) return;
    setEnregistrement(true);
    setMessage(null);
    const res = await fetch("/api/appareil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pseudo: pseudo.trim() }),
    });
    const data = await res.json();
    setEnregistrement(false);
    if (!res.ok) {
      setMessage(data.erreur || "Échec de la mise à jour.");
      return;
    }
    setPseudo(data.pseudo);
    setMessage("Pseudo mis à jour.");
  }

  return (
    <div className="px-4 md:px-8 py-6 max-w-md mx-auto">
      <h1 className="font-display text-2xl font-semibold text-indigo-900 mb-1 flex items-center gap-2">
        <User className="text-indigo-900" size={22} /> Mon profil
      </h1>
      <p className="text-sm text-indigo-900/60 mb-4">
        Ce profil est propre à cet appareil — pas besoin de compte ni de mot de passe. Vos favoris
        et boutiques suivies restent enregistrés ici.
      </p>

      <div className="mb-6">
        <ActiverNotifications
          clePubliqueVapid={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null}
          variante="client"
        />
        <p className="text-xs text-indigo-900/40 mt-2">
          Soyez prévenu quand une boutique que vous suivez publie un nouvel article, ou qu'un
          article en promo correspond à l'une de vos recherches.
        </p>
      </div>

      {chargement ? (
        <p className="text-sm text-indigo-900/50 flex items-center gap-2">
          <Loader2 size={15} className="animate-spin" /> Chargement…
        </p>
      ) : (
        <>
          <form onSubmit={enregistrer} className="bg-white border border-stone-200 rounded-2xl p-5 mb-6">
            <label className="text-sm font-medium text-indigo-900 mb-2 block">Votre pseudo</label>
            <div className="flex gap-2">
              <input
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                maxLength={24}
                placeholder="Votre pseudo"
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
              />
              <button
                disabled={enregistrement || !pseudo.trim()}
                className="flex items-center gap-1.5 bg-indigo-900 hover:bg-indigo-800 disabled:opacity-60 transition-colors text-white px-4 py-2 rounded-full font-medium text-xs"
              >
                {enregistrement ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Enregistrer
              </button>
            </div>
            {message && <p className="text-xs text-indigo-900/60 mt-2">{message}</p>}
            <p className="text-xs text-indigo-900/40 mt-2">
              Ce pseudo peut être utilisé pour vos avis sur les boutiques. Changez-le à tout moment.
            </p>
          </form>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/favoris"
              className="flex items-center gap-3 bg-white border border-stone-200 rounded-2xl p-4 hover:border-indigo-800/40 transition-colors"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-piment-500/10 text-piment-500 flex-shrink-0">
                <Heart size={18} />
              </span>
              <div>
                <p className="font-display text-xl font-semibold text-indigo-900 leading-none">
                  {compteurs?.nbFavoris ?? 0}
                </p>
                <p className="text-xs text-indigo-900/50 mt-1">Favoris</p>
              </div>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-3 bg-white border border-stone-200 rounded-2xl p-4 hover:border-indigo-800/40 transition-colors"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-900/5 text-indigo-900 flex-shrink-0">
                <Store size={18} />
              </span>
              <div>
                <p className="font-display text-xl font-semibold text-indigo-900 leading-none">
                  {compteurs?.nbSuivis ?? 0}
                </p>
                <p className="text-xs text-indigo-900/50 mt-1">Boutiques suivies</p>
              </div>
            </Link>
          </div>

          <p className="text-xs text-indigo-900/40 mt-6">
            Vous êtes vendeur ?{" "}
            <Link href="/vendeur/connexion" className="underline text-indigo-800">
              Connectez-vous ici
            </Link>{" "}
            pour accéder à votre boutique.
          </p>
        </>
      )}
    </div>
  );
}
