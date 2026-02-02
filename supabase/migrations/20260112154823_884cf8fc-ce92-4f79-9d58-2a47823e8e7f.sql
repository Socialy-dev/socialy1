
DROP TRIGGER IF EXISTS extract_journalist_from_competitor_article_trigger ON public.competitor_articles;

CREATE OR REPLACE FUNCTION public.extract_journalist_from_competitor_article()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.authors IS NOT NULL AND NEW.authors != '' THEN
        INSERT INTO public.journalists (organization_id, name, media, source_article_id, source_type, competitor_name)
        VALUES (NEW.organization_id, TRIM(NEW.authors), NEW.source_name, NEW.id, 'competitor', NEW.competitor_name)
        ON CONFLICT (organization_id, name, media) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$function$;

DROP INDEX IF EXISTS journalists_user_name_media_unique;
ALTER TABLE public.journalists DROP CONSTRAINT IF EXISTS journalists_user_id_name_media_key;

ALTER TABLE public.journalists
ADD CONSTRAINT journalists_org_name_media_unique 
UNIQUE (organization_id, name, media);

CREATE TRIGGER extract_journalist_from_competitor_article_trigger
AFTER INSERT ON public.competitor_articles
FOR EACH ROW
EXECUTE FUNCTION public.extract_journalist_from_competitor_article();
