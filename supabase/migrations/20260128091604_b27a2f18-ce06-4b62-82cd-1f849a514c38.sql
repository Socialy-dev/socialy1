SELECT cron.schedule(
  'persist-media-assets-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://lypodfdlpbpjdsswmsni.supabase.co/functions/v1/persist-media-cron',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cG9kZmRscGJwamRzc3dtc25pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4Mzk1MTUsImV4cCI6MjA4MzQxNTUxNX0.T6PH-7MpJ-YpfGO4rym2eCoM-xsgFID7nxvuaVLpelo"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);