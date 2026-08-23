import { lireSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ListeVendeurs from "./ListeVendeurs";

export default async function Admin() {
  const session = lireSession();
  if (!session || session.role !== "ADMIN") redirect("/vendeur/connexion");

  return (
    <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto">
      <h1 className="font-display text-2xl font-semibold text-indigo-900 mb-1">
        Administration — Kmer Vision
      </h1>
      <p className="text-sm text-indigo-900/60 mb-6">
        Vendeurs, abonnements et validation des paiements (2000F/mois).
      </p>
      <ListeVendeurs />
    </div>
  );
}
