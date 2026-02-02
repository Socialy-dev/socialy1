-- Activer l'extension pgvector
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Table pour stocker les posts LinkedIn des utilisateurs
CREATE TABLE public.user_linkedin_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    posted_at TIMESTAMP WITH TIME ZONE,
    post_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table générique pour les documents/embeddings (RAG)
CREATE TABLE public.documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    embedding extensions.vector(1536), -- Pour OpenAI embeddings
    document_type TEXT NOT NULL, -- 'linkedin_post', 'press_release', 'blog_article', etc.
    source_id UUID, -- ID de la source (user_linkedin_posts.id, etc.)
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index pour filtrer par type et user
CREATE INDEX idx_documents_user_type ON public.documents(user_id, document_type);
CREATE INDEX idx_documents_source ON public.documents(source_id);

-- Enable RLS
ALTER TABLE public.user_linkedin_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS policies pour user_linkedin_posts
CREATE POLICY "Users can view their own linkedin posts"
ON public.user_linkedin_posts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own linkedin posts"
ON public.user_linkedin_posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own linkedin posts"
ON public.user_linkedin_posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own linkedin posts"
ON public.user_linkedin_posts FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies pour documents
CREATE POLICY "Users can view their own documents"
ON public.documents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
ON public.documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
ON public.documents FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
ON public.documents FOR DELETE
USING (auth.uid() = user_id);

-- Triggers pour updated_at
CREATE TRIGGER update_user_linkedin_posts_updated_at
BEFORE UPDATE ON public.user_linkedin_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour recherche par similarité
CREATE OR REPLACE FUNCTION public.match_documents(
    query_embedding extensions.vector(1536),
    match_count int DEFAULT 5,
    filter_user_id uuid DEFAULT NULL,
    filter_document_type text DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    content text,
    document_type text,
    source_id uuid,
    metadata jsonb,
    similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id,
        d.content,
        d.document_type,
        d.source_id,
        d.metadata,
        1 - (d.embedding <=> query_embedding) AS similarity
    FROM public.documents d
    WHERE 
        (filter_user_id IS NULL OR d.user_id = filter_user_id)
        AND (filter_document_type IS NULL OR d.document_type = filter_document_type)
        AND d.embedding IS NOT NULL
    ORDER BY d.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;