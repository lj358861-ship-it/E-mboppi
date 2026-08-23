/**
 * E-Mboppi — Limites appliquées aux médias uploadés
 *
 * Fichier neutre (aucune dépendance serveur) afin de pouvoir être importé
 * aussi bien par le SDK Cloudinary côté serveur (lib/cloudinary.ts) que par
 * les composants client d'upload (components/UploadPhotos.tsx, UploadVideo.tsx).
 */

// Vidéo courte ("reel")
export const VIDEO_DUREE_MAX_SECONDES = 60;
export const VIDEO_TAILLE_MAX_OCTETS = 20 * 1024 * 1024; // 20 Mo

// Photos
export const PHOTO_TAILLE_MAX_OCTETS = 10 * 1024 * 1024; // 10 Mo
export const PHOTOS_MAX_PAR_ARTICLE = 5;
