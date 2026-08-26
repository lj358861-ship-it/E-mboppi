/**
 * E-Mboppi — Liens WhatsApp (wa.me)
 *
 * On n'utilise pas l'API officielle WhatsApp Business (validation Meta requise,
 * délais, coûts). Les liens wa.me couvrent 100% du besoin pour le MVP :
 * ils ouvrent WhatsApp avec un message pré-rempli, sans aucune clé API.
 */

const ADMIN_WHATSAPP = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "237652401831";

function nettoyerNumero(numero: string) {
  return numero.replace(/[^\d]/g, "");
}

/** Lien pour devenir vendeur — s'adresse toujours à l'admin Kmer Vision */
export function lienDevenirVendeur(nomProspect?: string) {
  const message = nomProspect
    ? `Bonjour Kmer Vision, je suis ${nomProspect} et je souhaite devenir vendeur sur E-Mboppi.`
    : `Bonjour Kmer Vision, je souhaite devenir vendeur sur E-Mboppi.`;
  return `https://wa.me/${nettoyerNumero(ADMIN_WHATSAPP)}?text=${encodeURIComponent(message)}`;
}

/** Lien pour contacter un vendeur au sujet d'un produit précis */
export function lienContacterVendeur(numeroVendeur: string, nomProduit: string) {
  const message = `Bonjour, je suis intéressé(e) par votre produit "${nomProduit}" sur E-Mboppi.`;
  return `https://wa.me/${nettoyerNumero(numeroVendeur)}?text=${encodeURIComponent(message)}`;
}

/** Lien pour envoyer une preuve de paiement d'abonnement à l'admin */
export function lienNotifierPaiement(nomBoutique: string) {
  const message = `Bonjour Kmer Vision, je viens d'envoyer 2000F pour le renouvellement de l'abonnement de ma boutique "${nomBoutique}" sur E-Mboppi. Voici ma preuve de paiement.`;
  return `https://wa.me/${nettoyerNumero(ADMIN_WHATSAPP)}?text=${encodeURIComponent(message)}`;
}

/** Lien pour rappeler à un vendeur que son abonnement expire bientôt (relance proactive) */
export function lienRappelExpiration(nomBoutique: string, joursRestants: number) {
  const message = `Bonjour, votre abonnement E-Mboppi pour la boutique "${nomBoutique}" expire dans ${joursRestants} jour${
    joursRestants > 1 ? "s" : ""
  }. Pensez à le renouveler (2000F) pour que vos articles restent visibles par vos clients.`;
  return `https://wa.me/${nettoyerNumero(ADMIN_WHATSAPP)}?text=${encodeURIComponent(message)}`;
}

/**
 * Lien pour demander à l'admin de booster un article précis (mise en avant
 * "Hot Sales" payante — le vendeur ne peut pas se l'attribuer lui-même,
 * il doit passer par ce circuit de paiement/validation).
 */
export function lienDemanderBoost(nomBoutique: string, titreProduit: string) {
  const message = `Bonjour Kmer Vision, je souhaite booster l'article "${titreProduit}" de ma boutique "${nomBoutique}" sur E-Mboppi pour qu'il apparaisse en Hot Sales. Pouvez-vous m'indiquer le montant et la marche à suivre pour le paiement ?`;
  return `https://wa.me/${nettoyerNumero(ADMIN_WHATSAPP)}?text=${encodeURIComponent(message)}`;
}
