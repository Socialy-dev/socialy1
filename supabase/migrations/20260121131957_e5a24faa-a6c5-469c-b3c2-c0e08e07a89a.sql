ALTER TABLE public.paid_insights 
DROP CONSTRAINT IF EXISTS paid_insights_campaign_id_fkey;

ALTER TABLE public.paid_insights 
ALTER COLUMN campaign_id TYPE TEXT USING campaign_id::TEXT;