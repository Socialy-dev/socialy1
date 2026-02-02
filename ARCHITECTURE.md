# ARCHITECTURE SOCIALY

> Documentation complète de l'architecture du projet Socialy
> Dernière mise à jour : 2026-01-18

---

## 1. DATABASE SCHEMA

### Tables Principales

#### **organizations** (Multi-tenant)
```sql
- id (UUID, PK)
- name (TEXT)
- slug (TEXT, UNIQUE)
- logo_url (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```
**RLS:** Membres peuvent voir leur org, super_admins voient tout

---

#### **organization_members** (Rôles utilisateurs)
```sql
- id (UUID, PK)
- organization_id (UUID, FK → organizations)
- user_id (UUID)
- role (org_role: super_admin | org_admin | org_user)
- created_at (TIMESTAMPTZ)
- UNIQUE(organization_id, user_id)
```
**RLS:** Admins peuvent voir/gérer membres de leur org

---

#### **journalists** (Relations presse)
```sql
- id (UUID, PK)
- organization_id (UUID, FK → organizations)
- name (TEXT)
- media (TEXT)
- linkedin (TEXT)
- email (TEXT)
- phone (TEXT)
- job (TEXT) -- Titre professionnel
- notes (TEXT)
- source_article_id (UUID)
- source_type (TEXT) -- 'socialy', 'competitor', 'client'
- competitor_name (TEXT)
- enrichment_status (TEXT) -- 'pending', 'processing', 'completed', 'failed', 'not_found'
- enriched_at (TIMESTAMPTZ)
- enrichment_error (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```
**Triggers:** Auto-extraction depuis socialy_articles et competitor_articles
**Index:** organization_id, enrichment_status
**RLS:** Membres org peuvent voir leurs journalistes

---

#### **socialy_articles** (Articles mentionnant Socialy)
```sql
- id (UUID, PK)
- organization_id (UUID, FK → organizations)
- title (TEXT)
- link (TEXT)
- snippet (TEXT)
- thumbnail (TEXT)
- thumbnail_small (TEXT)
- source_name (TEXT)
- source_icon (TEXT)
- authors (TEXT)
- article_date (TEXT)
- article_iso_date (TIMESTAMPTZ)
- position (INTEGER)
- hidden (BOOLEAN)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
- UNIQUE(organization_id, link)
```
**RLS:** Membres org peuvent voir leurs articles

---

#### **competitor_articles** (Articles concurrents)
```sql
- id (UUID, PK)
- organization_id (UUID, FK → organizations)
- competitor_id (UUID, FK → competitor_agencies)
- competitor_name (TEXT)
- title (TEXT)
- link (TEXT)
- snippet (TEXT)
- thumbnail (TEXT)
- source_name (TEXT)
- authors (TEXT)
- article_date (TEXT)
- article_iso_date (TIMESTAMPTZ)
- hidden (BOOLEAN)
- created_at (TIMESTAMPTZ)
- UNIQUE(organization_id, link)
```

---

#### **client_articles** (Articles clients)
```sql
- id (UUID, PK)
- organization_id (UUID, FK → organizations)
- client_id (UUID, FK → clients)
- client_name (TEXT)
- title (TEXT)
- link (TEXT)
- snippet (TEXT)
- thumbnail (TEXT)
- source_name (TEXT)
- authors (TEXT)
- article_date (TEXT)
- hidden (BOOLEAN)
- created_at (TIMESTAMPTZ)
- UNIQUE(organization_id, link)
```

---

