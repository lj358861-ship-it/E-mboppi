"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, ImagePlus, Video, X, Zap, Eye, MousePointerClick } from "lucide-react";
import { CATEGORIES, sousCategoriesPour } from "@/lib/categories";
import { OPTIONS_STATUT_STOCK, classesBadgeStock, labelStatutStock, StatutStock } from "@/lib/stock";
import { lienDemanderBoost } from "@/lib/whatsapp";
import UploadPhotos, { PhotoUploadee } from "@/components/UploadPhotos";
import UploadVideo, { VideoUploadee } from "@/components/UploadVideo";

export type ArticleVendeur = {
  id: string;
  titre: string;
  nature: string | null;
  prix: number;
  description: string | null;
  categorie: string | null;
  photos: string[];
  photosPublicIds: string[];
  videoUrl: string | null;
  videoPublicId: string | null;
  visible: boolean;
  statutStock: StatutStock;
  boost: boolean;
  vues: number;
  clicsContact: number;
};

export default function MesArticles({ produits, nomBoutique }: { produits: ArticleVendeur[]; nomBoutique: string }) {
  const [idEnEdition, setIdEnEdition] = useState<string | null>(null);
  const [idEnSuppression, setIdEnSuppression] = useState<string | null>(null);
  const router = useRouter();

  async function supprimer(p: ArticleVendeur) {
    if (!confirm(`Supprimer définitivement l'article "${p.titre}" ?`)) return;
    setIdEnSuppression(p.id);
    try {
      const res = await fetch(`/api/produits/${p.id}`, { method: "DELETE" });
      const resultat = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(resultat.erreur || "Échec de la suppression. Réessayez.");
        return;
      }
      router.refresh();
    } catch {
      alert("Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.");
    } finally {
      setIdEnSuppression(null);
    }
  }

  return (
    <div className="space-y-2">
      {produits.map((p) =>
        idEnEdition === p.id ? (
          <FormulaireEdition
            key={p.id}
            produit={p}
            onAnnuler={() => setIdEnEdition(null)}
            onEnregistre={() => {
              setIdEnEdition(null);
              router.refresh();
            }}
          />
        ) : (
          <div
            key={p.id}
            className="flex items-center gap-3 bg-white border border-stone-200 rounded-xl px-4 py-3"
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
              {p.photos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photos[0]} alt={p.titre} className="w-full h-full object-cover" />
              ) : p.videoUrl ? (
                <video src={p.videoUrl} muted className="w-full h-full object-cover" />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-indigo-900 truncate">{p.titre}</p>
              <p className="text-xs text-indigo-900/50">{p.prix.toLocaleString("fr-FR")} F</p>
              <p className="flex items-center gap-2.5 text-[11px] text-indigo-900/40 mt-0.5">
                <span className="flex items-center gap-0.5">
                  <Eye size={11} /> {p.vues}
                </span>
                <span className="flex items-center gap-0.5">
                  <MousePointerClick size={11} /> {p.clicsContact}
                </span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  p.visible ? "bg-feuille-500/15 text-feuille-600" : "bg-stone-200 text-indigo-900/50"
                }`}
              >
                {p.visible ? "Visible" : "Masqué"}
              </span>
              {p.statutStock !== "DISPONIBLE" && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${classesBadgeStock(p.statutStock)}`}>
                  {labelStatutStock(p.statutStock)}
                </span>
              )}
              {p.boost ? (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-gradient-neon text-white">
                  <Zap size={10} /> Hot Sales actif
                </span>
              ) : (
                <a
                  href={lienDemanderBoost(nomBoutique, p.titre)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-mango-500/50 text-mango-600 hover:bg-mango-500/10 transition-colors"
                >
                  <Zap size={10} /> Booster
                </a>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIdEnEdition(p.id)}
                aria-label="Modifier"
                className="p-2 rounded-full text-indigo-900/50 hover:text-indigo-900 hover:bg-stone-100 transition-colors"
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                onClick={() => supprimer(p)}
                disabled={idEnSuppression === p.id}
                aria-label="Supprimer"
                className="p-2 rounded-full text-piment-500/70 hover:text-piment-500 hover:bg-piment-500/10 transition-colors disabled:opacity-50"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        )
      )}
      {produits.length === 0 && (
        <p className="text-sm text-indigo-900/50">Aucun article publié pour le moment.</p>
      )}
    </div>
  );
}

