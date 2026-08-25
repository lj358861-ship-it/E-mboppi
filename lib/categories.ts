/**
 * E-Mboppi — Catégories de produits
 *
 * Liste centralisée pour que le formulaire vendeur (ajout d'article) et le
 * filtre de recherche client restent toujours synchronisés.
 */
export const CATEGORIES = [
  "Mode & Vêtements",
  "Chaussures",
  "Sacs & Accessoires",
  "Bijoux",
  "Beauté & Cosmétiques",
  "Électronique",
  "Téléphones",
  "Maison & Cuisine",
  "Meubles & Déco",
  "Enfants & Bébé",
  "Alimentation",
  "Sport & Loisirs",
  "Autres",
] as const;

export type Categorie = (typeof CATEGORIES)[number];

/**
 * Sous-catégories ("nature du produit") préselectionnées PAR CATÉGORIE.
 *
 * Chaque catégorie a sa propre liste : Homme / Femme / Enfant pour la mode,
 * mais Parfum / Skincare / Maquillage... pour la beauté, Smartphone /
 * Accessoires... pour les téléphones, etc. Le vendeur choisit sa catégorie,
 * puis la liste "nature du produit" se pré-remplit avec les bonnes options
 * — plus besoin de taper du texte libre. Le client peut filtrer dessus dans
 * la recherche de la même façon.
 *
 * "Autres" n'a pas de liste fixe : la nature reste un champ texte libre.
 */
export const SOUS_CATEGORIES: Record<Categorie, readonly string[]> = {
  "Mode & Vêtements": ["Homme", "Femme", "Enfant"],
  Chaussures: ["Homme", "Femme", "Enfant"],
  "Sacs & Accessoires": ["Homme", "Femme", "Enfant"],
  Bijoux: ["Homme", "Femme", "Enfant"],
  "Beauté & Cosmétiques": [
    "Parfum",
    "Soin du visage (skincare)",
    "Maquillage",
    "Soin capillaire",
    "Masque",
    "Hygiène corporelle",
  ],
  Électronique: ["Audio & écouteurs", "Ordinateurs", "Accessoires électroniques", "Électroménager"],
  Téléphones: ["Smartphone", "Tablette", "Accessoires téléphone", "Montre connectée"],
  "Maison & Cuisine": ["Ustensiles de cuisine", "Électroménager cuisine", "Linge de maison", "Rangement"],
  "Meubles & Déco": ["Salon", "Chambre", "Bureau", "Décoration"],
  "Enfants & Bébé": ["Vêtements bébé", "Jouets", "Puériculture", "Alimentation bébé"],
  Alimentation: ["Épicerie", "Boissons", "Produits frais", "Snacks"],
  "Sport & Loisirs": ["Fitness", "Football", "Jeux & loisirs", "Vêtements de sport"],
  Autres: [],
};

/** Renvoie les options de "nature du produit" pré-remplies pour une catégorie donnée. */
export function sousCategoriesPour(categorie: string | null | undefined): readonly string[] {
  if (!categorie || !(categorie in SOUS_CATEGORIES)) return [];
  return SOUS_CATEGORIES[categorie as Categorie];
}