#### **competitor_agencies** (Agences concurrentes)
```sql
- id (UUID, PK)
- organization_id (UUID, FK → organizations)
- name (TEXT)
- website (TEXT)
- linkedin (TEXT)
- email (TEXT)
- specialty (TEXT)
- notes (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

---

#### **market_watch_topics** (Veille marché)
```sql
- id (UUID, PK)
- organization_id (UUID, FK → organizations)
- link (TEXT)
- title (TEXT)
- source_name (TEXT)
- source_icon (TEXT)
- authors (TEXT)
- thumbnail (TEXT)
- article_date (TEXT)
- article_iso_date (TIMESTAMPTZ)
- snippet (TEXT)
- position (INTEGER)
- hidden (BOOLEAN)
- status (TEXT) -- 'pending', 'processed'
- created_by (UUID)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
- UNIQUE(organization_id, link)
```

---

#### **communique_presse** (Communiqués de presse)
```sql
- id (UUID, PK)
- organization_id (UUID, FK → organizations)
- name (TEXT)
- pdf_url (TEXT)
- word_url (TEXT)
- google_drive_url (TEXT)
- assets_link (TEXT)
- created_by (UUID)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```
**Storage:** Bucket 'communique_presse' (privé)
**RLS:** Admins peuvent gérer, users peuvent voir

---

#### **user_linkedin_posts** (Posts LinkedIn utilisateurs)
```sql
- id (UUID, PK)
- user_id (UUID)
- content (TEXT)
- posted_at (TIMESTAMPTZ)
- post_url (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

---

#### **organization_linkedin_posts** (Posts LinkedIn organisations)
```sql
- id (UUID, PK)
- organization_id (UUID, FK → organizations)
- post_url (TEXT)
- text (TEXT)
- posted_at_date (TEXT)
- author_name (TEXT)
- author_headline (TEXT)
- author_profile_url (TEXT)
- author_avatar_url (TEXT)
- likes_count (INTEGER)
- comments_count (INTEGER)
- reposts_count (INTEGER)
- impressions (INTEGER)
- engagement_rate (NUMERIC)
- media_items (JSONB)
- created_at (TIMESTAMPTZ)
```

---

#### **generated_posts_linkedin** (Posts LinkedIn générés)
```sql
- id (UUID, PK)
- user_id (UUID)
- organization_id (UUID, FK → organizations)
- request_id (UUID, UNIQUE, DEFAULT gen_random_uuid())
- subject (TEXT)
- objective (TEXT)
- tone (TEXT)
- status (TEXT) -- 'pending', 'completed', 'error'
- generated_content (TEXT)
- created_at (TIMESTAMPTZ)
```

---

#### **documents** (RAG / Embeddings)
```sql
- id (UUID, PK)
- user_id (UUID)
- content (TEXT)
- embedding (vector(1536)) -- pgvector pour OpenAI embeddings
- document_type (TEXT) -- 'linkedin_post', 'press_release', 'blog_article', etc.
- source_id (UUID)
- metadata (JSONB)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```
**Index:** (user_id, document_type), source_id
**Fonction:** `match_documents()` pour recherche par similarité

---

#### **job_logs** (PGMQ - Queue jobs asynchrones)
```sql
- id (UUID, PK)
- organization_id (UUID, FK → organizations)
- queue_name (TEXT) -- 'journalist_enrichment', 'article_enrichment', 'linkedin_generation'
- job_type (TEXT)
- status (TEXT) -- 'pending', 'processing', 'completed', 'failed'
- payload (JSONB)
- result (JSONB)
- error_message (TEXT)
- attempts (INTEGER)
- created_at (TIMESTAMPTZ)
- started_at (TIMESTAMPTZ)
- completed_at (TIMESTAMPTZ)
```
**Queues PGMQ:**
- `journalist_enrichment`
- `article_enrichment`
- `linkedin_generation`

**Fonction helper:** `enqueue_job(queue_name, job_type, organization_id, payload)`

**Cron Job:** `process-journalist-enrichment-queue` (toutes les 30s)

---

### Extensions PostgreSQL

- **pgmq** - Postgres Message Queue
- **pg_cron** - Scheduled jobs
- **pg_net** - HTTP requests
- **vector** (pgvector) - Embeddings pour RAG

---

## 2. EDGE FUNCTIONS

### **journalist-enrichment-worker**
**Rôle:** Worker PGMQ qui traite les enrichissements de journalistes
**Trigger:** Cron (30s) ou manuel via `notify-new-journalist`

**Input:** Aucun (lit la queue PGMQ)

**Process:**
1. Lit batch de 5 messages max depuis queue `journalist_enrichment`
2. Pour chaque journaliste:
   - Appelle Apify Actor `CP1SVZfEwWflrmWCX` (LinkedIn Profile Search)
   - Extrait: linkedin, email, phone, job title
   - Sélectionne le meilleur profil (score basé sur mots-clés journalisme)
   - Met à jour `journalists.enrichment_status` → 'completed' / 'not_found' / 'failed'
   - Archive le message PGMQ
3. Traite max 30 jobs par exécution

**Tables DB:**
- `job_logs` (lecture + update)
- `journalists` (update)

**APIs externes:**
- Apify: `https://api.apify.com/v2/acts/CP1SVZfEwWflrmWCX/run-sync-get-dataset-items`

**Env vars:**
- `APIFY_API_TOKEN` ⚠️ REQUIS
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

### **notify-new-journalist**
**Rôle:** Enqueue enrichissement de journaliste(s) et déclenche le worker

**Input:**
```json
{
  "journalists": [
    {
      "journalist_id": "uuid",
      "name": "John Doe",
      "media": "Le Monde",
      "organization_id": "uuid"
    }
  ],
  // OU pour un seul journaliste:
  "journalist_id": "uuid",
  "name": "John Doe",
  "media": "Le Monde",
  "organization_id": "uuid"
}
```

**Output:**
```json
{
  "success": true,
  "queued": 3,
  "total": 3,
  "processed": 3,
  "successCount": 2,
  "errorCount": 1,
  "message": "2 journaliste(s) enrichi(s), 1 erreur(s) sur 3 traité(s)."
}
```

**Process:**
1. Valide batch size (max 25 journalistes)
2. Pour chaque journaliste:
   - Update `journalists.enrichment_status` → 'pending'
   - Appelle `enqueue_job()` → ajoute à queue PGMQ
3. Déclenche `journalist-enrichment-worker` (appel HTTP)

**Tables DB:**
- `journalists` (update)
- `job_logs` (via `enqueue_job`)

**Appelle Edge Functions:**
- `journalist-enrichment-worker` (HTTP POST)

**Env vars:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

### **enrich-article**
**Rôle:** Envoie un article à n8n pour enrichissement (scraping, analyse)

**Input:**
```json
{
  "link": "https://example.com/article",
  "type": "socialy" | "competitor" | "client",
  "user_id": "uuid",
  "competitor_id": "uuid", // si type=competitor
  "competitor_name": "Agence X",
  "client_id": "uuid", // si type=client
  "client_name": "Client Y",
  "organization_id": "uuid"
}
```

**Output:**
```json
{
  "success": true,
  "message": "Article sent for enrichment",
  "webhook_response": {...}
}
```

**Process:**
1. Vérifie authentification (JWT)
2. Envoie payload à webhook n8n

**APIs externes:**
- n8n webhook: `N8N_WEBHOOK_URL`

**Env vars:**
- `N8N_WEBHOOK_URL` ⚠️ REQUIS
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

---

### **generate-linkedin-post**
**Rôle:** Génère un post LinkedIn via n8n + RAG (contexte des anciens posts)

**Input:**
```json
{
  "subject": "Le micro-learning en formation",
  "objective": "Éduquer sur les avantages",
  "tone": "Professionnel et accessible"
}
```

**Output:**
```json
{
  "success": true,
  "request_id": "uuid",
  "data": {...}
}
```

**Process:**
1. Récupère les 10 derniers posts LinkedIn de l'user (`documents` table, type='linkedin_post')
2. Crée un enregistrement dans `generated_posts_linkedin` (status='pending')
3. Envoie à n8n: subject + objective + tone + contexte anciens posts
4. n8n génère le post (LLM) et met à jour `generated_posts_linkedin`

**Tables DB:**
- `documents` (SELECT, pour RAG context)
- `generated_posts_linkedin` (INSERT, UPDATE)

**APIs externes:**
- n8n webhook: `N8N_WEBHOOK_URL`

**Env vars:**
- `N8N_WEBHOOK_URL` ⚠️ REQUIS
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

---

### **generate-embedding**
**Rôle:** Stocke du contenu dans la table `documents` (pour RAG)

**Input:**
```json
{
  "content": "Contenu du document",
  "document_type": "linkedin_post",
  "source_id": "uuid",
  "user_id": "uuid",
  "metadata": {...}
}
```

**Output:**
```json
{
  "success": true,
  "id": "uuid",
  "action": "created" | "updated"
}
```

**Process:**
1. Vérifie si document existe déjà (via source_id)
2. Si existe: UPDATE, sinon: INSERT
3. Stocke le contenu (pas d'embedding généré ici, utilise full-text search)

**Tables DB:**
- `documents` (INSERT ou UPDATE)

**Authentification:**
- JWT (Bearer token) OU API key (`EMBEDDING_API_KEY`) pour webhooks n8n

**Env vars:**
- `EMBEDDING_API_KEY` (pour auth n8n)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

### **fetch-organization-articles**
**Rôle:** Déclenche scraping d'articles mentionnant une organisation via n8n

**Input:**
```json
{
  "organization_id": "uuid",
  "organization_name": "Socialy",
  "is_cron": false
}
```

**Output:**
```json
{
  "success": true,
  "organization_id": "uuid",
  "organization_name": "Socialy",
  "n8n_response": {...}
}
```

**Process:**
1. Si `organization_name` non fourni, le récupère depuis DB
2. Envoie à n8n pour scraping (SerpAPI ou autre)
3. n8n insère résultats dans `socialy_articles`

**Tables DB:**
- `organizations` (SELECT si name manquant)

**APIs externes:**
- n8n webhook: `N8N_ORGANIZATION_ARTICLES_WEBHOOK_URL`

**Env vars:**
- `N8N_ORGANIZATION_ARTICLES_WEBHOOK_URL` ⚠️ REQUIS
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

### **create-communique**
**Rôle:** Crée un communiqué de presse et déclenche workflow n8n (génération PDF/Word)

**Input:**
```json
{
  "cpType": "Lancement produit",
  "cpTypeOther": "...",
  "clientMarque": "Acme Corp",
  "titre": "Nouveau produit révolutionnaire",
  "sousTitre": "...",
  "sujetPrincipal": "Innovation technologique",
  "angleCreatif": "...",
  "messagesCles": "...",
  "dateDiffusion": "2024-02-01",
  "lienAssets": "https://drive.google.com/...",
  "imageUrl": "https://...",
  "equipeClient": "...",
  "equipeSocialy": "...",
  "contactNom": "John Doe",
  "contactFonction": "CEO",
  "contactEmail": "john@example.com",
  "contactTelephone": "+33612345678",
  "infosSupplementaires": "..."
}
```

**Output:**
```json
{
  "success": true,
  "communique": {
    "id": "uuid",
    "name": "Acme Corp - Lancement produit",
    ...
  }
}
```

**Process:**
1. Insère dans `communique_presse` (name, assets_link, created_by)
2. Envoie payload à n8n
3. n8n génère PDF/Word et met à jour `pdf_url`/`word_url`

**Tables DB:**
- `communique_presse` (INSERT)

**APIs externes:**
- n8n webhook: `N8N_CREATE_CP_WEBHOOK_URL`

**Env vars:**
- `N8N_CREATE_CP_WEBHOOK_URL` (optionnel)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

---

### **send-invitation-email**
**Rôle:** Envoie un email d'invitation à un nouvel utilisateur via Resend

**Input:**
```json
{
  "email": "john@example.com",
  "inviteLink": "https://socialy1.lovable.app/auth?invite=...",
  "role": "admin",
  "pages": ["dashboard", "relations-presse", "social-media"]
}
```

**Output:**
```json
{
  "success": true,
  "data": {...}
}
```

**Process:**
1. Vérifie que l'utilisateur est admin/super_admin
2. Envoie email HTML via Resend avec:
   - Lien d'invitation
   - Rôle attribué
   - Pages accessibles
   - Expiration: 7 jours

**Tables DB:**
- `user_roles` (SELECT pour vérification admin)

**APIs externes:**
- Resend: `resend.emails.send()`

**Env vars:**
- `RESEND_API_KEY` ⚠️ REQUIS
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

### **notify-new-client**
**Rôle:** Notifie n8n qu'un nouveau client a été ajouté (trigger scraping articles)

**Input:**
```json
{
  "client_id": "uuid",
  "client_name": "Acme Corp",
  "organization_id": "uuid"
}
```

**Output:**
```json
{
  "success": true
}
```

**Process:**
1. Envoie notification à n8n
2. n8n scrape articles mentionnant le client

**APIs externes:**
- n8n webhook: `N8N_CLIENT_WEBHOOK_URL`

**Env vars:**
- `N8N_CLIENT_WEBHOOK_URL` ⚠️ REQUIS
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

### **notify-new-competitor**
**Rôle:** Notifie n8n qu'un nouveau concurrent a été ajouté (trigger scraping articles)

**Input:**
```json
{
  "competitor_id": "uuid",
  "competitor_name": "Agence Rivale",
  "organization_id": "uuid"
}
```

**Output:**
```json
{
  "success": true
}
```

**Process:**
1. Envoie notification à n8n
2. n8n scrape articles mentionnant le concurrent

**APIs externes:**
- n8n webhook: `N8N_COMPETITOR_WEBHOOK_URL`

**Env vars:**
- `N8N_COMPETITOR_WEBHOOK_URL` ⚠️ REQUIS
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

### **add-market-topic**
**Rôle:** Ajoute un topic de veille marché et notifie n8n pour scraping

**Input:**
```json
{
  "topic_name": "Intelligence artificielle en RH",
  "topic_link": "https://example.com/article",
  "organization_id": "uuid"
}
```

**Output:**
```json
{
  "success": true,
  "message": "Topic added successfully",
  "topic": {...}
}
```

**Process:**
1. UPSERT dans `market_watch_topics` (évite doublons sur organization_id + link)
2. Envoie à n8n pour monitoring automatique

**Tables DB:**
- `market_watch_topics` (UPSERT)

**APIs externes:**
- n8n webhook: `N8N_MARKET_TOPIC_WEBHOOK_URL`

**Env vars:**
- `N8N_MARKET_TOPIC_WEBHOOK_URL` (optionnel)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

---

## 3. FRONTEND PAGES

### **/dashboard** (`src/pages/Dashboard.tsx`)
**Rôle:** Vue d'ensemble des statistiques et projets

**Composants:**
- OverviewCards (stats globales)
- ProjectSummary
- OverallProgress
- TodayTask
- ProjectsWorkload
- AIAssistant (chatbot flottant)

**Appels API:** Aucun appel direct aux Edge Functions (récupère data via Supabase client)

---

### **/relations-presse** (`src/pages/RelationsPresse.tsx`)
**Rôle:** Gestion relations presse (journalistes, articles, communiqués)

**Fonctionnalités:**
1. **Onglet Journalistes**
   - Liste des journalistes enrichis
   - Bouton "Enrichir" → appelle `notify-new-journalist`
   - Affichage status enrichissement (pending, processing, completed, failed)

2. **Onglet Articles Socialy**
   - Articles mentionnant Socialy
   - Bouton "Enrichir article" → appelle `enrich-article` (type='socialy')
   - Masquer/afficher articles

3. **Onglet Articles Concurrents**
   - Articles des concurrents
   - Bouton "Enrichir article" → appelle `enrich-article` (type='competitor')

4. **Onglet Articles Clients**
   - Articles des clients
   - Bouton "Enrichir article" → appelle `enrich-article` (type='client')

5. **Onglet Communiqués**
   - Liste des communiqués de presse
   - Bouton "Créer CP" → modal → appelle `create-communique`

**Edge Functions appelées:**
- `notify-new-journalist` (enrichissement batch journalistes)
- `enrich-article` (enrichissement articles)
- `create-communique` (création CP)

**Tables DB:**
- `journalists` (SELECT, UPDATE)
- `socialy_articles` (SELECT, UPDATE)
- `competitor_articles` (SELECT, UPDATE)
- `client_articles` (SELECT, UPDATE)
- `communique_presse` (SELECT, INSERT)
- `competitor_agencies` (SELECT)

---

### **/social-media** (`src/pages/SocialMedia.tsx`)
**Rôle:** Statistiques réseaux sociaux (LinkedIn, Twitter, Instagram, Facebook)

**Fonctionnalités:**
- Vue globale des stats (impressions, engagement, followers)
- Filtres par plateforme
- **Actuellement: mock data** (pas d'intégration réelle)

**Edge Functions appelées:** Aucune (données mockées)

---

### **/growth-marketing** (`src/pages/GrowthMarketing.tsx`)
**Rôle:** Growth marketing et génération de contenu LinkedIn

**Fonctionnalités:**
1. **Onglet LinkedIn**
   - Sous-onglet "Génération de posts"
     - Formulaire: sujet, objectif, ton
     - Bouton "Générer" → appelle `generate-linkedin-post`
     - Affichage du post généré + copie
   - Sous-onglet "Classement posts"
     - Affiche posts LinkedIn de l'organisation
     - Statistiques d'engagement

2. **Onglet Veille Marché** (marche-public)
   - Ajout de topics de veille
   - Appelle `add-market-topic`

**Edge Functions appelées:**
- `generate-linkedin-post` (génération posts LinkedIn)
- `add-market-topic` (ajout topic veille)

**Tables DB:**
- `generated_posts_linkedin` (SELECT, INSERT)
- `organization_linkedin_posts` (SELECT)
- `market_watch_topics` (SELECT, INSERT)

---

### **/admin** (`src/pages/Admin.tsx`)
**Rôle:** Administration utilisateurs et organisations (super_admin uniquement)

**Fonctionnalités:**
1. **Gestion utilisateurs**
   - Liste des membres avec leurs rôles
   - Suppression de membres

2. **Invitations**
   - Formulaire invitation: email, rôle, pages accessibles
   - Bouton "Envoyer" → appelle `send-invitation-email`
   - Liste des invitations en attente/utilisées/expirées

3. **Organisations** (super_admin)
   - Création de nouvelles organisations
   - Vue d'ensemble des organisations

**Edge Functions appelées:**
- `send-invitation-email` (envoi invitations)

**Tables DB:**
- `organization_members` (SELECT, DELETE)
- `organizations` (SELECT, INSERT)
- `invitations` (SELECT, INSERT)
- `user_roles` (SELECT)

---

### **/profile** (`src/pages/Profile.tsx`)
**Rôle:** Profil utilisateur

**Fonctionnalités:**
- Modification infos personnelles
- Changement mot de passe

**Edge Functions appelées:** Aucune

---

### **/auth** (`src/pages/Auth.tsx`)
**Rôle:** Authentification (login/signup)

**Fonctionnalités:**
- Connexion email/password
- Inscription
- Réinitialisation mot de passe
- Acceptation d'invitation (token dans URL)

**Edge Functions appelées:** Aucune (Supabase Auth directement)

---

## 4. INTÉGRATIONS EXTERNES

### 🔗 **n8n Webhooks**

#### `N8N_WEBHOOK_URL`
- **Utilisé par:** `enrich-article`, `generate-linkedin-post`
- **Fonction:** Enrichissement articles + génération posts LinkedIn

#### `N8N_ORGANIZATION_ARTICLES_WEBHOOK_URL`
- **Utilisé par:** `fetch-organization-articles`
- **Fonction:** Scraping articles mentionnant une organisation (SerpAPI)

#### `N8N_CLIENT_WEBHOOK_URL`
- **Utilisé par:** `notify-new-client`
- **Fonction:** Scraping articles d'un nouveau client

#### `N8N_COMPETITOR_WEBHOOK_URL`
- **Utilisé par:** `notify-new-competitor`
- **Fonction:** Scraping articles d'un nouveau concurrent

#### `N8N_MARKET_TOPIC_WEBHOOK_URL`
- **Utilisé par:** `add-market-topic`
- **Fonction:** Monitoring automatique d'un topic de veille

#### `N8N_CREATE_CP_WEBHOOK_URL`
- **Utilisé par:** `create-communique`
- **Fonction:** Génération PDF/Word communiqué de presse

---

### 🤖 **Apify**

#### Actor: `CP1SVZfEwWflrmWCX` (LinkedIn Profile Search)
- **Utilisé par:** `journalist-enrichment-worker`
- **Fonction:** Recherche profils LinkedIn par prénom/nom
- **Mode:** "Full + email search" (scraping email + téléphone)
- **Output:** linkedin_url, email, phone, job title, firstName, lastName

**Configuration:**
```typescript
{
  firstName: "John",
  lastName: "Doe",
  profileScraperMode: "Full + email search",
  maxItems: 2
}
```

**Endpoint:** `https://api.apify.com/v2/acts/CP1SVZfEwWflrmWCX/run-sync-get-dataset-items`

---

### 📧 **Resend** (Email Service)

- **Utilisé par:** `send-invitation-email`
- **Fonction:** Envoi emails d'invitation avec template HTML
- **From:** `onboarding@resend.dev`
- **Features:** Template responsive, branding Socialy

---

### 🔍 **SerpAPI** (via n8n)

- **Utilisé par:** Workflows n8n (scraping articles)
- **Fonction:** Recherche Google News pour articles mentionnant organisations/clients/concurrents
- **Pas d'appel direct depuis Edge Functions**

---

### 🧠 **OpenAI** (via n8n)

- **Utilisé par:** Workflow n8n `generate-linkedin-post`
- **Fonction:** Génération de posts LinkedIn avec contexte RAG
- **Pas d'appel direct depuis Edge Functions**

---

### 📊 **pgvector** (Extension PostgreSQL)

- **Fonction:** Stockage embeddings pour RAG
- **Table:** `documents.embedding` (vector(1536))
- **Recherche:** Fonction `match_documents()` (similarité cosine)
- **Status:** Embeddings stockés mais pas encore générés (full-text search utilisé)

---

## 5. ARCHITECTURE SYSTÈME

### Flux de données typiques

#### **Enrichissement journaliste:**
```
Frontend (RelationsPresse)
  → Edge Function: notify-new-journalist
    → Insert job_logs + PGMQ queue
    → Trigger journalist-enrichment-worker
      → Read PGMQ queue
      → Call Apify API
      → Update journalists table
      → Archive PGMQ message
```

#### **Génération post LinkedIn:**
```
Frontend (GrowthMarketing)
  → Edge Function: generate-linkedin-post
    → Read documents (RAG context)
    → Insert generated_posts_linkedin
    → Webhook n8n
      → n8n: Call OpenAI + RAG
      → Update generated_posts_linkedin
```

#### **Scraping articles organisation:**
```
Frontend (Admin/Dashboard)
  → Edge Function: fetch-organization-articles
    → Webhook n8n
      → n8n: Call SerpAPI
      → Insert socialy_articles
```

---

### Cron Jobs

#### `process-journalist-enrichment-queue`
- **Fréquence:** Toutes les 30 secondes
- **Action:** Appelle `journalist-enrichment-worker` (HTTP POST)
- **Engine:** pg_cron + pg_net

**Configuration:**
```sql
SELECT cron.schedule(
  'process-journalist-enrichment-queue',
  '30 seconds',
  $$ SELECT net.http_post(...) $$
);
```

---

## 6. SÉCURITÉ & RLS

### Row Level Security (RLS)

**Toutes les tables ont RLS activé** avec politiques basées sur:
- `organization_id` (multi-tenant strict)
- `user_id` (isolation utilisateur)
- Rôles: `super_admin`, `org_admin`, `org_user`

### Fonctions de sécurité

```sql
-- Vérifie si user est super_admin
is_super_admin(user_id UUID) RETURNS BOOLEAN

-- Récupère le rôle d'un user dans une org
get_user_org_role(user_id UUID, org_id UUID) RETURNS org_role

-- Vérifie si user appartient à une org
user_belongs_to_org(user_id UUID, org_id UUID) RETURNS BOOLEAN
```

### CORS

**Domaines autorisés:**
- `https://socialy1.lovable.app`
- `https://id-preview--*.lovable.app`
- `http://localhost:5173`
- `http://localhost:3000`
- Tous les sous-domaines `*.lovableproject.com` et `*.lovable.app`

---

## 7. VARIABLES D'ENVIRONNEMENT REQUISES

### Supabase (Edge Functions)
```bash
SUPABASE_URL                              # URL projet Supabase
SUPABASE_ANON_KEY                         # Clé anon publique
SUPABASE_SERVICE_ROLE_KEY                 # Clé service (admin)
```

### APIs tierces
```bash
APIFY_API_TOKEN                           # ⚠️ REQUIS (enrichissement journalistes)
RESEND_API_KEY                            # ⚠️ REQUIS (envoi emails)
EMBEDDING_API_KEY                         # Auth webhooks n8n → generate-embedding
```

### Webhooks n8n
```bash
N8N_WEBHOOK_URL                           # ⚠️ REQUIS (articles + LinkedIn posts)
N8N_ORGANIZATION_ARTICLES_WEBHOOK_URL     # ⚠️ REQUIS (scraping articles org)
N8N_CLIENT_WEBHOOK_URL                    # Scraping articles clients
N8N_COMPETITOR_WEBHOOK_URL                # Scraping articles concurrents
N8N_MARKET_TOPIC_WEBHOOK_URL              # Monitoring topics veille
N8N_CREATE_CP_WEBHOOK_URL                 # Génération communiqués PDF/Word
```

### Configuration pg_cron
```sql
-- Configurer service_role_key pour les cron jobs
ALTER DATABASE postgres SET app.settings.service_role_key = 'your-service-role-key';
SELECT pg_reload_conf();
```

---

## 8. DÉPLOIEMENT & INFRASTRUCTURE

### Stack technique
- **Frontend:** React + TypeScript + Vite
- **Backend:** Supabase (PostgreSQL + Edge Functions Deno)
- **Hosting:** Lovable.app
- **Automation:** n8n (self-hosted ou cloud)
- **Queue:** PGMQ (Postgres-based)
- **Cron:** pg_cron (Postgres extension)

### Dépendances Edge Functions
```typescript
// Deno imports (ESM)
"https://deno.land/std@0.168.0/http/server.ts"
"https://esm.sh/@supabase/supabase-js@2"
"https://esm.sh/resend@2.0.0"
```

---

## 9. ROADMAP / TODO

### Fonctionnalités manquantes
- [ ] Génération réelle d'embeddings (OpenAI API)
- [ ] Intégration vraie des stats Social Media (APIs LinkedIn/Twitter/Instagram)
- [ ] Dashboard analytics avancé
- [ ] Export CSV/Excel journalistes/articles
- [ ] Webhook signatures (sécurité n8n)
- [ ] Rate limiting sur Edge Functions
- [ ] Monitoring & alerting (Sentry, LogRocket)

### Améliorations techniques
- [ ] Tests unitaires (Deno.test pour Edge Functions)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Documentation OpenAPI (Swagger) pour Edge Functions
- [ ] Pagination server-side (articles, journalistes)
- [ ] Caching (Redis ou Supabase Realtime)

---

## 📚 RESSOURCES

### Documentation
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [PGMQ](https://github.com/tembo-io/pgmq)
- [pg_cron](https://github.com/citusdata/pg_cron)
- [pgvector](https://github.com/pgvector/pgvector)
- [Apify](https://docs.apify.com/)
- [Resend](https://resend.com/docs)

### Points de contact
- **Repo GitHub:** (à définir)
- **Supabase Project:** `lypodfdlpbpjdsswmsni`
- **URL Production:** `https://socialy1.lovable.app`

---

**✅ Document généré le 2026-01-18**
