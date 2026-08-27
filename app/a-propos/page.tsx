import Image from "next/image";
import AProposClient from "./AProposClient";
import { lienDevenirVendeur } from "@/lib/whatsapp";
import {
  Search,
  MessageCircle,
  Handshake,
  UserPlus,
  CreditCard,
  UploadCloud,
  CheckCircle2,
  Smartphone,
  Share2,
  PlusSquare,
  Globe,
  MoreVertical,
  Download,
  type LucideIcon,
} from "lucide-react";

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
      </section>

      {/* Comment ça marche — version visuelle (cartes numérotées) qui
          remplace l'ancien paragraphe d'explication en texte brut */}
      <section className="mb-10">
        <div className="text-center mb-6">
          <p className="font-mono text-neon-600 text-xs tracking-widest uppercase mb-2">
            Comment ça marche
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-indigo-900 mb-2">
            Tout le marché Mboppi, directement sur votre téléphone
          </h2>
          <p className="text-sm text-indigo-900/70 max-w-xl mx-auto">
            Découvrez les articles des vendeurs en photos et vidéos, contactez-les en un clic
            sur WhatsApp, et faites-vous livrer ou récupérez votre article — sans vous déplacer
            pour comparer.
          </p>
        </div>

        <BlocEtapes
          numero={1}
          titre="Comment ça marche, pour les clients ?"
          blobClasse="bg-neon-600 -top-12 -left-12"
          etapes={[
            { icone: Search, titre: "Parcourez", description: "Photos & vidéos courtes des articles, par catégorie ou recherche." },
            { icone: MessageCircle, titre: "Contactez", description: "Un clic ouvre WhatsApp avec le vendeur, message déjà prêt." },
            { icone: Handshake, titre: "Achetez", description: "Vous discutez, négociez et récupérez votre article en confiance." },
          ]}
        />

        <BlocEtapes
          numero={2}
          titre="Comment adhérer, pour les vendeurs ?"
          blobClasse="bg-neonpink-500 -bottom-12 -right-12"
          etapes={[
            { icone: UserPlus, titre: "Inscrivez-vous", description: "Contactez-nous sur WhatsApp pour créer votre boutique en ligne." },
            { icone: CreditCard, titre: "Activez", description: "Abonnement à 2 000 F/mois, réglable en Mobile Money." },
            { icone: UploadCloud, titre: "Publiez", description: "Ajoutez vos photos/vidéos, votre boutique est visible aussitôt." },
          ]}
        />

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <PointCheck texte="Visibilité 7j/7 auprès de tout Douala" />
          <PointCheck texte="Contact direct WhatsApp, sans intermédiaire" />
          <PointCheck texte="Boutique personnalisée, votre nom, votre ville" />
          <PointCheck texte='Badge "vendeur vérifié"' />
        </div>

        <div className="rounded-2xl p-5 md:p-6 text-center bg-gradient-neon">
          <h3 className="font-display text-xl font-semibold text-white mb-1">
            Rejoignez E-mboppi dès aujourd&apos;hui
          </h3>
          <p className="text-sm text-white/85 mb-4">
            Que vous soyez client ou vendeur, tout se passe sur WhatsApp.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={lienDevenirVendeur()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-indigo-900 px-4 py-2.5 rounded-full text-sm font-semibold transition-transform hover:scale-[1.02]"
            >
              <MessageCircle size={16} /> WhatsApp : +237 652 401 831
            </a>
            <a
              href="#devenir-vendeur"
              className="inline-flex items-center gap-2 border border-white/60 text-white px-4 py-2.5 rounded-full text-sm font-semibold transition-colors hover:bg-white/10"
            >
              Devenir vendeur
            </a>
          </div>
        </div>
      </section>

      <section className="mb-10 grid sm:grid-cols-3 gap-4">
        <Stat chiffre="2000F" label="Abonnement mensuel vendeur" />
        <Stat chiffre="100%" label="Contact direct WhatsApp" />
        <Stat chiffre="Douala" label="Marché Mboppi" />
      </section>

      {/* Guide d'installation PWA — transformer le site en application sans
          passer par le Play Store / App Store */}
      <section className="mb-10">
        <div className="text-center mb-6">
          <p className="font-mono text-neon-600 text-xs tracking-widest uppercase mb-2">
            Astuce
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-indigo-900 mb-2">
            Transformez ce site en application, sans téléchargement
          </h2>
          <p className="text-sm text-indigo-900/70 max-w-xl mx-auto">
            Pas besoin de Play Store ni d&apos;App Store : ajoutez E-Mboppi à votre écran
            d&apos;accueil en quelques secondes et retrouvez-le comme une vraie application,
            en plein écran et sans barre de navigateur.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <GuidePwa
            plateforme="Sur iPhone (Safari)"
            etapes={[
              { icone: Globe, titre: "Ouvrez le site dans Safari", description: "Rendez-vous sur e-mboppi-production.up.railway.app avec le navigateur Safari (pas Chrome)." },
              { icone: Share2, titre: 'Appuyez sur "Partager"', description: "Le bouton carré avec une flèche vers le haut, en bas de l'écran." },
              { icone: PlusSquare, titre: '"Sur l\'écran d\'accueil"', description: "Faites défiler le menu de partage puis choisissez cette option." },
              { icone: Smartphone, titre: 'Confirmez "Ajouter"', description: "L'icône E-Mboppi apparaît sur votre écran d'accueil, prête à ouvrir comme une app." },
            ]}
          />
          <GuidePwa
            plateforme="Sur Android (Chrome)"
            etapes={[
              { icone: Globe, titre: "Ouvrez le site dans Chrome", description: "Rendez-vous sur e-mboppi-production.up.railway.app avec le navigateur Chrome." },
              { icone: MoreVertical, titre: "Ouvrez le menu ⋮", description: "Les trois petits points en haut à droite de l'écran." },
              { icone: Download, titre: '"Installer l\'application"', description: "Ou \"Ajouter à l'écran d'accueil\" selon votre version de Chrome." },
              { icone: Smartphone, titre: 'Confirmez "Installer"', description: "L'icône E-Mboppi s'ajoute à votre écran d'accueil, prête à ouvrir comme une app." },
            ]}
          />
        </div>
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

type Etape = { icone: LucideIcon; titre: string; description: string };

/** Un bloc numéroté (1, 2...) avec ses 3 cartes d'étapes — utilisé pour le
 * parcours client et le parcours vendeur dans la section "Comment ça marche". */
function BlocEtapes({
  numero,
  titre,
  etapes,
  blobClasse,
}: {
  numero: number;
  titre: string;
  etapes: Etape[];
  blobClasse: string;
}) {
  return (
    <div className="mb-5 bg-indigo-950 rounded-2xl p-5 md:p-6 relative overflow-hidden">
      <div className={`neon-blob w-52 h-52 opacity-30 ${blobClasse}`} />
      <div className="relative">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-neon text-white text-sm font-bold flex-shrink-0">
            {numero}
          </span>
          <h3 className="font-display text-lg font-semibold text-white">{titre}</h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {etapes.map((etape, i) => (
            <EtapeCard key={etape.titre} n={i + 1} {...etape} />
          ))}
        </div>
      </div>
    </div>
  );
}

function EtapeCard({ n, icone: Icone, titre, description }: Etape & { n: number }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-mango-500 text-indigo-950 text-[11px] font-bold flex-shrink-0">
          {n}
        </span>
        <Icone size={18} className="text-neon-400" />
      </div>
      <p className="text-sm font-semibold text-white mb-1">{titre}</p>
      <p className="text-xs text-neon-300/60 leading-relaxed">{description}</p>
    </div>
  );
}

