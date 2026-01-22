ALTER TABLE public.market_watch_topics 
ADD COLUMN search_topic TEXT;

CREATE INDEX idx_market_watch_topics_search_topic ON public.market_watch_topics(search_topic);

COMMENT ON COLUMN public.market_watch_topics.search_topic IS 'The original search topic/query that was requested by the user';