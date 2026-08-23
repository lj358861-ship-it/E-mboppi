# E-Mboppi

Plateforme du marché Mboppi (Douala), créée par **Kmer Vision**. Vitrines vidéo
courtes ("reels") et photos (1 à 5 par article) par vendeur, profils de
boutique cliquables, recherche avec filtres catégorie/prix, contact WhatsApp
direct, messagerie interne, favoris, et abonnement vendeur à 2000F/mois avec
activation/désactivation automatique.

---

## 1. Comment ça marche (résumé du fonctionnement)

- **Accueil** : articles des vendeurs (photo ou vidéo courte), regroupés par
  catégorie.
- **Ajout d'article (vendeur)** : upload direct de 1 à 5 photos et/ou d'une
  vidéo courte (façon "reel", 60s / 20 Mo max) — les fichiers sont stockés sur
  Cloudinary, les informations du produit sur Railway/Postgres.
- **Recherche** : recherche par nom, avec filtres par catégorie et par
  fourchette de prix.
- **Profil vendeur** : chaque boutique a une page publique cliquable
  (`/vendeur/[id]`) avec photo de profil, ville, description et catalogue
  complet. Le vendeur modifie sa photo de profil et sa description depuis son
  tableau de bord.
- **À propos** : présentation de Kmer Vision + formulaire "Devenir vendeur".
  À la soumission, WhatsApp s'ouvre automatiquement vers l'admin pour finaliser
  l'activation (envoi de la preuve de paiement des 2000F).
- **Admin** : liste des vendeurs avec jours restants d'abonnement. Un bouton
  "Valider le paiement" réactive l'abonnement pour 30 jours de plus.
- **Expiration automatique** : une tâche quotidienne (cron) repasse en "expiré"
  tout abonnement dépassé et masque automatiquement les produits du vendeur.
  Le vendeur voit alors un message l'invitant à renouveler.
- **Contact vendeur** : une icône/bouton WhatsApp sur chaque article ouvre
  `wa.me` avec un message pré-rempli mentionnant le produit exact, et une
  messagerie interne au site est aussi disponible (pour discuter sans quitter
  E-Mboppi).
- **Favoris** : chaque client peut enregistrer des articles.

---

## 2. Stockage des médias (Cloudinary) + données (Railway/Postgres)

Les photos, vidéos courtes et logos de boutique sont envoyés directement
depuis le site vers **Cloudinary** (voir `lib/cloudinary.ts` et
`app/api/upload/route.ts`) ; seules l'URL sécurisée et le `public_id` Cloudinary
sont enregistrés dans la base Postgres (Railway), via les champs `photos`,
`photosPublicIds`, `videoUrl`, `videoPublicId` du modèle `Produit` et
`logoUrl` / `logoPublicId` du modèle `Vendeur`. Supprimer un article ou changer
un logo supprime aussi le fichier correspondant sur Cloudinary.

Variables requises (déjà configurées dans vos variables Railway) :
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

---

## 3. Pourquoi ce choix technique (le plus simple et robuste)

- **Un seul projet Next.js** (frontend + API + base de données) : un seul
  déploiement Railway, pas de services à synchroniser.
- **Pas d'API WhatsApp Business officielle** (validation Meta, délais, coûts) :
  on utilise des liens `wa.me` avec message pré-rempli, qui fonctionnent
  immédiatement, sans clé API.
- **Validation de paiement manuelle par l'admin** (capture d'écran Mobile Money
  envoyée sur WhatsApp, un clic pour valider) : évite des semaines
  d'intégration à un agrégateur de paiement dès le lancement. CamPay ou
  NotchPay pourront automatiser ça plus tard, une fois le site en usage réel.

---

## 3. Déploiement sur Railway — étape par étape

