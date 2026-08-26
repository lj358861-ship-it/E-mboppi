/**
 * E-Mboppi — Recherche tolérante aux fautes de frappe
 *
 * Postgres géré (Railway) ne garantit pas la disponibilité de l'extension
 * pg_trgm, donc on évite d'en dépendre. À la place : une recherche en deux
 * temps, entièrement en JS, sans paquet externe.
 *
 *   1) Passe stricte : "contains" insensible à la casse (rapide, via SQL).
 *   2) Si peu/pas de résultats : on récupère un lot plus large de
 *      candidats et on les classe par similarité approximative
 *      (distance de Levenshtein normalisée) avec le terme recherché.
 */

function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // retire les accents
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Distance de Levenshtein classique entre deux chaînes courtes */
function distanceLevenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let precedente = new Array(n + 1);
  let courante = new Array(n + 1);
  for (let j = 0; j <= n; j++) precedente[j] = j;

  for (let i = 1; i <= m; i++) {
    courante[0] = i;
    for (let j = 1; j <= n; j++) {
      const cout = a[i - 1] === b[j - 1] ? 0 : 1;
      courante[j] = Math.min(
        precedente[j] + 1, // suppression
        courante[j - 1] + 1, // insertion
        precedente[j - 1] + cout // substitution
      );
    }
    [precedente, courante] = [courante, precedente];
  }
  return precedente[n];
}

/** Similarité 0→1 entre un mot recherché et un mot candidat (1 = identique) */
function similariteMot(recherche: string, mot: string): number {
  if (!recherche || !mot) return 0;
  if (mot.includes(recherche) || recherche.includes(mot)) return 0.9;
  const distance = distanceLevenshtein(recherche, mot);
  const longueurMax = Math.max(recherche.length, mot.length);
  return 1 - distance / longueurMax;
}

/**
 * Score de pertinence d'un texte candidat (ex: titre d'un article, nom de
 * boutique) par rapport à un terme recherché, tolérant aux fautes de frappe.
 * Compare chaque mot recherché au meilleur mot du texte candidat.
 */
export function scoreFuzzy(termeRecherche: string, texteCandidat: string): number {
  const motsRecherche = normaliser(termeRecherche).split(" ").filter(Boolean);
  const motsCandidat = normaliser(texteCandidat).split(" ").filter(Boolean);
  if (motsRecherche.length === 0 || motsCandidat.length === 0) return 0;

  let scoreTotal = 0;
  for (const motR of motsRecherche) {
    let meilleur = 0;
    for (const motC of motsCandidat) {
      // Une faute de frappe sur un mot très court est proportionnellement plus
      // grave ; on exige une meilleure correspondance pour les mots courts.
      const seuilMin = motR.length <= 3 ? 0.75 : 0.55;
      const s = similariteMot(motR, motC);
      if (s > meilleur) meilleur = s;
      if (meilleur >= seuilMin) break;
    }
    scoreTotal += meilleur;
  }
  return scoreTotal / motsRecherche.length;
}

/** Seuil sous lequel on considère qu'il n'y a pas de correspondance utile */
export const SEUIL_PERTINENCE = 0.55;

/**
 * Classe une liste de candidats par pertinence approximative avec le terme
 * recherché, en ne gardant que ceux au-dessus du seuil.
 */
export function classerParPertinence<T>(
  termeRecherche: string,
  candidats: T[],
  extraireTexte: (item: T) => string
): T[] {
  return candidats
    .map((item) => ({ item, score: scoreFuzzy(termeRecherche, extraireTexte(item)) }))
    .filter((r) => r.score >= SEUIL_PERTINENCE)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.item);
}

/**
 * Variante multi-termes de `classerParPertinence` : le terme recherché a été
 * élargi en plusieurs variantes (synonymes, camfranglais...) via
 * `elargirTermeRecherche`. On garde, pour chaque candidat, le meilleur score
 * obtenu parmi toutes les variantes — un candidat est pertinent dès qu'il
 * correspond bien à AU MOINS une des formulations.
 */
export function classerParPertinenceMulti<T>(
  termesRecherche: string[],
  candidats: T[],
  extraireTexte: (item: T) => string
): T[] {
  return candidats
    .map((item) => {
      const texte = extraireTexte(item);
      let meilleur = 0;
      for (const terme of termesRecherche) {
        const s = scoreFuzzy(terme, texte);
        if (s > meilleur) meilleur = s;
        if (meilleur >= 0.99) break;
      }
      return { item, score: meilleur };
    })
    .filter((r) => r.score >= SEUIL_PERTINENCE)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.item);
}
