"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import UploadPhotos, { PhotoUploadee } from "@/components/UploadPhotos";
import UploadVideo, { VideoUploadee } from "@/components/UploadVideo";

export default function ProduitForm() {
  const [form, setForm] = useState({ titre: "", prix: "", categorie: "", description: "" });
  const [photos, setPhotos] = useState<PhotoUploadee[]>([]);
  const [video, setVideo] = useState<VideoUploadee>(null);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const router = useRouter();

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    if (photos.length === 0 && !video) {
      setErreur("Ajoutez au moins une photo ou une vidéo courte.");
      return;
    }

    setEnvoi(true);
    const res = await fetch("/api/produits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        prix: Number(form.prix),
        photos: photos.map((p) => p.url),
        photosPublicIds: photos.map((p) => p.publicId),
        videoUrl: video?.url || null,
        videoPublicId: video?.publicId || null,
      }),
    });
    const resultat = await res.json();
    setEnvoi(false);

    if (!res.ok) {
      setErreur(resultat.erreur || "Échec de la publication de l'article");
      return;
    }

    setForm({ titre: "", prix: "", categorie: "", description: "" });
    setPhotos([]);
    setVideo(null);
    router.refresh();
  }

  return (
    <form onSubmit={soumettre} className="grid gap-4 bg-white border border-stone-200 rounded-2xl p-5">
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
          min={0}
          placeholder="Prix (FCFA)"
          value={form.prix}
          onChange={(e) => setForm({ ...form, prix: e.target.value })}
          className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
        />
        <select
          required
          value={form.categorie}
          onChange={(e) => setForm({ ...form, categorie: e.target.value })}
          className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
        >
          <option value="" disabled>
            Choisir une catégorie
          </option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={2}
        className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
      />

      <UploadPhotos valeur={photos} onChange={setPhotos} />
      <UploadVideo valeur={video} onChange={setVideo} />

      {erreur && <p className="text-xs text-piment-500">{erreur}</p>}

      <button
        disabled={envoi}
        className="bg-indigo-900 hover:bg-indigo-800 disabled:opacity-60 transition-colors text-white px-4 py-2.5 rounded-full font-medium text-sm"
      >
        {envoi ? "Publication en cours…" : "Publier l'article"}
      </button>
    </form>
  );
}
