import { lireSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BoiteMessages from "./BoiteMessages";

export const dynamic = "force-dynamic";

export default async function MessagesVendeur() {
  const session = lireSession();
  if (!session || session.role !== "VENDEUR") redirect("/vendeur/connexion");

  return (
    <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto">
      <Link
        href="/vendeur/dashboard"
        className="flex items-center gap-1.5 text-xs font-medium text-indigo-900/60 hover:text-indigo-900 mb-3 w-fit"
      >
        <ArrowLeft size={14} /> Retour au tableau de bord
      </Link>
      <h1 className="font-display text-2xl font-semibold text-indigo-900 mb-1">Messages</h1>
      <p className="text-sm text-indigo-900/60 mb-6">
        Les questions de vos clients sur E-Mboppi, en dehors de WhatsApp.
      </p>
      <BoiteMessages moiId={session.id} />
    </div>
  );
}
