"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProduitForm() {
  const [form, setForm] = useState({
    titre: "",
    prix: "",
    categorie: "",
    description: "",
    videoUrl: "",
    imageUrl: "",
  });
  const [envoi, setEnvoi] = useState(false);
  const router = useRouter();

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    await fetch("/api/produits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, prix: Number(form.prix) }),
    });
    setEnvoi(false);
    setForm({ titre: "", prix: "", categorie: "", description: "", videoUrl: "", imageUrl: "" });
    router.refresh();
  }

  return (
    <form onSubmit={soumettre} className="grid gap-3 bg-white border border-stone-200 rounded-2xl p-5">
      <p className="font-display text-lg font-semibold text-indigo-900">Ajouter un article</p>
      <input
        required
        placeholder="Titre de l'article"
        value={form.titre}
        onChange={(e) => setForm({ ...form, titre: e.target.value })}
        className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          required
          type="number"
          placeholder="Prix (FCFA)"
          value={form.prix}
          onChange={(e) => setForm({ ...form, prix: e.target.value })}
          className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
        />
        <input
          placeholder="Catégorie (ex: Mode)"
          value={form.categorie}
          onChange={(e) => setForm({ ...form, categorie: e.target.value })}
          className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
        />
      </div>
      <input
        placeholder="Lien vidéo courte (Cloudinary, YouTube...)"
        value={form.videoUrl}
        onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
        className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
      />
      <input
        placeholder="Lien image (si pas de vidéo)"
        value={form.imageUrl}
        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
      />
      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={2}
        className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
      />
      <button
        disabled={envoi}
        className="bg-indigo-900 hover:bg-indigo-800 disabled:opacity-60 transition-colors text-white px-4 py-2.5 rounded-full font-medium text-sm"
      >
        {envoi ? "Ajout en cours…" : "Publier l'article"}
      </button>
    </form>
  );
}
