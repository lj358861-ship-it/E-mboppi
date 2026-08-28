"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Store,
  Flame,
  Image as ImageIcon,
  Clapperboard,
  Users,
  Clock,
  SearchX,
  Sparkles,
  LayoutGrid,
  Percent,
  ArrowDownUp,
} from "lucide-react";
import CarteProduitVideo from "@/components/CarteProduitVideo";
import BadgeVendeurVerifie from "@/components/BadgeVendeurVerifie";
import { CATEGORIES, sousCategoriesPour } from "@/lib/categories";
import { StatutStock } from "@/lib/stock";

type Produit = {
  id: string;
  titre: string;
  prix: number;
  videoUrl: string | null;
  photos: string[];
  statutStock: StatutStock;
  boost: boolean;
  enPromo: boolean;
  estFavori?: boolean;
  vendeur: {
    id: string;
    nomBoutique: string;
    logoUrl: string | null;
    ville: string | null;
    verifie?: boolean;
    utilisateur: { whatsapp: string };
  };
};

type VendeurResultat = {
  id: string;
  nomBoutique: string;
  logoUrl: string | null;
  ville: string | null;
  verifie?: boolean;
  _count: { produits: number };
};

type Suggestion = { texte: string; type: "produit" | "boutique" };

type Onglet = "tous" | "hot" | "promo" | "photo" | "video" | "vendeurs";

// "Tous" en premier — l'onglet par défaut, pour que le client voie
// l'ensemble du catalogue avant les sous-ensembles (Hot Sales, Promo...).
const ONGLETS: { valeur: Onglet; label: string; icone: typeof Flame }[] = [
  { valeur: "tous", label: "Tous", icone: LayoutGrid },
  { valeur: "hot", label: "Hot Sales", icone: Flame },
  { valeur: "promo", label: "Promo", icone: Percent },
  { valeur: "photo", label: "Annonces", icone: ImageIcon },
  { valeur: "video", label: "Vidéos", icone: Clapperboard },
  { valeur: "vendeurs", label: "Vendeurs", icone: Users },
];

type Tri = "" | "prix_asc" | "prix_desc";

const OPTIONS_TRI: { valeur: Tri; label: string }[] = [
  { valeur: "", label: "Pertinence" },
  { valeur: "prix_asc", label: "Prix croissant" },
  { valeur: "prix_desc", label: "Prix décroissant" },
];

const CLE_HISTORIQUE = "emboppi:recherches-recentes";

function lireHistorique(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const brut = window.localStorage.getItem(CLE_HISTORIQUE);
    return brut ? JSON.parse(brut) : [];
  } catch {
    return [];
  }
}

function enregistrerDansHistorique(terme: string) {
  if (typeof window === "undefined" || !terme.trim()) return;
  const historique = lireHistorique().filter((t) => t.toLowerCase() !== terme.toLowerCase());
  historique.unshift(terme.trim());
  window.localStorage.setItem(CLE_HISTORIQUE, JSON.stringify(historique.slice(0, 8)));
}

export default function Recherche() {
  return (
    <Suspense fallback={null}>
      <RechercheContenu />
    </Suspense>
  );
}

