import { redirect } from "next/navigation";

// Page promo dédiée, demandée pour que les clients aient une adresse
// claire pour voir tous les articles en promotion. Elle réutilise la page
// de recherche (déjà triable/filtrable par catégorie, nature et prix),
// simplement ouverte directement sur l'onglet "Promo".
export default function Promo() {
  redirect("/recherche?onglet=promo");
}
