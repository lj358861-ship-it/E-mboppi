import { NextRequest, NextResponse } from "next/server";
import { lienDevenirVendeur } from "@/lib/whatsapp";

/**
 * GET /api/whatsapp-admin
 *
 * Redirige directement vers WhatsApp, en conversation avec l'admin
 * Kmer Vision (numéro configuré dans NEXT_PUBLIC_ADMIN_WHATSAPP, ou
 * 237652401831 par défaut).
 *
 * Paramètre optionnel ?nom=Jean pour personnaliser le message envoyé.
 * Utile pour un lien direct depuis un flyer, un QR code, un bouton, etc.
 */
export async function GET(req: NextRequest) {
  const nom = req.nextUrl.searchParams.get("nom") || undefined;
  return NextResponse.redirect(lienDevenirVendeur(nom), { status: 302 });
}
