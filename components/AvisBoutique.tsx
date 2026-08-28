"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquarePlus, Loader2 } from "lucide-react";
import BadgeVendeurVerifie from "@/components/BadgeVendeurVerifie";

type Avis = {
  id: string;
  note: number;
  commentaire: string | null;
  nomClient: string | null;
  auteurCertifie?: boolean;
  createdAt: string;
};

/** Étoiles — pleines/vides selon la note (lecture) ou sélectionnables (formulaire). */
function Etoiles({
  note,
  taille = 16,
  interactif = false,
  onChoisir,
}: {
  note: number;
  taille?: number;
  interactif?: boolean;
  onChoisir?: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactif}
          onClick={() => onChoisir?.(n)}
          className={interactif ? "cursor-pointer" : "cursor-default"}
          aria-label={interactif ? `${n} étoile${n > 1 ? "s" : ""}` : undefined}
        >
          <Star
            size={taille}
            className={n <= Math.round(note) ? "fill-mango-400 text-mango-400" : "text-stone-300"}
          />
        </button>
      ))}
    </div>
  );
}

export default function AvisBoutique({ vendeurId }: { vendeurId: string }) {
  const [avis, setAvis] = useState<Avis[]>([]);
  const [moyenne, setMoyenne] = useState(0);
  const [nbAvis, setNbAvis] = useState(0);
  const [monAvis, setMonAvis] = useState<Avis | null>(null);
  const [charge, setCharge] = useState(false);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [noteChoisie, setNoteChoisie] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [envoi, setEnvoi] = useState(false);

  function charger() {
    fetch(`/api/avis?vendeurId=${vendeurId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setAvis(d.avis || []);
        setMoyenne(d.moyenne || 0);
        setNbAvis(d.nbAvis || 0);
        setMonAvis(d.monAvis || null);
        if (d.monAvis) {
          setNoteChoisie(d.monAvis.note);
          setCommentaire(d.monAvis.commentaire || "");
        }
      })
      .finally(() => setCharge(true));
  }

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendeurId]);

  async function envoyerAvis(e: React.FormEvent) {
    e.preventDefault();
    if (noteChoisie < 1) return;
    setEnvoi(true);
    try {
      await fetch("/api/avis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendeurId, note: noteChoisie, commentaire }),
      });
      setFormulaireOuvert(false);
      charger();
    } finally {
      setEnvoi(false);
    }
  }

  if (!charge) return null;

  return (
    <section className="mt-8 bg-white border border-stone-200 rounded-2xl p-5">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <p className="font-display text-lg font-semibold text-indigo-900">Avis clients</p>
          {nbAvis > 0 ? (
            <div className="flex items-center gap-2 mt-1">
              <Etoiles note={moyenne} />
              <span className="text-sm text-indigo-900/70">
                {moyenne.toFixed(1)} · {nbAvis} avis
              </span>
            </div>
          ) : (
            <p className="text-sm text-indigo-900/50 mt-1">Aucun avis pour l&apos;instant.</p>
          )}
        </div>
        {!formulaireOuvert && (
          <button
            type="button"
            onClick={() => setFormulaireOuvert(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-900 bg-stone-100 hover:bg-stone-200 transition-colors px-3 py-2 rounded-full"
          >
            <MessageSquarePlus size={14} /> {monAvis ? "Modifier mon avis" : "Laisser un avis"}
          </button>
        )}
      </div>

      {formulaireOuvert && (
        <form onSubmit={envoyerAvis} className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-4 grid gap-3">
          <Etoiles note={noteChoisie} taille={22} interactif onChoisir={setNoteChoisie} />
          <textarea
            placeholder="Votre commentaire (facultatif)"
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            rows={2}
            maxLength={300}
            className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={noteChoisie < 1 || envoi}
              className="flex items-center gap-1.5 bg-indigo-900 hover:bg-indigo-800 disabled:opacity-60 transition-colors text-white px-4 py-2 rounded-full font-medium text-xs"
            >
              {envoi && <Loader2 size={13} className="animate-spin" />} Publier
            </button>
            <button
              type="button"
              onClick={() => setFormulaireOuvert(false)}
              className="text-xs text-indigo-900/60 px-3 py-2"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {avis.length > 0 && (
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
                <Etoiles note={a.note} taille={13} />
                <span className="text-xs text-indigo-900/40">
                  {new Date(a.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </span>
              </div>
              {a.commentaire && <p className="text-sm text-indigo-900/80 mt-1">{a.commentaire}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
