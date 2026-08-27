/**
 * E-Mboppi — Champ lexical de la recherche
 *
 * Un client ne tape jamais forcément le mot exact utilisé par le vendeur
 * dans le titre de son article ("portable" vs "smartphone", "godasses" vs
 * "chaussures", "pagne" vs "wax"...). Ce fichier associe à chaque mot-clé
 * "canonique" une liste de synonymes, variantes locales (camfranglais) et
 * anglicismes courants au marché de Douala, pour que la recherche élargisse
 * silencieusement le terme tapé avant de chercher.
 *
 * Le dictionnaire est volontairement plat (mot -> liste de synonymes dans les
 * deux sens) plutôt que structuré par catégorie : un même mot ("montre")
 * peut être pertinent pour plusieurs catégories, et la recherche se fait déjà
 * sur titre + nature + catégorie + boutique.
 */

// Chaque groupe = un ensemble de mots considérés interchangeables, associé à
// la catégorie E-Mboppi (voir lib/categories.ts) à laquelle ce type d'article
// appartient. Ce lien mot-clé → catégorie sert à deux choses :
//   1) élargir le terme tapé avec ses synonymes (comme avant) ;
//   2) deviner le "genre" d'un article recherché quand aucune correspondance
//      n'existe, pour proposer en repli un article de la MÊME famille (ex :
//      "déodorant" introuvable → on montre un autre article de beauté, pas
//      un sac) plutôt qu'un article choisi au hasard.
type GroupeSynonymes = { mots: string[]; categorie: string };

const GROUPES_SYNONYMES: GroupeSynonymes[] = [
  // --- Téléphonie / électronique ---
  { mots: ["telephone", "telephone portable", "portable", "smartphone", "gsm", "mobile", "cellulaire"], categorie: "Téléphones" },
  { mots: ["tablette", "tablet", "ipad"], categorie: "Téléphones" },
  { mots: ["ecouteur", "ecouteurs", "casque", "casque audio", "airpods", "oreillette", "oreillettes"], categorie: "Électronique" },
  { mots: ["chargeur", "cable", "cable usb", "adaptateur", "prise"], categorie: "Téléphones" },
  { mots: ["montre", "montre connectee", "smartwatch", "montre intelligente"], categorie: "Téléphones" },
  { mots: ["ordinateur", "pc", "laptop", "ordinateur portable", "computer"], categorie: "Électronique" },
  { mots: ["television", "tele", "tv", "ecran"], categorie: "Électronique" },
  { mots: ["haut parleur", "enceinte", "baffle", "speaker", "bluetooth"], categorie: "Électronique" },
  { mots: ["frigo", "refrigerateur", "congelateur"], categorie: "Électronique" },
  { mots: ["ventilateur", "climatiseur", "clim", "brasseur"], categorie: "Électronique" },

  // --- Mode / vêtements ---
  { mots: ["robe", "pagne", "wax", "boubou", "tenue", "ensemble"], categorie: "Mode & Vêtements" },
  { mots: ["chaussure", "chaussures", "godasse", "godasses", "soulier", "souliers", "basket", "baskets", "sneakers", "escarpin", "escarpins"], categorie: "Chaussures" },
  { mots: ["sandale", "sandales", "claquette", "claquettes", "tong", "tongs"], categorie: "Chaussures" },
  { mots: ["sac", "sac a main", "sacoche", "cabas", "pochette"], categorie: "Sacs & Accessoires" },
  { mots: ["pantalon", "jean", "jeans"], categorie: "Mode & Vêtements" },
  { mots: ["chemise", "shirt", "polo"], categorie: "Mode & Vêtements" },
  { mots: ["veste", "blazer", "manteau", "doudoune"], categorie: "Mode & Vêtements" },
  { mots: ["ceinture", "belt"], categorie: "Sacs & Accessoires" },
  { mots: ["lunette", "lunettes", "lunette de soleil", "lunettes de soleil"], categorie: "Sacs & Accessoires" },
  { mots: ["bijou", "bijoux", "collier", "bracelet", "bague", "boucle d'oreille", "boucles d'oreilles"], categorie: "Bijoux" },
  { mots: ["perruque", "meche", "meches", "tissage", "extension", "extensions"], categorie: "Beauté & Cosmétiques" },

  // --- Beauté / cosmétique ---
  { mots: ["parfum", "fragrance", "eau de toilette", "eau de parfum", "deodorant"], categorie: "Beauté & Cosmétiques" },
  { mots: ["creme", "lotion", "hydratant", "hydratante"], categorie: "Beauté & Cosmétiques" },
  { mots: ["maquillage", "make up", "makeup", "rouge a levre", "gloss", "fond de teint"], categorie: "Beauté & Cosmétiques" },
  { mots: ["savon", "gel douche", "hygiene"], categorie: "Beauté & Cosmétiques" },
  { mots: ["shampoing", "shampooing", "apres shampoing", "soin capillaire"], categorie: "Beauté & Cosmétiques" },

  // --- Maison / cuisine ---
  { mots: ["marmite", "casserole", "faitout"], categorie: "Maison & Cuisine" },
  { mots: ["assiette", "vaisselle", "plat"], categorie: "Maison & Cuisine" },
  { mots: ["matelas", "lit"], categorie: "Meubles & Déco" },
  { mots: ["canape", "fauteuil", "salon"], categorie: "Meubles & Déco" },
  { mots: ["rideau", "rideaux", "voilage"], categorie: "Meubles & Déco" },
  { mots: ["tapis", "moquette"], categorie: "Meubles & Déco" },

  // --- Bébé / enfant ---
  { mots: ["couche", "couches", "pampers"], categorie: "Enfants & Bébé" },
  { mots: ["biberon", "tetine"], categorie: "Enfants & Bébé" },
  { mots: ["poussette", "landau"], categorie: "Enfants & Bébé" },
  { mots: ["jouet", "jouets", "jeu", "jeux"], categorie: "Enfants & Bébé" },

  // --- Alimentation ---
  { mots: ["boisson", "boissons", "jus", "soda"], categorie: "Alimentation" },
  { mots: ["riz", "provisions", "epicerie"], categorie: "Alimentation" },

  // --- Sport ---
  { mots: ["ballon", "football", "foot"], categorie: "Sport & Loisirs" },
  { mots: ["survetement", "jogging", "tenue de sport"], categorie: "Sport & Loisirs" },
  { mots: ["haltere", "halteres", "poids", "musculation"], categorie: "Sport & Loisirs" },
];

