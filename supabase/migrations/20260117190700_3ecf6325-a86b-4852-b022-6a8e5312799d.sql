SELECT cron.schedule(
  'fetch-organization-articles-cron',
  '0 4 1,15 * *',
  $$
  SELECT
    net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1) || '/functions/v1/fetch-organization-articles',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1)
      ),
      body := jsonb_build_object(
        'organization_id', org.id::text,
        'organization_name', org.name,
        'is_cron', true
      )
    )
  FROM organizations org;
  $$
);