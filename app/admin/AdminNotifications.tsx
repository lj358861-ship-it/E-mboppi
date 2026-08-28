"use client";

import { useState } from "react";
import { Send, BellRing, Sun, CloudSun, Moon } from "lucide-react";

const RAPPELS = [
  { index: 0, label: "Matin (9h)", icon: Sun },
  { index: 1, label: "Midi (13h)", icon: CloudSun },
  { index: 2, label: "Soir (19h)", icon: Moon },
];

/**
 * Diffusion admin — envoie une notification push de test à TOUTES les
 * souscriptions (clients ET vendeurs), via /api/admin/notifications. Pensé
 * pour vérifier concrètement que le push arrive bien sur les appareils
 * (voir lib/push.ts::envoyerNotificationTous), pas pour un usage marketing
 * récurrent (les rappels marché ciblés existent déjà, voir
 * app/api/notifications/rappel-marche/route.ts).
 */
export default function AdminNotifications() {
  const [titre, setTitre] = useState("");
  const [corps, setCorps] = useState("");
  const [url, setUrl] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [resultat, setResultat] = useState<{ envoyees: number; total: number } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const [rappelEnCours, setRappelEnCours] = useState<number | null>(null);
  const [rappelResultat, setRappelResultat] = useState<{ index: number; envoyees: number } | null>(null);
  const [rappelErreur, setRappelErreur] = useState<string | null>(null);

  async function envoyerRappel(index: number) {
    const rappel = RAPPELS.find((r) => r.index === index)!;
    if (!confirm(`Envoyer le rappel "${rappel.label}" à tous les clients dès maintenant ?`)) return;

    setRappelEnCours(index);
    setRappelErreur(null);
    setRappelResultat(null);
    try {
      const res = await fetch("/api/admin/rappel-marche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRappelErreur(data.erreur || "Échec de l'envoi. Réessayez.");
        return;
      }
      setRappelResultat({ index, envoyees: data.envoyees });
    } catch {
      setRappelErreur("Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.");
    } finally {
      setRappelEnCours(null);
    }
  }

  async function envoyer() {
    if (!titre.trim() || !corps.trim()) return;
    if (
      !confirm(
        "Envoyer cette notification à TOUS les utilisateurs (clients et vendeurs) ? Cette action est immédiate et irréversible."
      )
    ) {
      return;
    }

    setEnvoiEnCours(true);
    setErreur(null);
    setResultat(null);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titre: titre.trim(), corps: corps.trim(), url: url.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErreur(data.erreur || "Échec de l'envoi. Réessayez.");
        return;
      }
      setResultat({ envoyees: data.envoyees, total: data.total });
    } catch {
      setErreur("Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.");
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      {/* Rappels marché — déclenchement manuel pour tester les 3 créneaux */}
      <div className="space-y-3 rounded-xl neon-border bg-white/5 p-4">
        <p className="text-xs text-neon-300/60">
          Rappels marché (normalement envoyés par les 3 crons Railway à 9h/13h/19h) — déclenche l&apos;un
          d&apos;eux tout de suite, à tous les clients abonnés, pour vérifier que le push arrive vraiment.
        </p>
        <div className="flex flex-wrap gap-2">
          {RAPPELS.map(({ index, label, icon: Icon }) => (
            <button
              key={index}
              onClick={() => envoyerRappel(index)}
              disabled={rappelEnCours !== null}
              className="flex items-center gap-1.5 bg-white/5 hover:border-neon-500/50 border border-white/10 disabled:opacity-50 transition-colors text-neon-100 text-xs px-3 py-2 rounded-full font-medium"
            >
              <Icon size={13} />
              {rappelEnCours === index ? "Envoi…" : label}
            </button>
          ))}
        </div>
        {rappelResultat && (
          <p className="text-xs text-neon-300/70">
            Rappel &quot;{RAPPELS.find((r) => r.index === rappelResultat.index)?.label}&quot; envoyé à{" "}
            {rappelResultat.envoyees} client{rappelResultat.envoyees > 1 ? "s" : ""} abonné
            {rappelResultat.envoyees > 1 ? "s" : ""}.
          </p>
        )}
        {rappelErreur && <p className="text-xs text-piment-400">{rappelErreur}</p>}
      </div>

      {/* Diffusion générique — clients + vendeurs */}
      <div className="flex items-center gap-2 text-neon-300/70">
        <BellRing size={16} />
        <p className="text-xs">
          Envoie une notification push libre à tous les appareils abonnés (clients et vendeurs).
        </p>
      </div>

      <div className="space-y-3 rounded-xl neon-border bg-white/5 p-4">
        <div>
          <label className="text-xs text-neon-300/60 mb-1 block">Titre</label>
          <input
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Ex : Test de notification"
            maxLength={80}
            className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-neon-300/30 focus:outline-none focus:border-neon-500/50"
          />
        </div>

        <div>
          <label className="text-xs text-neon-300/60 mb-1 block">Message</label>
          <textarea
            value={corps}
            onChange={(e) => setCorps(e.target.value)}
            placeholder="Ex : Ceci est un test, ignorez ce message."
            maxLength={200}
            rows={3}
            className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-neon-300/30 focus:outline-none focus:border-neon-500/50 resize-none"
          />
        </div>

        <div>
          <label className="text-xs text-neon-300/60 mb-1 block">Lien au clic (optionnel)</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/ (par défaut)"
            className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-neon-300/30 focus:outline-none focus:border-neon-500/50"
          />
        </div>

        <button
          onClick={envoyer}
          disabled={envoiEnCours || !titre.trim() || !corps.trim()}
          className="flex items-center gap-1.5 btn-neon disabled:opacity-50 text-sm px-4 py-2 rounded-full font-medium"
        >
          <Send size={14} />
          {envoiEnCours ? "Envoi en cours…" : "Envoyer à tous les utilisateurs"}
        </button>

        {resultat && (
          <p className="text-xs text-neon-300/70">
            Envoyée à {resultat.envoyees} souscription{resultat.envoyees > 1 ? "s" : ""} sur {resultat.total} au
            total (les souscriptions expirées ou révoquées sont automatiquement ignorées et nettoyées).
          </p>
        )}
        {erreur && <p className="text-xs text-piment-400">{erreur}</p>}
      </div>
    </div>
  );
}
