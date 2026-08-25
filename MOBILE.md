# Publier E-Mboppi sur Google Play et l'App Store (avec Capacitor)

Ce projet est maintenant configuré avec [Capacitor](https://capacitorjs.com) en
**mode distant** : l'app native charge votre site déployé sur Railway dans une
WebView native. Vous gardez un seul code source (celui-ci), et vos mises à
jour du site (Vercel/Railway) apparaissent aussitôt dans l'app, sans avoir à
republier sur les stores à chaque changement.

`capacitor.config.ts` pointe actuellement vers :
`https://e-mboppi-production.up.railway.app`
→ Si vous configurez un nom de domaine personnalisé plus tard, mettez cette
URL à jour avant de publier.

---

## Ce dont vous avez besoin

| Pour...        | Il vous faut |
|----------------|--------------|
| Android (Play Store) | [Android Studio](https://developer.android.com/studio) (fonctionne sur Windows), gratuit |
| iOS (App Store) | **Un Mac avec Xcode**, ou un service de build dans le cloud (voir plus bas) |
| Compte Google Play | 25 $ (paiement unique) sur [play.google.com/console](https://play.google.com/console) |
| Compte Apple Developer | 99 $/an sur [developer.apple.com](https://developer.apple.com/programs/) |

**Point important** : contrairement à Android, Apple exige que le build final
(le fichier `.ipa`) soit compilé avec Xcode, qui ne tourne que sur macOS. Si
vous n'avez pas de Mac, deux options :
- Un service de build cloud comme **Codemagic** (offre gratuite généreuse) ou
  **Ionic Appflow**, qui compile pour vous sans Mac.
- Louer un Mac à distance quelques heures (ex: MacinCloud).

---

## Étape 1 — Préparer le projet en local

```bash
npm install
```

Les paquets Capacitor (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`,
`@capacitor/ios`, `@capacitor/assets`) sont déjà dans `package.json`.

## Étape 2 — Ajouter les plateformes natives

```bash
npm run cap:add:android   # crée le dossier /android
npm run cap:add:ios       # crée le dossier /ios (nécessite d'être sur macOS, ou juste pour préparer les fichiers)
```

## Étape 3 — Générer les icônes et l'écran de démarrage

Le logo Kmer Vision a déjà été préparé dans `/resources` (icon.png 1024×1024,
splash.png 2732×2732). Générez toutes les tailles nécessaires :

```bash
npm run cap:assets
```

## Étape 4 — Synchroniser la config

À refaire à chaque fois que vous modifiez `capacitor.config.ts` :

```bash
npm run cap:sync
```

## Étape 5 — Ouvrir et compiler

**Android :**
```bash
npm run cap:open:android
```
Ça ouvre Android Studio. Menu **Build → Generate Signed Bundle / APK**, créez
une clé de signature (gardez-la précieusement, vous en aurez besoin pour
chaque future mise à jour), puis générez un `.aab` (Android App Bundle).

**iOS :**
```bash
npm run cap:open:ios
```
Ça ouvre Xcode. Sélectionnez votre équipe de développeur (compte Apple),
Product → Archive, puis Distribuez via App Store Connect.

## Étape 6 — Publier

- **Google Play Console** : créez une fiche app, uploadez le `.aab`, remplissez
  la politique de confidentialité (voir ci-dessous), la classification du
  contenu, puis soumettez à la revue (généralement quelques heures à 2 jours).
- **App Store Connect** : créez une fiche app, uploadez le build via Xcode ou
  Transporter, remplissez les mêmes informations, soumettez (revue souvent
  24-48h, parfois plus).

---

## ⚠️ Point de vigilance Apple : règle 4.2 ("fonctionnalité minimale")

Apple refuse parfois les apps qui ne sont "qu'un site web emballé". Pour
maximiser les chances d'acceptation :
- Ajoutez au moins une fonctionnalité native perceptible : notifications push
  (Capacitor le permet facilement), partage natif d'une fiche produit, ou
  utilisation de la caméra native pour publier une annonce.
- Présentez bien l'app dans sa description comme un **marketplace** avec de
  vraies fonctionnalités (achats, favoris, messagerie vendeur), pas comme un
  simple raccourci vers le site.
- Google Play est nettement plus tolérant sur ce point — commencer par
  Android est donc une bonne stratégie si vous voulez sortir vite.

## Politique de confidentialité (obligatoire sur les deux stores)

Il vous en faut une, accessible par une URL publique. Dites-moi si vous voulez
que je vous en rédige une (adaptée à Cloudinary, cookies de session, données
WhatsApp) et que je l'ajoute au site sous `/confidentialite`.
