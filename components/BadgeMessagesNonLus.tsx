"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default function BadgeMessagesNonLus() {
  const [nbNonLus, setNbNonLus] = useState(0);

  useEffect(() => {
    let annule = false;
    async function charger() {
      try {
        const res = await fetch("/api/messages/non-lus");
        if (!res.ok) return;
        const data = await res.json();
        if (!annule) setNbNonLus(data.nbNonLus || 0);
      } catch {
        // silencieux — on retentera au prochain intervalle
      }
    }
    charger();
    const intervalle = setInterval(charger, 15000);
    return () => {
      annule = true;
      clearInterval(intervalle);
    };
  }, []);

  return (
    <Link
      href="/vendeur/dashboard/messages"
      className="relative flex items-center gap-1.5 text-xs font-medium text-indigo-900/60 hover:text-indigo-900"
    >
      <MessageSquare size={14} /> Messages
      {nbNonLus > 0 && (
        <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-piment-500 text-white text-[10px] font-bold">
          {nbNonLus > 9 ? "9+" : nbNonLus}
        </span>
      )}
    </Link>
  );
}
