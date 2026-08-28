"use client";

import { useEffect, useState } from "react";
import { Star, Trash2 } from "lucide-react";
import BadgeVendeurVerifie from "@/components/BadgeVendeurVerifie";

type Avis = {
  id: string;
  note: number;
  commentaire: string | null;
  nomClient: string | null;
  auteurCertifie?: boolean;
  createdAt: string;
  vendeur: { nomBoutique: string };
};

function Etoiles({ note }: { note: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={12}
          className={n <= Math.round(note) ? "fill-mango-400 text-mango-400" : "text-white/20"}
        />
      ))}
    </div>
  );
}

/**
 * Modération des avis clients — accessible uniquement à l'admin. Chaque
 * avis affiche le pseudo du client (voir /mon-profil) à côté, avec un
 * bouton pour le supprimer s'il est faux ou irrespectueux.
 */
export default function AdminAvis() {
  const [avis, setAvis] = useState<Avis[] | null>(null);
  const [enCours, setEnCours] = useState<string | null>(null);

  async function charger() {
    const res = await fetch("/api/admin/avis");
    if (res.ok) {
      const data = await res.json();
      setAvis(data.avis);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  async function supprimer(a: Avis) {
    if (!confirm(`Supprimer définitivement l'avis de "${a.nomClient || "ce client"}" ?`)) return;
    setEnCours(a.id);
    try {
      const res = await fetch(`/api/avis/${a.id}`, { method: "DELETE" });
      const resultat = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(resultat.erreur || "Échec de la suppression de l'avis. Réessayez.");
        return;
      }
      setAvis((prev) => (prev ? prev.filter((x) => x.id !== a.id) : prev));
    } catch {
      alert("Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.");
    } finally {
      setEnCours(null);
    }
  }

  if (avis === null) return <p className="text-sm text-neon-300/50">Chargement…</p>;

  return (
    <div className="space-y-2">
      {avis.map((a) => (
        <div
          key={a.id}
          className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl px-4 py-3 neon-border bg-white/5"
        >
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-white">{a.nomClient || "Client anonyme"}</span>
              {a.auteurCertifie && <BadgeVendeurVerifie taille={11} variante="icone" />}
              <Etoiles note={a.note} />
              <span className="text-xs text-neon-300/50">
                {new Date(a.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
            <p className="text-xs text-neon-300/60 mt-0.5">Boutique : {a.vendeur.nomBoutique}</p>
            {a.commentaire && <p className="text-sm text-neon-100/85 mt-1.5">{a.commentaire}</p>}
          </div>

          <button
            onClick={() => supprimer(a)}
            disabled={enCours === a.id}
            className="flex items-center gap-1 bg-piment-500/20 hover:bg-piment-500 border border-piment-500/50 disabled:opacity-60 transition-colors text-piment-500 hover:text-white text-xs px-3 py-2 rounded-full font-medium self-start"
          >
            <Trash2 size={12} />
            Supprimer
          </button>
        </div>
      ))}
      {avis.length === 0 && <p className="text-sm text-neon-300/50">Aucun avis pour le moment.</p>}
    </div>
  );
}
