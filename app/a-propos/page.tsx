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

function Stat({ chiffre, label }: { chiffre: string; label: string }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center">
      <p className="font-display text-2xl font-semibold text-indigo-900">{chiffre}</p>
      <p className="text-xs text-indigo-900/60 mt-1">{label}</p>
    </div>
  );
}