function PointCheck({ texte }: { texte: string }) {
  return (
    <div className="flex items-start gap-2 bg-white border border-stone-200 rounded-xl p-3">
      <CheckCircle2 size={16} className="text-feuille-500 flex-shrink-0 mt-0.5" />
      <p className="text-xs font-medium text-indigo-900/80 leading-snug">{texte}</p>
    </div>
  );
}

/** Une carte de guide d'installation PWA (iPhone ou Android) — même
 * structure à 4 étapes pour les deux plateformes, seules les icônes et le
 * texte des étapes 2/3 changent selon le navigateur. */
function GuidePwa({ plateforme, etapes }: { plateforme: string; etapes: Etape[] }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-900 text-white flex-shrink-0">
          <Smartphone size={16} />
        </span>
        <h3 className="font-display text-lg font-semibold text-indigo-900">{plateforme}</h3>
      </div>
      <ol className="space-y-3.5">
        {etapes.map((etape, i) => (
          <EtapePwa key={etape.titre} n={i + 1} {...etape} />
        ))}
      </ol>
    </div>
  );
}

function EtapePwa({ n, icone: Icone, titre, description }: Etape & { n: number }) {
  return (
    <li className="flex gap-3">
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neon-500/15 text-neon-600 text-[11px] font-bold flex-shrink-0 mt-0.5">
        {n}
      </span>
      <div>
        <p className="text-sm font-semibold text-indigo-900 flex items-center gap-1.5 mb-0.5">
          <Icone size={14} className="text-neon-600 flex-shrink-0" /> {titre}
        </p>
        <p className="text-xs text-indigo-900/60 leading-relaxed">{description}</p>
      </div>
    </li>
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
