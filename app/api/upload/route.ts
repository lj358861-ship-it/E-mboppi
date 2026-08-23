import { NextRequest, NextResponse } from "next/server";
import { lireSession } from "@/lib/auth";
import {
  uploaderVersCloudinary,
  DOSSIER_PHOTOS,
  DOSSIER_VIDEOS,
  DOSSIER_LOGOS,
  PHOTO_TAILLE_MAX_OCTETS,
  VIDEO_TAILLE_MAX_OCTETS,
} from "@/lib/cloudinary";

// Nécessaire pour manipuler des Buffer et parler à Cloudinary
export const runtime = "nodejs";

type TypeFichier = "photo" | "video" | "logo";

const CONFIG: Record<TypeFichier, { dossier: string; resourceType: "image" | "video"; tailleMax: number }> = {
  photo: { dossier: DOSSIER_PHOTOS, resourceType: "image", tailleMax: PHOTO_TAILLE_MAX_OCTETS },
  logo: { dossier: DOSSIER_LOGOS, resourceType: "image", tailleMax: PHOTO_TAILLE_MAX_OCTETS },
  video: { dossier: DOSSIER_VIDEOS, resourceType: "video", tailleMax: VIDEO_TAILLE_MAX_OCTETS },
};

// POST /api/upload — un vendeur envoie une photo, une vidéo courte ou son logo
export async function POST(req: NextRequest) {
  const session = lireSession();
  if (!session || session.role !== "VENDEUR") {
    return NextResponse.json({ erreur: "Réservé aux vendeurs" }, { status: 403 });
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json(
      { erreur: "Le stockage média n'est pas configuré (variables Cloudinary manquantes)." },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const fichier = formData.get("fichier");
  const type = formData.get("type") as TypeFichier | null;

  if (!fichier || !(fichier instanceof File)) {
    return NextResponse.json({ erreur: "Aucun fichier reçu" }, { status: 400 });
  }
  if (!type || !CONFIG[type]) {
    return NextResponse.json({ erreur: "Type de fichier invalide" }, { status: 400 });
  }

  const { dossier, resourceType, tailleMax } = CONFIG[type];

  if (fichier.size > tailleMax) {
    const maxMo = Math.round(tailleMax / (1024 * 1024));
    return NextResponse.json({ erreur: `Fichier trop volumineux (max ${maxMo} Mo)` }, { status: 400 });
  }

  const typeAttendu = resourceType === "video" ? "video/" : "image/";
  if (!fichier.type.startsWith(typeAttendu)) {
    return NextResponse.json({ erreur: `Ce champ n'accepte que des fichiers ${typeAttendu}*` }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await fichier.arrayBuffer());
    const resultat = await uploaderVersCloudinary(buffer, { resourceType, dossier });
    return NextResponse.json({ ok: true, url: resultat.url, publicId: resultat.publicId });
  } catch (erreur) {
    console.error("Erreur upload Cloudinary:", erreur);
    return NextResponse.json({ erreur: "Échec de l'envoi du fichier. Réessayez." }, { status: 500 });
  }
}
