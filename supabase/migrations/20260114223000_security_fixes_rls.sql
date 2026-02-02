-- =====================================================
-- Migration de sécurité - 2026-01-14
-- Ajout des politiques RLS manquantes
-- =====================================================

-- ===== user_linkedin_posts =====
-- Ajouter politique INSERT si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_linkedin_posts' 
        AND policyname = 'Users can insert their own linkedin posts'
    ) THEN
        CREATE POLICY "Users can insert their own linkedin posts"
        ON public.user_linkedin_posts
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- ===== organization_linkedin_posts =====
-- Ajouter politique INSERT pour les admins org
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'organization_linkedin_posts' 
        AND policyname = 'Org admins can insert posts'
    ) THEN
        CREATE POLICY "Org admins can insert posts"
        ON public.organization_linkedin_posts
        FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.organization_members om
                WHERE om.organization_id = organization_linkedin_posts.organization_id
                AND om.user_id = auth.uid()
                AND om.role IN ('org_admin', 'super_admin')
            )
        );
    END IF;
END $$;

-- Ajouter politique DELETE pour les admins org
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'organization_linkedin_posts' 
        AND policyname = 'Org admins can delete posts'
    ) THEN
        CREATE POLICY "Org admins can delete posts"
        ON public.organization_linkedin_posts
        FOR DELETE
        USING (
            EXISTS (
                SELECT 1 FROM public.organization_members om
                WHERE om.organization_id = organization_linkedin_posts.organization_id
                AND om.user_id = auth.uid()
                AND om.role IN ('org_admin', 'super_admin')
            )
        );
    END IF;
END $$;

-- ===== Vérification que toutes les tables ont RLS activé =====
-- Cette requête vérifie mais n'active pas automatiquement (pour éviter de casser des choses)
-- Elle crée une entrée de log si une table n'a pas RLS activé

DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE '_prisma_%'
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public'
            AND c.relname = table_record.tablename
            AND c.relrowsecurity = true
        ) THEN
            RAISE NOTICE 'WARNING: Table % does not have RLS enabled', table_record.tablename;
        END IF;
    END LOOP;
END $$;

-- Log de la migration
DO $$
BEGIN
    RAISE NOTICE 'Security migration completed successfully at %', now();
END $$;
