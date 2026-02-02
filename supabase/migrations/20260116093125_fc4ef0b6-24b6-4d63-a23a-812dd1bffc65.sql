DROP TABLE IF EXISTS public.market_watch_topics;

CREATE TABLE public.market_watch_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  link TEXT NOT NULL,
  title TEXT,
  source_name TEXT,
  source_icon TEXT,
  authors TEXT,
  thumbnail TEXT,
  thumbnail_small TEXT,
  article_date TEXT,
  article_iso_date TIMESTAMP WITH TIME ZONE,
  snippet TEXT,
  position INTEGER,
  hidden BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT market_watch_topics_organization_id_link_key UNIQUE (organization_id, link)
);

ALTER TABLE public.market_watch_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view market watch topics"
ON public.market_watch_topics
FOR SELECT
USING (
  is_super_admin(auth.uid()) OR 
  (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);

CREATE POLICY "Org admins can insert market watch topics"
ON public.market_watch_topics
FOR INSERT
WITH CHECK (
  is_super_admin(auth.uid()) OR 
  (EXISTS (SELECT 1 FROM organization_members WHERE user_id = auth.uid() AND organization_id = market_watch_topics.organization_id AND role IN ('super_admin', 'org_admin')))
);

CREATE POLICY "Org admins can update market watch topics"
ON public.market_watch_topics
FOR UPDATE
USING (
  is_super_admin(auth.uid()) OR 
  (EXISTS (SELECT 1 FROM organization_members WHERE user_id = auth.uid() AND organization_id = market_watch_topics.organization_id AND role IN ('super_admin', 'org_admin')))
);

CREATE POLICY "Org admins can delete market watch topics"
ON public.market_watch_topics
FOR DELETE
USING (
  is_super_admin(auth.uid()) OR 
  (EXISTS (SELECT 1 FROM organization_members WHERE user_id = auth.uid() AND organization_id = market_watch_topics.organization_id AND role IN ('super_admin', 'org_admin')))
);