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

// Chaque groupe = un ensemble de mots considérés interchangeables. On génère
// ensuite, pour un mot donné, la liste de tous les autres mots de son groupe.
const GROUPES_SYNONYMES: string[][] = [
  // --- Téléphonie / électronique ---
  ["telephone", "telephone portable", "portable", "smartphone", "gsm", "mobile", "cellulaire"],
  ["tablette", "tablet", "ipad"],
  ["ecouteur", "ecouteurs", "casque", "casque audio", "airpods", "oreillette", "oreillettes"],
  ["chargeur", "cable", "cable usb", "adaptateur", "prise"],
  ["montre", "montre connectee", "smartwatch", "montre intelligente"],
  ["ordinateur", "pc", "laptop", "ordinateur portable", "computer"],
  ["television", "tele", "tv", "ecran"],
  ["haut parleur", "enceinte", "baffle", "speaker", "bluetooth"],
  ["frigo", "refrigerateur", "congelateur"],
  ["ventilateur", "climatiseur", "clim", "brasseur"],

  // --- Mode / vêtements ---
  ["robe", "pagne", "wax", "boubou", "tenue", "ensemble"],
  ["chaussure", "chaussures", "godasse", "godasses", "soulier", "souliers", "basket", "baskets", "sneakers", "escarpin", "escarpins"],
  ["sandale", "sandales", "claquette", "claquettes", "tong", "tongs"],
  ["sac", "sac a main", "sacoche", "cabas", "pochette"],
  ["pantalon", "jean", "jeans"],
  ["chemise", "shirt", "polo"],
  ["veste", "blazer", "manteau", "doudoune"],
  ["ceinture", "belt"],
  ["lunette", "lunettes", "lunette de soleil", "lunettes de soleil"],
  ["bijou", "bijoux", "collier", "bracelet", "bague", "boucle d'oreille", "boucles d'oreilles"],
  ["perruque", "meche", "meches", "tissage", "extension", "extensions"],

  // --- Beauté / cosmétique ---
  ["parfum", "fragrance", "eau de toilette", "eau de parfum", "deodorant"],
  ["creme", "lotion", "hydratant", "hydratante"],
  ["maquillage", "make up", "makeup", "rouge a levre", "gloss", "fond de teint"],
  ["savon", "gel douche", "hygiene"],
  ["shampoing", "shampooing", "apres shampoing", "soin capillaire"],

  // --- Maison / cuisine ---
  ["marmite", "casserole", "faitout"],
  ["assiette", "vaisselle", "plat"],
  ["matelas", "lit"],
  ["canape", "fauteuil", "salon"],
  ["rideau", "rideaux", "voilage"],
  ["tapis", "moquette"],

  // --- Bébé / enfant ---
  ["couche", "couches", "pampers"],
  ["biberon", "tetine"],
  ["poussette", "landau"],
  ["jouet", "jouets", "jeu", "jeux"],

  // --- Alimentation ---
  ["boisson", "boissons", "jus", "soda"],
  ["riz", "provisions", "epicerie"],

  // --- Sport ---
  ["ballon", "football", "foot"],
  ["survetement", "jogging", "tenue de sport"],
  ["haltere", "halteres", "poids", "musculation"],
];

let indexSynonymes: Map<string, Set<string>> | null = null;

function construireIndex(): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();
  for (const groupe of GROUPES_SYNONYMES) {
    for (const mot of groupe) {
      const cle = mot.toLowerCase();
      const ensemble = index.get(cle) ?? new Set<string>();
      for (const autre of groupe) {
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
