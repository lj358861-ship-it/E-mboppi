import { v2 as cloudinary } from "cloudinary";
import { VIDEO_DUREE_MAX_SECONDES, VIDEO_TAILLE_MAX_OCTETS } from "./media-limits";

/**
 * E-Mboppi — Cloudinary (stockage des photos et vidéos)
 *
 * Les fichiers (photos + vidéos courtes des articles, logos des boutiques)
 * sont stockés sur Cloudinary. Seules les métadonnées (URL sécurisée +
 * public_id) sont enregistrées dans la base Railway/Postgres.
 *
 * Variables d'environnement requises (déjà présentes dans Railway) :
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const DOSSIER_PHOTOS = "e-mboppi/produits/photos";
export const DOSSIER_VIDEOS = "e-mboppi/produits/videos";
export const DOSSIER_LOGOS = "e-mboppi/vendeurs/logos";
export const DOSSIER_COUVERTURES = "e-mboppi/vendeurs/couvertures";

// Limites partagées avec les composants client (voir lib/media-limits.ts)
export {
  VIDEO_DUREE_MAX_SECONDES,
  VIDEO_TAILLE_MAX_OCTETS,
  PHOTO_TAILLE_MAX_OCTETS,
  PHOTOS_MAX_PAR_ARTICLE,
} from "./media-limits";

type ResultatUpload = {
  url: string;
  publicId: string;
};

/**
 * Envoie un buffer vers Cloudinary via un flux d'upload.
 * `resourceType` doit être "image" ou "video".
 */
export function uploaderVersCloudinary(
  buffer: Buffer,
  options: { resourceType: "image" | "video"; dossier: string }
): Promise<ResultatUpload> {
  return new Promise((resolve, reject) => {
    const flux = cloudinary.uploader.upload_stream(
      {
        folder: options.dossier,
        resource_type: options.resourceType,
        // Pour les vidéos courtes : on limite la durée et on optimise le poids
        ...(options.resourceType === "video"
          ? {
              eager: [{ duration: VIDEO_DUREE_MAX_SECONDES, crop: "limit" }],
              eager_async: false,
            }
          : {}),
      },
      (erreur, resultat) => {
        if (erreur || !resultat) {
          reject(erreur || new Error("Échec de l'envoi vers Cloudinary"));
          return;
        }
        resolve({ url: resultat.secure_url, publicId: resultat.public_id });
      }
    );
    flux.end(buffer);
  });
}

/** Supprime un fichier Cloudinary (photo, vidéo ou logo) — best effort, ne bloque jamais le flux principal */
export async function supprimerDeCloudinary(
  publicId: string | null | undefined,
  resourceType: "image" | "video" = "image"
) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch {
    // On ignore : un fichier orphelin sur Cloudinary n'est jamais bloquant
  }
}

export default cloudinary;