function FormulaireEdition({
  produit,
  onAnnuler,
  onEnregistre,
}: {
  produit: ArticleVendeur;
  onAnnuler: () => void;
  onEnregistre: () => void;
}) {
  const [typeAnnonce, setTypeAnnonce] = useState<"photo" | "video">(produit.videoUrl ? "video" : "photo");
  const [form, setForm] = useState({
    titre: produit.titre,
    nature: produit.nature || "",
    prix: String(produit.prix),
    categorie: produit.categorie || "",
    description: produit.description || "",
    statutStock: produit.statutStock,
  });
  const [photos, setPhotos] = useState<PhotoUploadee[]>(
    produit.photos.map((url, i) => ({ url, publicId: produit.photosPublicIds[i] || url }))
  );
  const [video, setVideo] = useState<VideoUploadee>(
    produit.videoUrl ? { url: produit.videoUrl, publicId: produit.videoPublicId || "" } : null
  );
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  function changerType(t: "photo" | "video") {
    setTypeAnnonce(t);
    if (t === "photo") setVideo(null);
    if (t === "video") setPhotos([]);
  }

  async function enregistrer(e: React.FormEvent) {
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
    try {
      const res = await fetch(`/api/produits/${produit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre: form.titre,
          nature: form.nature || null,
          prix: Number(form.prix),
          categorie: form.categorie || null,
          description: form.description || null,
          statutStock: form.statutStock,
          photos: photos.map((p) => p.url),
          photosPublicIds: photos.map((p) => p.publicId),
          videoUrl: video?.url || null,
          videoPublicId: video?.publicId || null,
        }),
      });
      const resultat = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErreur(resultat.erreur || "Échec de la mise à jour. Réessayez.");
        return;
      }
      onEnregistre();
    } catch {
      setErreur("Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <form onSubmit={enregistrer} className="grid gap-3 bg-stone-50 border-2 border-indigo-800/30 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-indigo-900">Modifier l&apos;article</p>
        <button type="button" onClick={onAnnuler} aria-label="Annuler" className="text-indigo-900/40 hover:text-indigo-900">
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => changerType("photo")}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium border transition-colors ${
            typeAnnonce === "photo"
              ? "bg-indigo-900 border-indigo-900 text-white"
              : "bg-white border-stone-200 text-indigo-900/60"
          }`}
        >
          <ImagePlus size={14} /> Photos
        </button>
        <button
          type="button"
          onClick={() => changerType("video")}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium border transition-colors ${
            typeAnnonce === "video"
              ? "bg-indigo-900 border-indigo-900 text-white"
              : "bg-white border-stone-200 text-indigo-900/60"
          }`}
        >
          <Video size={14} /> Vidéo courte
        </button>
      </div>

      <input
        required
        placeholder="Titre de l'article"
        value={form.titre}
        onChange={(e) => setForm({ ...form, titre: e.target.value })}
        className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
      />

      <div className="grid grid-cols-2 gap-2">
        <select
          value={form.categorie}
          onChange={(e) => setForm({ ...form, categorie: e.target.value, nature: "" })}
          className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
        >
          <option value="">Sans catégorie</option>
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
            className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
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
            placeholder="Nature du produit"
            value={form.nature}
            onChange={(e) => setForm({ ...form, nature: e.target.value })}
            className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
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
        className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
      />

      <select
        value={form.statutStock}
        onChange={(e) => setForm({ ...form, statutStock: e.target.value as StatutStock })}
        className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
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
        className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
      />

      {typeAnnonce === "photo" ? (
        <UploadPhotos valeur={photos} onChange={setPhotos} />
      ) : (
        <UploadVideo valeur={video} onChange={setVideo} />
      )}

      {erreur && <p className="text-xs text-piment-500">{erreur}</p>}

      <div className="flex gap-2">
        <button
          disabled={envoi}
          className="flex-1 bg-indigo-900 hover:bg-indigo-800 disabled:opacity-60 transition-colors text-white px-4 py-2 rounded-full font-medium text-sm"
        >
          {envoi ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={onAnnuler}
          className="px-4 py-2 rounded-full font-medium text-sm border border-stone-300 text-indigo-900/70 hover:bg-stone-100"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
