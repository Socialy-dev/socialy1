
# Simplification du modal de recherche pour Pinterest

## Résumé

Simplifier le `SearchCreativesModal` pour indiquer que les recherches se font sur Pinterest, avec un champ unique acceptant soit une URL Pinterest, soit un mot-clé.

## Changements prévus

### 1. Modal simplifié (`SearchCreativesModal.tsx`)

**Contenu actuel à supprimer :**
- Les 3 étapes d'instructions Meta Ads Library
- Le bouton "Ouvrir Meta Ads Library"
- Le sélecteur de type de média
- La validation spécifique aux URLs Meta

**Nouveau contenu :**
- Un bloc d'information expliquant que les recherches sont effectuées sur Pinterest
- Un champ unique avec placeholder "URL Pinterest ou mot-clé..."
- Le bouton de recherche

### 2. Mise à jour de l'Edge Function (`search-creatives`)

Adapter la validation pour accepter :
- Un mot-clé simple (ex: "Nike sneakers")
- OU une URL Pinterest (ex: "https://pinterest.com/...")

Le payload envoyé au webhook n8n contiendra :
- `search_term` : le texte saisi (URL ou mot-clé)
- `search_type` : "url" ou "keyword" (détecté automatiquement)
- `organization_id` et `user_id`

---

## Détails techniques

### Frontend - SearchCreativesModal.tsx

```tsx
// Nouveau state simplifié
const [searchTerm, setSearchTerm] = useState("");

// Nouvelle validation
const isValidInput = searchTerm.trim().length >= 2;

// Nouveau body de la requête
body: {
  search_term: searchTerm.trim(),
  search_type: searchTerm.includes("pinterest.com") ? "url" : "keyword",
  organization_id: effectiveOrgId,
  user_id: user?.id,
}
```

### Backend - search-creatives Edge Function

```typescript
// Nouvelle validation
const { search_term, search_type, organization_id, user_id } = body;

if (!search_term || search_term.trim().length < 2) {
  return createErrorResponse("INVALID_SEARCH_TERM", 400, corsHeaders);
}

// Payload vers n8n
const payload = {
  search_term: search_term.trim(),
  search_type: search_type || (search_term.includes("pinterest.com") ? "url" : "keyword"),
  organization_id,
  user_id,
  requested_at: new Date().toISOString(),
};
```

---

## Fichiers modifiés

| Fichier | Action |
|---------|--------|
| `src/components/social-media-paid/SearchCreativesModal.tsx` | Simplification complète du contenu |
| `supabase/functions/search-creatives/index.ts` | Adapter la validation pour URL/mot-clé Pinterest |
