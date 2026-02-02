-- Fonction trigger pour copier les posts LinkedIn dans documents
CREATE OR REPLACE FUNCTION public.copy_linkedin_post_to_documents()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert into documents table
    INSERT INTO public.documents (user_id, content, document_type, source_id, metadata)
    VALUES (
        NEW.user_id,
        NEW.content,
        'linkedin_post',
        NEW.id,
        jsonb_build_object('post_url', NEW.post_url, 'posted_at', NEW.posted_at)
    )
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- Trigger qui s'exécute après chaque INSERT
CREATE TRIGGER copy_linkedin_post_to_documents_trigger
AFTER INSERT ON public.user_linkedin_posts
FOR EACH ROW
EXECUTE FUNCTION public.copy_linkedin_post_to_documents();

-- Trigger pour UPDATE (mise à jour du document si le post change)
CREATE OR REPLACE FUNCTION public.update_linkedin_post_in_documents()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.documents
    SET 
        content = NEW.content,
        metadata = jsonb_build_object('post_url', NEW.post_url, 'posted_at', NEW.posted_at),
        updated_at = timezone('utc'::text, now())
    WHERE source_id = NEW.id AND document_type = 'linkedin_post';
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_linkedin_post_in_documents_trigger
AFTER UPDATE ON public.user_linkedin_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_linkedin_post_in_documents();

-- Trigger pour DELETE (supprime le document associé)
CREATE OR REPLACE FUNCTION public.delete_linkedin_post_from_documents()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.documents
    WHERE source_id = OLD.id AND document_type = 'linkedin_post';
    
    RETURN OLD;
END;
$$;

CREATE TRIGGER delete_linkedin_post_from_documents_trigger
AFTER DELETE ON public.user_linkedin_posts
FOR EACH ROW
EXECUTE FUNCTION public.delete_linkedin_post_from_documents();