"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

type Message = {
  id: string;
  expediteurId: string;
  contenu: string;
  createdAt: string;
};

export default function Messagerie({
  destinataireId,
  moiId,
}: {
  destinataireId: string;
  moiId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [texte, setTexte] = useState("");
  const finRef = useRef<HTMLDivElement>(null);

  async function charger() {
    const res = await fetch(`/api/messages?avec=${destinataireId}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages || []);
    }
  }

  useEffect(() => {
    charger();
    const intervalle = setInterval(charger, 4000);
    return () => clearInterval(intervalle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinataireId]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    if (!texte.trim()) return;
    const contenu = texte;
    setTexte("");
    setMessages((m) => [
      ...m,
      { id: `temp-${Date.now()}`, expediteurId: moiId, contenu, createdAt: new Date().toISOString() },
    ]);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinataireId, contenu }),
    });
    charger();
  }

  return (
    <div className="flex flex-col h-[420px] bg-white border border-stone-200 rounded-2xl overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <p className="text-xs text-indigo-900/40 text-center mt-6">
            Envoyez un message pour démarrer la conversation.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
              m.expediteurId === moiId
                ? "ml-auto bg-indigo-900 text-white rounded-br-sm"
                : "bg-stone-100 text-indigo-950 rounded-bl-sm"
            }`}
          >
            {m.contenu}
          </div>
        ))}
        <div ref={finRef} />
      </div>
      <form onSubmit={envoyer} className="flex items-center gap-2 border-t border-stone-200 p-2">
        <input
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="Écrire un message…"
          className="flex-1 bg-stone-50 rounded-full px-4 py-2 text-sm outline-none"
        />
        <button
          type="submit"
          className="bg-indigo-900 hover:bg-indigo-800 transition-colors text-white p-2.5 rounded-full"
          aria-label="Envoyer"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
