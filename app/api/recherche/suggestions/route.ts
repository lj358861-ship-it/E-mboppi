import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/recherche/suggestions?q=chau — courtes suggestions pour
// l'autocomplétion de la barre de recherche (titres d'articles, sous-
// catégories, et boutiques), tant que l'utilisateur tape encore.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ suggestions: [] });

  const [produits, boutiques] = await Promise.all([
    prisma.produit.findMany({
      where: {
        visible: true,
        OR: [{ titre: { contains: q, mode: "insensitive" } }, { nature: { contains: q, mode: "insensitive" } }],
      },
      select: { titre: true, nature: true },
      take: 20,
      orderBy: { createdAt: "desc" },
    }),
    prisma.vendeur.findMany({
      where: { nomBoutique: { contains: q, mode: "insensitive" } },
      select: { nomBoutique: true },
      take: 5,
    }),
  ]);

  const suggestions = new Map<string, "produit" | "boutique">();
  for (const p of produits) {
    if (suggestions.size >= 6) break;
    suggestions.set(p.titre, "produit");
  }
  for (const b of boutiques) {
    if (suggestions.size >= 8) break;
    suggestions.set(b.nomBoutique, "boutique");
  }

  return NextResponse.json({
    suggestions: Array.from(suggestions.entries()).map(([texte, type]) => ({ texte, type })),
  });
}
