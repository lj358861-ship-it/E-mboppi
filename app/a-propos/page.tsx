import Image from "next/image";
import AProposClient from "./AProposClient";

export const metadata = {
  title: "À propos — E-Mboppi par Kmer Vision",
};

export default function APropos() {
  return (
    <div className="px-4 md:px-8 py-8 max-w-3xl mx-auto">
      <section className="mb-10">
        <p className="font-mono text-piment-500 text-xs tracking-widest uppercase mb-2">
          À propos
        </p>
        <h1 className="font-display text-3xl font-semibold text-indigo-900 mb-4">
          E-Mboppi, une initiative de Kmer Vision
        </h1>
        <p className="text-indigo-900/80 leading-relaxed mb-3">
          Le marché Mboppi est l&apos;un des cœurs commerçants les plus vivants de Douala :
          des centaines de vendeurs, une offre immense, mais une visibilité qui s&apos;arrête
          souvent aux allées du marché. <strong>Kmer Vision</strong> a conçu E-Mboppi pour
          changer cela : donner à chaque vendeur une vitrine numérique simple, et à chaque
          client un moyen rapide de trouver et de contacter le bon stand, où qu&apos;il se trouve.
        </p>
        <p className="text-indigo-900/80 leading-relaxed">
          Notre approche est volontairement simple : des vidéos courtes pour montrer les
          articles comme si vous étiez devant l&apos;étal, une recherche rapide, et un contact
          direct par WhatsApp avec le vendeur. Pas de complexité inutile — juste le marché,
          en ligne.
        </p>
      </section>

      <section className="mb-10 grid sm:grid-cols-3 gap-4">
        <Stat chiffre="2000F" label="Abonnement mensuel vendeur" />
        <Stat chiffre="100%" label="Contact direct WhatsApp" />
        <Stat chiffre="Douala" label="Marché Mboppi" />
      </section>

      <section className="mb-10 bg-indigo-950 rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="neon-blob bg-neon-600 w-56 h-56 -top-16 -right-16 opacity-40" />
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Image
            src="/kmer-vision-logo.png"
            alt="Kmer Vision"
            width={128}
            height={128}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover flex-shrink-0 neon-border"
          />
          <div>
            <p className="font-mono text-neon-400 text-xs tracking-widest uppercase mb-1">
              La société derrière E-Mboppi
            </p>
            <h2 className="font-display text-2xl font-semibold text-white mb-2">Kmer Vision</h2>
            <p className="text-sm text-neon-300/50 uppercase tracking-[0.15em] mb-3">
              Build · Code · Create · Transform
            </p>
            <p className="text-stone-200/90 leading-relaxed text-sm mb-4">
              Kmer Vision est une agence camerounaise spécialisée dans le développement web et
              le marketing digital. Au-delà d&apos;E-Mboppi, nous concevons des sites vitrines,
              des applications web sur mesure, des boutiques en ligne et des outils métier pour
              les entreprises et entrepreneurs qui veulent exister sérieusement sur internet.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              <ServiceKmer titre="Développement web" description="Sites vitrines, applications sur mesure, plateformes e-commerce." />
              <ServiceKmer titre="Marketing digital" description="Visibilité, réseaux sociaux, campagnes et stratégie de contenu." />
              <ServiceKmer titre="Accompagnement" description="Conseil et suivi pour transformer une idée en produit réel." />
            </div>
            <a
              href="/api/whatsapp-admin?nom=Contact%20Kmer%20Vision"
              className="inline-flex items-center gap-2 btn-neon px-4 py-2 text-sm font-medium"
            >
              Discuter d&apos;un projet avec Kmer Vision
            </a>
          </div>
        </div>
      </section>

      <section id="devenir-vendeur" className="scroll-mt-20">
        <h2 className="font-display text-2xl font-semibold text-indigo-900 mb-2">
          Devenir vendeur sur E-Mboppi
        </h2>
        <p className="text-sm text-indigo-900/70 mb-5">
          Créez votre stand en quelques minutes. L&apos;abonnement est de 2000F par mois ;
          tant qu&apos;il est actif, vos produits restent visibles par tous les clients.
        </p>
        <AProposClient />
      </section>
    </div>
  );
}

function ServiceKmer({ titre, description }: { titre: string; description: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
      <p className="text-sm font-semibold text-white mb-1">{titre}</p>
      <p className="text-xs text-neon-300/60 leading-relaxed">{description}</p>
    </div>
  );
}

function Stat({ chiffre, label }: { chiffre: string; label: string }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center">
      <p className="font-display text-2xl font-semibold text-indigo-900">{chiffre}</p>
      <p className="text-xs text-indigo-900/60 mt-1">{label}</p>
    </div>
  );
}
