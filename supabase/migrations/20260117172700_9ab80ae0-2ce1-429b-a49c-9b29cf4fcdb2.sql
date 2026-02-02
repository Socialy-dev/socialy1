-- Supprimer l'ancien cron job avec la mauvaise URL
SELECT cron.unschedule(1);

-- Créer le nouveau cron job avec la bonne URL (toutes les 5 minutes)
SELECT cron.schedule(
  'journalist-enrichment-worker',
  '*/5 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://lypodfdlpbpjdsswmsni.supabase.co/functions/v1/journalist-enrichment-worker',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cG9kZmRscGJwamRzc3dtc25pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgzOTUxNSwiZXhwIjoyMDgzNDE1NTE1fQ.1w02uL7RaYh0AnIfDiIXdQl8yRA43obxzEGx7UWi_0Q"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);