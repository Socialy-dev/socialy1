-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests (needed for calling Edge Functions)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the journalist enrichment worker to run every 30 seconds
-- This will poll the queue and process any pending enrichment jobs
SELECT cron.schedule(
  'process-journalist-enrichment-queue',
  '30 seconds',
  $$
  SELECT net.http_post(
    url := 'https://lypodfdlpbpjdsswmsni.supabase.co/functions/v1/journalist-enrichment-worker',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    )
  ) AS request_id;
  $$
);

-- Note: You need to set the service role key in Supabase settings:
-- ALTER DATABASE postgres SET app.settings.service_role_key = 'your-service-role-key-here';
--
-- This can be done via Supabase dashboard or SQL editor:
-- 1. Go to Project Settings > Database > Connection string
-- 2. Copy your service_role key
-- 3. Run: ALTER DATABASE postgres SET app.settings.service_role_key = 'eyJhbG...';
-- 4. Run: SELECT pg_reload_conf();

-- Optional: View scheduled jobs
-- SELECT * FROM cron.job;

-- Optional: View job execution history
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- Optional: Unschedule the job (if needed)
-- SELECT cron.unschedule('process-journalist-enrichment-queue');
