"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import BadgeVendeurVerifie from "@/components/BadgeVendeurVerifie";

type Avis = {
  id: string;
  note: number;
  commentaire: string | null;
  nomClient: string | null;
  auteurCertifie?: boolean;
  createdAt: string;
  produit: { id: string; titre: string };
};

function Etoiles({ note, taille = 13 }: { note: number; taille?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={taille}
          className={n <= Math.round(note) ? "fill-mango-400 text-mango-400" : "text-stone-300"}
        />
      ))}
    </div>
  );
}

/**
 * Avis clients affichés sur la page boutique — en LECTURE SEULE.
 *
 * Une boutique ne se note pas directement : sa note et ses avis viennent
 * uniquement des avis laissés sur ses articles (voir AvisProduit et
 * lib/notes.ts::noteMoyenneBoutique). Ce composant ne propose donc aucun
 * formulaire "Laisser un avis" — pour noter, le client va sur la fiche de
 * l'article qu'il a en tête (voir components/AvisProduit.tsx).
 */
export default function AvisRecentsBoutique({ vendeurId }: { vendeurId: string }) {
  const [avis, setAvis] = useState<Avis[]>([]);
  const [moyenne, setMoyenne] = useState(0);
  const [nbAvis, setNbAvis] = useState(0);
  const [charge, setCharge] = useState(false);

  useEffect(() => {
    fetch(`/api/avis-boutique?vendeurId=${vendeurId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setAvis(d.avis || []);
        setMoyenne(d.moyenne || 0);
        setNbAvis(d.nbAvis || 0);
      })
      .finally(() => setCharge(true));
  }, [vendeurId]);

  if (!charge || nbAvis === 0) return null;

  return (
    <section className="mt-8 bg-white border border-stone-200 rounded-2xl p-5">
      <div className="mb-4">
        <p className="font-display text-lg font-semibold text-indigo-900">Avis clients</p>
        <p className="text-xs text-indigo-900/50 mt-0.5">
          Moyenne des avis laissés sur les articles de cette boutique.
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Etoiles note={moyenne} />
          <span className="text-sm text-indigo-900/70">
            {moyenne.toFixed(1)} · {nbAvis} avis
          </span>
        </div>
      </div>

      <ul className="space-y-3">
        {avis.slice(0, 6).map((a) => (
          <li key={a.id} className="border-t border-stone-100 pt-3 first:border-t-0 first:pt-0">
            <div className="flex items-center gap-2 flex-wrap">
              {a.nomClient && (
                <span className="flex items-center gap-1 text-xs font-semibold text-indigo-900">
                  {a.nomClient}
                  {a.auteurCertifie && <BadgeVendeurVerifie taille={11} variante="icone" />}
                </span>
              )}
              <Etoiles note={a.note} />
              <span className="text-xs text-indigo-900/40">
                {new Date(a.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </span>
            </div>
            <Link
              href={`/produit/${a.produit.id}`}
              className="text-xs text-neon-700 hover:underline mt-0.5 inline-block"
            >
              Sur « {a.produit.titre} »
            </Link>
            {a.commentaire && <p className="text-sm text-indigo-900/80 mt-1">{a.commentaire}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
