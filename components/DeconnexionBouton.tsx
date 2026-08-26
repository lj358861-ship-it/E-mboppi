"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";

export default function DeconnexionBouton({ className = "" }: { className?: string }) {
  const [enCours, setEnCours] = useState(false);
  const router = useRouter();

  async function seDeconnecter() {
    setEnCours(true);
    await fetch("/api/auth/deconnexion", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={seDeconnecter}
      disabled={enCours}
      className={
        className ||
        "flex items-center gap-1.5 text-sm font-medium text-indigo-900/60 hover:text-piment-500 transition-colors disabled:opacity-60"
      }
    >
      {enCours ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
      Se déconnecter
    </button>
  );
}