function RechercheContenu() {
  const paramsUrl = useSearchParams();
  // Les liens "Voir tout" de l'accueil (par catégorie, Hot Sales, Promo...)
  // pointent vers /recherche avec ces paramètres — on les lit une seule fois
  // au montage pour ouvrir directement le bon onglet / la bonne catégorie.
  const ongletInitial = (paramsUrl.get("onglet") as Onglet | null) || "tous";
  const categorieInitiale = paramsUrl.get("categorie") || "";
  const termeInitial = paramsUrl.get("q") || "";

  const [terme, setTerme] = useState(termeInitial);
  const [categorie, setCategorie] = useState(categorieInitiale);
  const [sousCategorie, setSousCategorie] = useState("");
  const [prixMin, setPrixMin] = useState("");
  const [prixMax, setPrixMax] = useState("");
  const [tri, setTri] = useState<Tri>("");
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [onglet, setOnglet] = useState<Onglet>(
    ONGLETS.some((o) => o.valeur === ongletInitial) ? ongletInitial : "tous"
  );

  const [produits, setProduits] = useState<Produit[]>([]);
  const [vendeurs, setVendeurs] = useState<VendeurResultat[]>([]);
  const [chargement, setChargement] = useState(false);
  const [chargementSuite, setChargementSuite] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [suggestionsFallback, setSuggestionsFallback] = useState(false);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [historique, setHistorique] = useState<string[]>([]);
  const [champActif, setChampActif] = useState(false);

  const sentinelleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistorique(lireHistorique());
  }, []);

  // --- Autocomplétion : suggestions en temps réel pendant la frappe ---
  useEffect(() => {
    if (!champActif || terme.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    let annule = false;
    const delai = setTimeout(async () => {
      try {
        const res = await fetch(`/api/recherche/suggestions?q=${encodeURIComponent(terme.trim())}`);
        if (!res.ok || annule) return;
        const data = await res.json();
        if (!annule) setSuggestions(data.suggestions || []);
      } catch {
        // silencieux
      }
    }, 200);
    return () => {
      annule = true;
      clearTimeout(delai);
    };
  }, [terme, champActif]);

  const rechercher = useCallback(
    async (
      params: {
        q: string;
        categorie: string;
        nature: string;
        prixMin: string;
        prixMax: string;
        onglet: Onglet;
        tri: Tri;
      },
      skip: number,
      ajouter: boolean
    ) => {
      if (ajouter) setChargementSuite(true);
      else setChargement(true);

      if (params.onglet === "vendeurs") {
        const query = new URLSearchParams();
        if (params.q) query.set("q", params.q);
        const res = await fetch(`/api/vendeurs/recherche?${query.toString()}`);
        const data = await res.json();
        setVendeurs(data.vendeurs || []);
        setChargement(false);
        setChargementSuite(false);
        return;
      }

      const query = new URLSearchParams();
      if (params.q) query.set("q", params.q);
      if (params.categorie) query.set("categorie", params.categorie);
      if (params.nature) query.set("nature", params.nature);
      if (params.prixMin) query.set("prixMin", params.prixMin);
      if (params.prixMax) query.set("prixMax", params.prixMax);
      if (params.onglet !== "tous") query.set("type", params.onglet);
      if (params.tri) query.set("tri", params.tri);
      if (skip) query.set("skip", String(skip));

      const res = await fetch(`/api/produits?${query.toString()}`);
      const data = await res.json();
      setProduits((prev) => (ajouter ? [...prev, ...(data.produits || [])] : data.produits || []));
      setHasMore(Boolean(data.hasMore));
      setSuggestionsFallback(Boolean(data.suggestionsFallback));
      setChargement(false);
      setChargementSuite(false);
    },
    []
  );

  useEffect(() => {
    const delai = setTimeout(() => {
      rechercher({ q: terme, categorie, nature: sousCategorie, prixMin, prixMax, onglet, tri }, 0, false);
      if (terme.trim()) enregistrerDansHistorique(terme);
    }, 350);
    return () => clearTimeout(delai);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terme, categorie, sousCategorie, prixMin, prixMax, onglet, tri]);

  // --- Défilement infini : charge la page suivante quand la sentinelle apparaît ---
  useEffect(() => {
    if (onglet === "vendeurs") return;
    const sentinelle = sentinelleRef.current;
    if (!sentinelle) return;
    const observateur = new IntersectionObserver(
      (entrees) => {
        if (entrees[0].isIntersecting && hasMore && !chargement && !chargementSuite) {
          rechercher(
            { q: terme, categorie, nature: sousCategorie, prixMin, prixMax, onglet, tri },
            produits.length,
            true
          );
        }
      },
      { rootMargin: "400px" }
    );
    observateur.observe(sentinelle);
    return () => observateur.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, chargement, chargementSuite, produits.length, terme, categorie, sousCategorie, prixMin, prixMax, onglet, tri]);

  // La liste "nature du produit" dépend de la catégorie choisie — on
  // réinitialise si la catégorie change et n'a plus d'options en commun.
  useEffect(() => {
    if (!sousCategoriesPour(categorie).includes(sousCategorie)) setSousCategorie("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorie]);

  function choisirSuggestion(texte: string) {
    setTerme(texte);
    setChampActif(false);
    setSuggestions([]);
    enregistrerDansHistorique(texte);
    setHistorique(lireHistorique());
  }

  function effacerHistorique() {
    window.localStorage.removeItem(CLE_HISTORIQUE);
    setHistorique([]);
  }

  const filtresActifs = Boolean(categorie || sousCategorie || prixMin || prixMax || tri);
  const filtresPertinents = onglet !== "vendeurs";
  const menuDeroulantOuvert = champActif && (suggestions.length > 0 || (!terme.trim() && historique.length > 0));

  return (
    <div>
      {/* Héro recherche — bandeau néon assorti au reste du site, plutôt
          qu'un simple titre sur fond blanc */}
      <section className="relative rounded-b-3xl md:rounded-3xl md:mx-8 md:mt-6 bg-indigo-950 px-5 md:px-8 pt-7 pb-6">
        <span className="neon-blob w-40 h-40 bg-neon-600 -top-14 -left-10" aria-hidden="true" />
        <span className="neon-blob w-48 h-48 bg-neonpink-500 -bottom-20 -right-8" aria-hidden="true" />

        <p className="relative text-neon-300/80 text-[11px] font-semibold tracking-[0.22em] uppercase mb-2">
          Marché Mboppi
        </p>
        <h1 className="relative font-display text-2xl md:text-3xl font-semibold text-white mb-5 text-balance">
          Que cherchez-vous <span className="logo-gradient italic">au marché</span> ?
        </h1>

        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-900/40" size={18} />
            <input
              value={terme}
              onChange={(e) => setTerme(e.target.value)}
              onFocus={() => setChampActif(true)}
              onBlur={() => setTimeout(() => setChampActif(false), 150)}
              placeholder="Ex : robe wax, parfum, nom d'une boutique..."
              className="w-full bg-white/95 rounded-full pl-11 pr-4 py-3.5 text-base outline-none border border-transparent shadow-lg shadow-black/25 focus:border-neon-400 focus:ring-2 focus:ring-neon-400/40"
            />

            {menuDeroulantOuvert && (
              <div className="absolute z-20 top-full mt-2 left-0 right-0 bg-white border border-stone-200 rounded-2xl shadow-lg overflow-hidden">
                {suggestions.length > 0
                  ? suggestions.map((s) => (
                      <button
                        key={`${s.type}-${s.texte}`}
                        type="button"
                        onClick={() => choisirSuggestion(s.texte)}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm text-indigo-950 hover:bg-stone-50"
                      >
                        {s.type === "boutique" ? (
                          <Store size={14} className="text-indigo-900/40 flex-shrink-0" />
                        ) : (
                          <Search size={14} className="text-indigo-900/40 flex-shrink-0" />
                        )}
                        <span className="truncate">{s.texte}</span>
                        {s.type === "boutique" && (
                          <span className="ml-auto text-[10px] text-indigo-900/40 flex-shrink-0">Boutique</span>
                        )}
                      </button>
                    ))
                  : historique.length > 0 && (
                      <>
                        <div className="flex items-center justify-between px-4 pt-2.5 pb-1">
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-indigo-900/40">
                            Recherches récentes
                          </span>
                          <button
                            type="button"
                            onClick={effacerHistorique}
                            className="text-[11px] text-indigo-900/40 hover:text-piment-500"
                          >
                            Effacer
                          </button>
                        </div>
                        {historique.map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => choisirSuggestion(h)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm text-indigo-950 hover:bg-stone-50"
                          >
                            <Clock size={14} className="text-indigo-900/40 flex-shrink-0" />
                            <span className="truncate">{h}</span>
                          </button>
                        ))}
                      </>
                    )}
              </div>
            )}
          </div>
          {filtresPertinents && (
            <button
              onClick={() => setFiltresOuverts((v) => !v)}
              className={`flex items-center gap-1.5 px-4 rounded-full text-sm font-medium border transition-colors flex-shrink-0 ${
                filtresActifs
                  ? "btn-neon border-transparent"
                  : "bg-white/10 border-white/20 text-white/85 hover:bg-white/15"
              }`}
            >
              <SlidersHorizontal size={16} /> Filtres
            </button>
          )}
        </div>
      </section>

      <div className="px-4 md:px-8 pt-5 pb-6">
      {/* Onglets façon TikTok */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-none">
        {ONGLETS.map((o) => {
          const Icone = o.icone;
          const actif = onglet === o.valeur;
          return (
            <button
              key={o.valeur}
              onClick={() => setOnglet(o.valeur)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                actif ? "bg-indigo-900 text-white" : "bg-white border border-stone-200 text-indigo-900/60"
              }`}
            >
              <Icone size={15} className={o.valeur === "hot" ? "text-mango-500" : undefined} /> {o.label}
            </button>
          );
        })}
      </div>

      {filtresOuverts && filtresPertinents && (
        <div className="grid sm:grid-cols-3 gap-3 mb-5 bg-white border border-stone-200 rounded-2xl p-4">
          <select
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-base outline-none focus:border-indigo-800"
          >
            <option value="">Toutes les catégories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {sousCategoriesPour(categorie).length > 0 && (
            <select
              value={sousCategorie}
              onChange={(e) => setSousCategorie(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-base outline-none focus:border-indigo-800"
            >
              <option value="">Nature du produit</option>
              {sousCategoriesPour(categorie).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
          <input
            type="number"
            min={0}
            placeholder="Prix min (FCFA)"
            value={prixMin}
            onChange={(e) => setPrixMin(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-base outline-none focus:border-indigo-800"
          />
          <input
            type="number"
            min={0}
            placeholder="Prix max (FCFA)"
            value={prixMax}
            onChange={(e) => setPrixMax(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-base outline-none focus:border-indigo-800"
          />
          <label className="flex items-center gap-2 sm:col-span-3 pt-1">
            <span className="flex items-center gap-1 text-xs font-medium text-indigo-900/60 flex-shrink-0">
              <ArrowDownUp size={13} /> Trier par
            </span>
            <select
              value={tri}
              onChange={(e) => setTri(e.target.value as Tri)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-800"
            >
              {OPTIONS_TRI.map((o) => (
                <option key={o.valeur} value={o.valeur}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {chargement && <p className="text-sm text-indigo-900/50">Recherche en cours…</p>}

      {onglet === "vendeurs" ? (
        <>
          {!chargement && vendeurs.length === 0 && (
            <p className="text-sm text-indigo-900/50">Aucune boutique ne correspond à votre recherche.</p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {vendeurs.map((v) => (
              <Link
                key={v.id}
                href={`/vendeur/${v.id}`}
                className="flex flex-col items-center text-center gap-2 bg-white border border-stone-200 rounded-2xl p-4 hover:border-indigo-800 transition-colors"
              >
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-stone-100 flex items-center justify-center flex-shrink-0">
                  {v.logoUrl ? (
                    <Image src={v.logoUrl} alt={v.nomBoutique} fill sizes="64px" className="object-cover" />
                  ) : (
                    <Store size={22} className="text-indigo-900/30" />
                  )}
                </div>
                <div>
                  <p className="flex items-center justify-center gap-1 text-sm font-medium text-indigo-900 line-clamp-1">
                    <span className="truncate">{v.nomBoutique}</span>
                    {v.verifie && <BadgeVendeurVerifie taille={12} />}
                  </p>
                  {v.ville && <p className="text-xs text-indigo-900/50">{v.ville}</p>}
                  <p className="text-[11px] text-indigo-900/40 mt-0.5">
                    {v._count.produits} article{v._count.produits > 1 ? "s" : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <>
          {!chargement && produits.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center gap-2 border border-dashed border-stone-300 rounded-2xl py-14 px-6">
              <SearchX size={28} className="text-indigo-900/25" />
              <p className="text-sm text-indigo-900/50">
                {onglet === "hot"
                  ? "Aucun article boosté pour le moment."
                  : onglet === "promo"
                  ? "Aucun article en promo pour le moment."
                  : "Aucun article ne correspond à votre recherche pour le moment."}
              </p>
            </div>
          )}
          {!chargement && produits.length > 0 && suggestionsFallback && terme.trim() && (
            <div className="flex items-start gap-2.5 bg-neon-300/15 border border-neon-500/20 text-indigo-900 rounded-2xl px-4 py-3 mb-4">
              <Sparkles size={16} className="text-neon-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm leading-snug">
                <span className="font-medium">Aucun résultat exact pour « {terme.trim()} ».</span>{" "}
                <span className="text-indigo-900/70">Voici des articles du même genre qui pourraient vous plaire :</span>
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {produits.map((p) => (
              <CarteProduitVideo
                key={p.id}
                id={p.id}
                titre={p.titre}
                prix={p.prix}
                videoUrl={p.videoUrl}
                imageUrl={p.photos[0] || null}
                vendeurId={p.vendeur.id}
                nomBoutique={p.vendeur.nomBoutique}
                villeVendeur={p.vendeur.ville}
                whatsappVendeur={p.vendeur.utilisateur.whatsapp}
                statutStock={p.statutStock}
                hotSales={p.boost}
                enPromotion={p.enPromo}
                estFavori={p.estFavori}
                enFeu={p.boost}
              />
            ))}
          </div>

          {/* Sentinelle invisible qui déclenche le chargement de la page suivante */}
          <div ref={sentinelleRef} className="h-1" />
          {chargementSuite && (
            <p className="text-center text-xs text-indigo-900/40 py-4">Chargement d&apos;autres articles…</p>
          )}
        </>
      )}
      </div>
    </div>
  );
}
