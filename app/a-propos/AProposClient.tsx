"use client";

import { useState } from "react";
import { MessageCircle, CheckCircle2 } from "lucide-react";
import { lienDevenirVendeur } from "@/lib/whatsapp";

export default function AProposClient() {
  const [form, setForm] = useState({
    nom: "",
    telephone: "",
    whatsapp: "",
    nomBoutique: "",
    ville: "",
    description: "",
    motDePasse: "",
  });
  const [envoi, setEnvoi] = useState(false);
  const [succes, setSucces] = useState(false);
  const [erreur, setErreur] = useState("");

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setErreur("");

    const res = await fetch("/api/vendeurs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setErreur(data.erreur || "Une erreur est survenue.");
      setEnvoi(false);
      return;
    }

    setSucces(true);
    setEnvoi(false);
    // Ouvre WhatsApp vers l'admin pour finaliser (envoi preuve paiement / questions)
    window.open(lienDevenirVendeur(form.nom), "_blank");
  }

  if (succes) {
    return (
      <div className="bg-feuille-500/10 border border-feuille-500/30 rounded-2xl p-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 text-feuille-500" size={32} />
        <p className="font-display text-lg font-semibold text-indigo-900 mb-1">
          Votre stand est créé !
        </p>
        <p className="text-sm text-indigo-900/70 mb-4">
          Il ne reste qu&apos;une étape : versez 2000F et envoyez la preuve de paiement
          à Kmer Vision sur WhatsApp pour activer votre boutique.
        </p>
        <a
          href={lienDevenirVendeur(form.nom)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-feuille-500 hover:bg-feuille-600 transition-colors text-white px-5 py-3 rounded-full font-medium text-sm"
        >
          <MessageCircle size={16} /> Ouvrir WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={soumettre} className="grid gap-3 bg-white border border-stone-200 rounded-2xl p-5 md:p-6">
      <div className="grid md:grid-cols-2 gap-3">
        <Champ label="Votre nom" value={form.nom} onChange={(v) => setForm({ ...form, nom: v })} requis />
        <Champ label="Nom de votre boutique" value={form.nomBoutique} onChange={(v) => setForm({ ...form, nomBoutique: v })} requis />
        <Champ label="Numéro de téléphone" value={form.telephone} onChange={(v) => setForm({ ...form, telephone: v })} requis />
        <Champ label="Numéro WhatsApp" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} placeholder="Identique si non précisé" />
        <Champ label="Ville / quartier" value={form.ville} onChange={(v) => setForm({ ...form, ville: v })} />
        <Champ label="Mot de passe" value={form.motDePasse} onChange={(v) => setForm({ ...form, motDePasse: v })} type="password" requis />
      </div>
      <div>
        <label className="text-xs font-medium text-indigo-900/70 mb-1 block">
          Que vendez-vous ? (courte description)
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
        />
      </div>

      {erreur && <p className="text-piment-500 text-sm">{erreur}</p>}

      <button
        type="submit"
        disabled={envoi}
        className="mt-2 bg-indigo-900 hover:bg-indigo-800 disabled:opacity-60 transition-colors text-white px-5 py-3 rounded-full font-medium text-sm"
      >
        {envoi ? "Création en cours…" : "Devenir vendeur"}
      </button>
      <p className="text-xs text-indigo-900/50">
        L&apos;abonnement mensuel est de 2000F. Vous serez redirigé vers WhatsApp pour
        finaliser l&apos;activation avec Kmer Vision.
      </p>
    </form>
  );
}

function Champ({
  label,
  value,
  onChange,
  type = "text",
  requis = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  requis?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-indigo-900/70 mb-1 block">{label}</label>
      <input
        type={type}
        required={requis}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
      />
    </div>
  );
}
