import { lireSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminDashboard from "./AdminDashboard";

export default async function Admin() {
  const session = lireSession();
  if (!session || session.role !== "ADMIN") redirect("/vendeur/connexion");

  return (
    <div className="relative min-h-screen bg-indigo-950 overflow-hidden">
      {/* Halos décoratifs néon violet/magenta */}
      <div className="neon-blob bg-neon-600 w-72 h-72 -top-20 -left-20 animate-float-slow" />
      <div className="neon-blob bg-neonpink-500 w-72 h-72 top-1/3 -right-24 animate-float-slow" style={{ animationDelay: "2s" }} />
      <div className="neon-blob bg-neon-500 w-64 h-64 bottom-0 left-1/4 animate-float-slow" style={{ animationDelay: "4s" }} />

      <div className="relative px-4 md:px-8 py-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-neon-400 font-semibold mb-1">
            Kmer Vision
          </p>
          <h1 className="font-display text-3xl font-semibold text-white neon-text mb-1">
            Administration
          </h1>
          <p className="text-sm text-neon-300/60">
            Vendeurs, annonces, abonnements et statistiques de la plateforme.
          </p>
        </div>

        <AdminDashboard />
      </div>
    </div>
  );
}
