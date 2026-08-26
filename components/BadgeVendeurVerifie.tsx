import { BadgeCheck } from "lucide-react";

export default function BadgeVendeurVerifie({ taille = 12 }: { taille?: number }) {
  return (
    <span
      title="Boutique avec abonnement actif depuis plus de 2 mois"
      className="inline-flex items-center gap-1 bg-neon-500/15 text-neon-700 text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
    >
      <BadgeCheck size={taille} className="fill-neon-500 text-white" /> Vendeur vérifié
    </span>
  );
}
