Fichiers modifiés / créés (à copier-coller dans ton projet) :

MODIFIÉS :
- prisma/schema.prisma        → commentaire mis à jour sur le model Avis (legacy)
- lib/notes.ts                → note boutique = moyenne des AvisProduit (plus jamais l'ancien model Avis)
- components/AvisProduit.tsx  → commentaire mis à jour
- app/vendeur/[id]/page.tsx   → utilise AvisRecentsBoutique au lieu de AvisBoutique

CRÉÉS :
- components/AvisRecentsBoutique.tsx  → affichage lecture seule des avis (remplace AvisBoutique)
- app/api/avis-boutique/route.ts      → API GET (pas de POST) pour ce composant

SUPPRIMÉ (à supprimer toi-même dans ton projet, pas inclus dans ce zip) :
- components/AvisBoutique.tsx  → l'ancien formulaire qui permettait de noter la boutique directement
