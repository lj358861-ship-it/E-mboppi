"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Store } from "lucide-react";

export default function ProfilBoutique({
  nomBoutique,
  description,
  ville,
  logoUrl,
}: {
  nomBoutique: string;
  description: string | null;
  ville: string | null;
  logoUrl: string | null;
}) {
  const [form, setForm] = useState({ description: description || "", ville: ville || "" });
  const [logo, setLogo] = useState(logoUrl);
  const [envoiLogo, setEnvoiLogo] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function changerLogo(fichiers: FileList | null) {
    const fichier = fichiers?.[0];
    if (!fichier) return;
    setEnvoiLogo(true);
    try {
      const donnees = new FormData();
      donnees.append("fichier", fichier);
      donnees.append("type", "logo");
      const res = await fetch("/api/upload", { method: "POST", body: donnees });
      const resultat = await res.json();
      if (!res.ok) throw new Error(resultat.erreur);

      await fetch("/api/vendeurs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: resultat.url, logoPublicId: resultat.publicId }),
      });
      setLogo(resultat.url);
      router.refresh();
    } catch {
      setMessage("Échec de l'envoi de la photo de profil.");
    } finally {
      setEnvoiLogo(false);
    }
  }

  async function enregistrerInfos(e: React.FormEvent) {
    e.preventDefault();
    setEnregistrement(true);
    setMessage(null);
    const res = await fetch("/api/vendeurs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEnregistrement(false);
    setMessage(res.ok ? "Profil de la boutique mis à jour." : "Échec de la mise à jour.");
    router.refresh();
  }

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5">
      <p className="font-display text-lg font-semibold text-indigo-900 mb-4">Profil de la boutique</p>
      <div className="flex items-center gap-4 mb-5">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={envoiLogo}
          className="relative w-16 h-16 rounded-full overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center flex-shrink-0"
        >
          {envoiLogo ? (
            <Loader2 size={18} className="animate-spin text-indigo-900/40" />
          ) : logo ? (
            <Image src={logo} alt={nomBoutique} fill sizes="64px" className="object-cover" />
          ) : (
            <Store size={22} className="text-indigo-900/30" />
          )}
        </button>
        <div>
          <p className="text-sm font-medium text-indigo-900">Photo de profil de la boutique</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs text-indigo-800 underline"
          >
            Changer la photo
          </button>
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => changerLogo(e.target.files)} />
      </div>

      <form onSubmit={enregistrerInfos} className="grid gap-3">
        <input
          placeholder="Ville"
          value={form.ville}
          onChange={(e) => setForm({ ...form, ville: e.target.value })}
          className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
        />
        <textarea
          placeholder="Décrivez votre boutique en quelques mots"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
        />
        <button
          disabled={enregistrement}
          className="justify-self-start bg-indigo-900 hover:bg-indigo-800 disabled:opacity-60 transition-colors text-white px-4 py-2 rounded-full font-medium text-xs"
        >
          {enregistrement ? "Enregistrement…" : "Enregistrer"}
        </button>
        {message && <p className="text-xs text-indigo-900/60">{message}</p>}
      </form>
    </div>
  );
}
