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
