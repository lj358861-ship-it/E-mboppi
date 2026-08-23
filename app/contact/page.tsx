import Link from "next/link";
import { MessageCircle, MapPin, Store, Clock } from "lucide-react";

export const metadata = {
  title: "Contact — E-Mboppi par Kmer Vision",
};

export default function Contact() {
  return (
    <div className="px-4 md:px-8 py-8 max-w-2xl mx-auto">
      <p className="font-mono text-neon-500 text-xs tracking-widest uppercase mb-2">
        Contact
      </p>
      <h1 className="font-display text-3xl font-semibold text-indigo-900 mb-3">
        Une question ? Écrivez-nous.
      </h1>
      <p className="text-indigo-900/70 leading-relaxed mb-8">
        L&apos;équipe Kmer Vision répond directement sur WhatsApp — pas de formulaire
        compliqué, pas d&apos;attente. Que vous soyez client ou vendeur, on vous répond vite.
      </p>

      <div className="relative overflow-hidden rounded-2xl bg-indigo-950 p-6 md:p-8 mb-8">
        <div className="absolute inset-0 bg-gradient-neon animate-gradient-shift opacity-90" />
        <div className="neon-blob w-40 h-40 bg-neonpink-500 -top-8 -right-8" />
        <div className="relative">
          <MessageCircle className="text-white mb-3" size={28} />
          <p className="font-display text-xl font-semibold text-white mb-1">
            Discutons sur WhatsApp
          </p>
          <p className="text-stone-200 text-sm mb-5 max-w-sm">
            Question sur un produit, un abonnement vendeur, ou un problème technique —
            un seul message suffit.
          </p>
          <a
            href="/api/whatsapp-admin"
            className="btn-neon px-5 py-3 text-sm font-medium w-fit"
          >
            <MessageCircle size={16} /> Ouvrir WhatsApp
          </a>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <InfoCard
          icone={MapPin}
          titre="Où nous trouver"
          texte="Marché Mboppi, Douala — Cameroun"
        />
        <InfoCard
          icone={Clock}
          titre="Disponibilité"
          texte="Réponses WhatsApp du lundi au samedi"
        />
      </div>

      <div className="neon-border rounded-2xl p-5 flex items-start gap-3 bg-white">
        <Store className="text-neon-600 flex-shrink-0 mt-0.5" size={20} />
        <p className="text-sm text-indigo-900/80">
          Vous êtes vendeur au marché Mboppi et vous voulez ouvrir votre stand en ligne ?{" "}
          <Link href="/a-propos#devenir-vendeur" className="text-neon-600 font-medium underline">
            Rendez-vous ici
          </Link>{" "}
          pour créer votre boutique.
        </p>
      </div>
    </div>
  );
}

function InfoCard({
  icone: Icone,
  titre,
  texte,
}: {
  icone: React.ElementType;
  titre: string;
  texte: string;
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4">
      <Icone className="text-neon-600 mb-2" size={20} />
      <p className="font-medium text-indigo-900 text-sm mb-0.5">{titre}</p>
      <p className="text-xs text-indigo-900/60">{texte}</p>
    </div>
  );
}
