"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Video } from "lucide-react";
import { CATEGORIES, sousCategoriesPour } from "@/lib/categories";
import { OPTIONS_STATUT_STOCK, StatutStock } from "@/lib/stock";
import UploadPhotos, { PhotoUploadee } from "@/components/UploadPhotos";
import UploadVideo, { VideoUploadee } from "@/components/UploadVideo";

type TypeAnnonce = "photo" | "video";

export default function ProduitForm() {
  const [typeAnnonce, setTypeAnnonce] = useState<TypeAnnonce>("photo");
  const [form, setForm] = useState({
    titre: "",
    nature: "",
    prix: "",
    categorie: "",
    description: "",
    statutStock: "DISPONIBLE" as StatutStock,
  });
  const [photos, setPhotos] = useState<PhotoUploadee[]>([]);
  const [video, setVideo] = useState<VideoUploadee>(null);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const router = useRouter();

  function changerType(t: TypeAnnonce) {
    setTypeAnnonce(t);
    // On vide le média du type non sélectionné pour rester cohérent avec le choix.
    if (t === "photo") setVideo(null);
    if (t === "video") setPhotos([]);
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    if (typeAnnonce === "photo" && photos.length === 0) {
      setErreur("Ajoutez au moins une photo.");
      return;
    }
    if (typeAnnonce === "video" && !video) {
      setErreur("Ajoutez une vidéo courte.");
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

    setForm({ titre: "", nature: "", prix: "", categorie: "", description: "", statutStock: "DISPONIBLE" });
    setPhotos([]);
    setVideo(null);
    router.refresh();
  }

  return (
    <form onSubmit={soumettre} className="grid gap-4 bg-white border border-stone-200 rounded-2xl p-5">
      <p className="font-display text-lg font-semibold text-indigo-900">Ajouter un article</p>

      {/* Choix du type d'annonce : soit des photos, soit une vidéo courte */}
      <div>
        <p className="text-xs font-medium text-indigo-900/70 mb-2">Type d&apos;annonce</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => changerType("photo")}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium border transition-colors ${
              typeAnnonce === "photo"
                ? "bg-indigo-900 border-indigo-900 text-white"
                : "bg-stone-50 border-stone-200 text-indigo-900/60 hover:border-indigo-800"
            }`}
          >
            <ImagePlus size={16} /> Photos
          </button>
          <button
            type="button"
            onClick={() => changerType("video")}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium border transition-colors ${
              typeAnnonce === "video"
                ? "bg-indigo-900 border-indigo-900 text-white"
                : "bg-stone-50 border-stone-200 text-indigo-900/60 hover:border-indigo-800"
            }`}
          >
            <Video size={16} /> Vidéo courte
          </button>
        </div>
      </div>

      <input
        required
        placeholder="Titre de l'article (ex : Yves Saint Laurent)"
        value={form.titre}
        onChange={(e) => setForm({ ...form, titre: e.target.value })}
        className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
      />

      <div className="grid grid-cols-2 gap-3">
        <select
          required
          value={form.categorie}
          onChange={(e) => setForm({ ...form, categorie: e.target.value, nature: "" })}
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

        {sousCategoriesPour(form.categorie).length > 0 ? (
          <select
            value={form.nature}
            onChange={(e) => setForm({ ...form, nature: e.target.value })}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
          >
            <option value="">Nature du produit</option>
            {sousCategoriesPour(form.categorie).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        ) : (
          <input
            placeholder="Nature du produit (ex : Parfum, Robe de soirée...)"
            value={form.nature}
            onChange={(e) => setForm({ ...form, nature: e.target.value })}
            disabled={!form.categorie}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800 disabled:opacity-50"
          />
        )}
      </div>

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
        value={form.statutStock}
        onChange={(e) => setForm({ ...form, statutStock: e.target.value as StatutStock })}
        className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
      >
        {OPTIONS_STATUT_STOCK.map((o) => (
          <option key={o.valeur} value={o.valeur}>
            {o.label}
          </option>
        ))}
      </select>

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={2}
        className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
      />

      {typeAnnonce === "photo" ? (
        <UploadPhotos valeur={photos} onChange={setPhotos} />
      ) : (
        <UploadVideo valeur={video} onChange={setVideo} />
      )}

      {erreur && <p className="text-xs text-piment-500">{erreur}</p>}

      <p className="text-xs text-indigo-900/40 -mt-1">
        Envie d&apos;apparaître dans « Hot Sales » ? Publiez d&apos;abord votre article, vous
        pourrez ensuite demander un boost payant depuis « Mes articles ».
      </p>

      <button
        disabled={envoi}
        className="bg-indigo-900 hover:bg-indigo-800 disabled:opacity-60 transition-colors text-white px-4 py-2.5 rounded-full font-medium text-sm"
      >
        {envoi ? "Publication en cours…" : "Publier l'article"}
      </button>
    </form>
  );
}