### a) Préparer le dépôt
1. Créez un dépôt GitHub et poussez ce projet dedans.
2. Sur [railway.app](https://railway.app), cliquez **New Project** →
   **Deploy from GitHub repo** → sélectionnez le dépôt.

### b) Ajouter la base de données
3. Dans le même projet Railway, cliquez **New** → **Database** → **PostgreSQL**.
4. Railway crée automatiquement la variable `DATABASE_URL`. Dans votre service
   web, allez dans **Variables** → **Add Reference** → sélectionnez
   `DATABASE_URL` du service Postgres pour la lier.

### c) Configurer les variables d'environnement
Dans les **Variables** du service web, ajoutez (voir `.env.example`) :

| Variable | Description |
|---|---|
| `DATABASE_URL` | Référencée depuis le service Postgres (étape b) |
| `JWT_SECRET` | Chaîne aléatoire longue, ex: générée avec `openssl rand -hex 32` |
| `NEXT_PUBLIC_ADMIN_WHATSAPP` | Numéro WhatsApp Kmer Vision, format `237XXXXXXXXX` |
| `CRON_SECRET` | Chaîne aléatoire, protège l'endpoint de vérification des abonnements |
| `CLOUDINARY_CLOUD_NAME` | Depuis votre compte Cloudinary (déjà présent dans vos variables) |
| `CLOUDINARY_API_KEY` | Depuis votre compte Cloudinary (déjà présent dans vos variables) |
| `CLOUDINARY_API_SECRET` | Depuis votre compte Cloudinary (déjà présent dans vos variables) |

### d) Premier déploiement
5. Railway détecte Next.js automatiquement (Nixpacks) et lance
   `npm install`, puis `npm run build` (qui exécute `prisma generate` et
   `prisma db push`, créant les tables), puis `npm run start`.
6. Une fois déployé, générez un domaine public dans **Settings** → **Networking**
   → **Generate Domain**.

### e) Créer le compte administrateur (une seule fois)
7. Dans Railway, ouvrez un **Shell** sur le service web (bouton `...` → `Shell`),
   ou exécutez en local avec le `DATABASE_URL` de production :
   ```bash
   ADMIN_TELEPHONE=237600000000 ADMIN_MOT_DE_PASSE=votre-mot-de-passe npm run seed:admin
   ```
8. Connectez-vous ensuite sur `/vendeur/connexion` avec ce numéro — vous serez
   redirigé vers `/admin`.

### f) Mettre en place la vérification quotidienne des abonnements (cron)
9. Dans le projet Railway, cliquez **New** → **Cron Job**.
10. Commande : `curl "https://VOTRE-DOMAINE.up.railway.app/api/abonnements/verifier?secret=VOTRE_CRON_SECRET"`
11. Planification : `0 1 * * *` (tous les jours à 1h du matin).

C'est tout — le site est en ligne, l'abonnement s'auto-gère, et l'admin peut
valider les paiements depuis `/admin`.

---

## 4. Stockage des vidéos (étape suivante recommandée)

Pour l'instant, les vendeurs collent un lien vidéo (Cloudinary, YouTube, etc.)
dans le formulaire d'ajout de produit. Pour un upload direct depuis le
dashboard vendeur :

1. Créez un compte gratuit sur [cloudinary.com](https://cloudinary.com).
2. Ajoutez `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   dans les variables Railway.
3. Le SDK `cloudinary` est déjà installé — il suffit d'ajouter une route
   `/api/upload` qui reçoit le fichier et retourne l'URL Cloudinary à insérer
   dans `videoUrl`.

---

## 5. Rendre le site en application mobile (plus tard)

Le site est déjà responsive et peut être **installé comme PWA** (icône sur
l'écran d'accueil) sans travail supplémentaire important — il suffit d'ajouter
un `manifest.json` et un service worker basique.

Pour publier sur le Play Store / App Store sans réécrire le code :
1. Utilisez [Capacitor](https://capacitorjs.com) : il enveloppe le site
   Next.js déployé dans une coquille native.
2. `npx cap init`, configurez l'URL de production (votre domaine Railway)
   comme `server.url`, puis `npx cap add android` / `npx cap add ios`.

---

## 6. Développement local

```bash
npm install
cp .env.example .env   # renseignez DATABASE_URL (Postgres local ou Railway)
npx prisma generate
npx prisma db push
npm run dev
```

## 7. Structure du projet

```
app/
  page.tsx                    → Accueil (flux vidéo)
  recherche/page.tsx          → Recherche
  a-propos/page.tsx           → Kmer Vision + devenir vendeur
  produit/[id]/page.tsx       → Fiche produit + contact vendeur
  favoris/page.tsx            → Favoris client
  vendeur/dashboard/page.tsx  → Espace vendeur (abonnement, produits)
  vendeur/connexion/page.tsx  → Connexion vendeur/admin
  admin/page.tsx              → Espace admin (validation paiements)
  api/                        → Routes API (produits, vendeurs, messages...)
lib/
  prisma.ts                   → Client base de données
  auth.ts                     → Sessions (cookie JWT)
  abonnement.ts               → Logique métier abonnement 2000F/mois
  whatsapp.ts                 → Génération des liens wa.me
prisma/schema.prisma          → Modèle de données
scripts/                      → Création admin + vérification cron (CLI)
```
