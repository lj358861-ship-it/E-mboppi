"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Connexion() {
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const router = useRouter();

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    const res = await fetch("/api/auth/connexion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telephone, motDePasse }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErreur(data.erreur || "Connexion impossible");
      return;
    }
    router.push(data.role === "ADMIN" ? "/admin" : "/vendeur/dashboard");
    router.refresh();
  }

  return (
    <div className="px-4 py-16 max-w-sm mx-auto">
      <h1 className="font-display text-2xl font-semibold text-indigo-900 mb-6 text-center">
        Connexion
      </h1>
      <form onSubmit={soumettre} className="grid gap-3 bg-white border border-stone-200 rounded-2xl p-6">
        <input
          placeholder="Numéro de téléphone"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
        />
        {erreur && <p className="text-piment-500 text-sm">{erreur}</p>}
        <button className="bg-indigo-900 hover:bg-indigo-800 transition-colors text-white px-4 py-2.5 rounded-full font-medium text-sm">
          Se connecter
        </button>
      </form>
    </div>
  );
}
