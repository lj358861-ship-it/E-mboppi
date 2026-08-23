import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Route temporaire à usage unique pour créer le compte admin.
// Appel : GET /api/setup-admin?secret=TON_CRON_SECRET
// Supprime ce fichier (ou son contenu) une fois le compte créé.
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const telephone = "652401831";
  const motDePasse = "lloydinho";

  const existant = await prisma.utilisateur.findUnique({ where: { telephone } });
  if (existant) {
    return NextResponse.json({ ok: true, message: "Le compte admin existe déjà.", telephone });
  }

  const admin = await prisma.utilisateur.create({
    data: {
      nom: "Kmer Vision",
      telephone,
      whatsapp: telephone,
      motDePasse: await bcrypt.hash(motDePasse, 10),
      role: "ADMIN",
    },
  });

  return NextResponse.json({
    ok: true,
    message: "Compte admin créé avec succès.",
    telephone: admin.telephone,
  });
}
