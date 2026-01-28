
ALTER TABLE public.competitor_articles 
ADD COLUMN IF NOT EXISTS detected_language TEXT,
ADD COLUMN IF NOT EXISTS title_fr TEXT;

ALTER TABLE public.client_articles 
ADD COLUMN IF NOT EXISTS detected_language TEXT,
ADD COLUMN IF NOT EXISTS title_fr TEXT;

ALTER TABLE public.market_watch_topics 
ADD COLUMN IF NOT EXISTS detected_language TEXT,
ADD COLUMN IF NOT EXISTS title_fr TEXT;

CREATE INDEX IF NOT EXISTS idx_competitor_articles_language ON public.competitor_articles(detected_language);
CREATE INDEX IF NOT EXISTS idx_client_articles_language ON public.client_articles(detected_language);
CREATE INDEX IF NOT EXISTS idx_market_watch_topics_language ON public.market_watch_topics(detected_language);

CREATE OR REPLACE FUNCTION public.trigger_detect_translate_title()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supabase_url text;
  payload jsonb;
BEGIN
  IF NEW.title IS NULL OR NEW.title = '' THEN
    RETURN NEW;
  END IF;
  
  supabase_url := 'https://lypodfdlpbpjdsswmsni.supabase.co';
  
  payload := jsonb_build_object(
    'record_id', NEW.id,
    'title', NEW.title,
    'table_name', TG_TABLE_NAME,
    'organization_id', NEW.organization_id
  );
  
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/detect-translate-title',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := payload
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_detect_translate_competitor_articles ON public.competitor_articles;
CREATE TRIGGER trigger_detect_translate_competitor_articles
  AFTER INSERT ON public.competitor_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_detect_translate_title();

DROP TRIGGER IF EXISTS trigger_detect_translate_client_articles ON public.client_articles;
CREATE TRIGGER trigger_detect_translate_client_articles
  AFTER INSERT ON public.client_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_detect_translate_title();

DROP TRIGGER IF EXISTS trigger_detect_translate_market_watch ON public.market_watch_topics;
CREATE TRIGGER trigger_detect_translate_market_watch
  AFTER INSERT ON public.market_watch_topics
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_detect_translate_title();
