CREATE OR REPLACE FUNCTION public.notify_new_journalist()
RETURNS TRIGGER AS $$
DECLARE
  payload jsonb;
  supabase_url text;
BEGIN
  supabase_url := current_setting('app.settings.supabase_url', true);
  
  IF supabase_url IS NULL THEN
    supabase_url := 'https://lypodfdlpbpjdsswmsni.supabase.co';
  END IF;

  payload := jsonb_build_object(
    'journalist_id', NEW.id,
    'name', NEW.name,
    'media', NEW.media,
    'email', NEW.email,
    'organization_id', NEW.organization_id
  );

  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/notify-new-journalist',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := payload
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_notify_new_journalist ON public.journalists;

CREATE TRIGGER trigger_notify_new_journalist
AFTER INSERT ON public.journalists
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_journalist();