let indexSynonymes: Map<string, Set<string>> | null = null;

function construireIndex(): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();
  for (const { mots } of GROUPES_SYNONYMES) {
    for (const mot of mots) {
      const cle = mot.toLowerCase();
      const ensemble = index.get(cle) ?? new Set<string>();
      for (const autre of mots) {
        if (autre.toLowerCase() !== cle) ensemble.add(autre.toLowerCase());
      }
      index.set(cle, ensemble);
    }
  }
  return index;
}

function obtenirIndex(): Map<string, Set<string>> {
  if (!indexSynonymes) indexSynonymes = construireIndex();
  return indexSynonymes;
}

let indexCategories: Map<string, string> | null = null;

function construireIndexCategories(): Map<string, string> {
  const index = new Map<string, string>();
  for (const { mots, categorie } of GROUPES_SYNONYMES) {
    for (const mot of mots) index.set(mot.toLowerCase(), categorie);
  }
  return index;
}

function obtenirIndexCategories(): Map<string, string> {
  if (!indexCategories) indexCategories = construireIndexCategories();
  return indexCategories;
}

/**
 * Étend un terme de recherche avec ses synonymes connus.
 * Renvoie toujours le terme original en premier, suivi des variantes
 * trouvées (sans doublons), dans la limite de `max` termes au total pour ne
 * pas explorer un nombre déraisonnable de requêtes.
 *
 * Fonctionne mot à mot ET sur l'expression entière, pour couvrir aussi bien
 * "portable" que "telephone portable".
 */
export function elargirTermeRecherche(terme: string, max = 8): string[] {
  const index = obtenirIndex();
  const brut = terme.trim().toLowerCase();
  if (!brut) return [];

  const resultats = new Set<string>([terme.trim()]);

  const ajouterSynonymesDe = (cle: string) => {
    const trouves = index.get(cle);
    if (!trouves) return;
    for (const s of trouves) {
      if (resultats.size >= max) return;
      resultats.add(s);
    }
  };

  // Expression entière (ex: "telephone portable")
  ajouterSynonymesDe(brut);

  // Mot par mot (ex: "portable" tout seul)
  for (const mot of brut.split(/\s+/).filter(Boolean)) {
    if (resultats.size >= max) break;
    ajouterSynonymesDe(mot);
  }

  return Array.from(resultats).slice(0, max);
}

/**
 * Devine la catégorie E-Mboppi correspondant à un terme recherché, à partir
 * du même dictionnaire de mots-clés que `elargirTermeRecherche` (terme entier
 * puis mot par mot). Renvoie `null` si aucun mot-clé connu ne correspond.
 *
 * Sert uniquement de filet de secours (passe 3 de la recherche) : quand
 * aucun article ne correspond, même approximativement, on préfère montrer un
 * article de la même famille (ex : un autre article de beauté pour
 * "déodorant") plutôt qu'un article choisi au hasard dans tout le catalogue.
 */
export function inferCategorieDepuisTerme(terme: string): string | null {
  const index = obtenirIndexCategories();
  const brut = terme.trim().toLowerCase();
  if (!brut) return null;

  const trouvee = index.get(brut);
  if (trouvee) return trouvee;

  for (const mot of brut.split(/\s+/).filter(Boolean)) {
    const c = index.get(mot);
    if (c) return c;
  }

  return null;
}
