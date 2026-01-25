
ALTER TABLE public.market_watch_documents 
ADD COLUMN month text;

UPDATE public.market_watch_documents 
SET month = to_char(period_start, 'YYYY-MM')
WHERE month IS NULL;

ALTER TABLE public.market_watch_documents 
ALTER COLUMN month SET NOT NULL;

ALTER TABLE public.market_watch_documents 
DROP COLUMN period_start,
DROP COLUMN period_end;

ALTER TABLE public.market_watch_documents 
ADD CONSTRAINT market_watch_documents_org_month_unique 
UNIQUE (organization_id, month);
