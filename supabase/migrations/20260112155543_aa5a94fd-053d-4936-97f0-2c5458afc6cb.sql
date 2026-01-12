
DROP TRIGGER IF EXISTS extract_journalist_from_organization_article_trigger ON public.organization_articles;

CREATE OR REPLACE FUNCTION public.extract_journalist_from_organization_article()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.authors IS NOT NULL AND NEW.authors != '' THEN
        INSERT INTO public.journalists (organization_id, name, media, source_article_id, source_type)
        VALUES (NEW.organization_id, TRIM(NEW.authors), NEW.source_name, NEW.id, 'organization')
        ON CONFLICT (organization_id, name, media) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$function$;

CREATE TRIGGER extract_journalist_from_organization_article_trigger
AFTER INSERT ON public.organization_articles
FOR EACH ROW
EXECUTE FUNCTION public.extract_journalist_from_organization_article();
